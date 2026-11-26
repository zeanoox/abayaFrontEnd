import { useEffect, useMemo, useState } from 'react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { HeartIcon } from './Icons.jsx';
import { Price, useErrorMessage } from './ui.jsx';
import SizeGuide from './SizeGuide.jsx';

/**
 * Colour / size / length selection + add to cart.
 * Options that can't be bought with the current selection are disabled, so customers
 * can only add a valid, in-stock variant.
 */
export default function VariantPicker({ product, color, onColorChange, compact = false }) {
  const { t, tr } = useI18n();
  const cart = useCart();
  const wish = useWishlist();
  const errMsg = useErrorMessage();
  const [size, setSize] = useState(product.sizes.length === 1 ? product.sizes[0] : null);
  const [length, setLength] = useState(null);
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState(null);
  const [guide, setGuide] = useState(false);

  const hasLength = product.lengths.length > 0;
  const needsSize = product.sizes.length > 1;
  const v = product.variants;

  const matches = (x, sel) => (!sel.color || x.color === sel.color) && (!sel.size || x.size === sel.size)
    && (!sel.length || x.length === sel.length);
  const canBuy = (sel) => v.some((x) => matches(x, sel) && x.available > 0);

  const variant = useMemo(() => v.find((x) => x.color === color && (!needsSize || x.size === size)
    && (!hasLength || x.length === length)), [v, color, size, length, needsSize, hasLength]);

  // Drop a selection that became impossible after changing another option.
  useEffect(() => {
    if (size && needsSize && !canBuy({ color, size })) setSize(null);
    if (length && !canBuy({ color, size, length })) setLength(null);
    setMsg(null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color, size]);
  useEffect(() => { if (variant && qty > variant.available) setQty(Math.max(1, variant.available)); }, [variant, qty]);

  const missing = !color ? t('pdp.color').toLowerCase() : needsSize && !size ? t('pdp.size').toLowerCase()
    : hasLength && !length ? t('pdp.length').toLowerCase() : null;
  const soldOut = variant && variant.available === 0;
  const colors = product.colors;

  async function add() {
    if (!variant || soldOut) return;
    setBusy(true);
    setMsg(null);
    try {
      await cart.add(variant.id, qty);
      setMsg({ ok: true, text: t('pdp.added') });
    } catch (err) {
      setMsg({ ok: false, text: errMsg(err) });
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="picker">
      <div className="picker__price">
        {variant
          ? <Price price={variant.compareAt ?? variant.price} salePrice={variant.compareAt != null ? variant.price : null} />
          : <Price price={product.price} salePrice={product.salePrice} />}
      </div>

      {colors.length > 0 && (
        <fieldset className="opt">
          <legend>{t('pdp.color')}: <strong>{tr(colors.find((c) => c.code === color)?.name)}</strong></legend>
          <div className="swatches">
            {colors.map((c) => (
              <label key={c.code} className={`swatch swatch--lg ${c.inStock ? '' : 'is-out'}`} style={{ '--c': c.hex }} title={tr(c.name)}>
                <input type="radio" name={`color-${product.slug}`} value={c.code} checked={color === c.code}
                  onChange={() => onColorChange(c.code)} />
                <span className="sr-only">{tr(c.name)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {needsSize && (
        <fieldset className="opt">
          <div className="opt__head">
            <legend>{t('pdp.size')}{size && <>: <strong>{size}</strong></>}</legend>
            {!compact && <button type="button" className="link-btn" onClick={() => setGuide(true)}>{t('pdp.sizeGuide')}</button>}
          </div>
          <div className="chips">
            {product.sizes.map((s) => {
              const ok = canBuy({ color, size: s });
              return (
                <label key={s} className={`chip chip--opt ${ok ? '' : 'is-out'}`}>
                  <input type="radio" name={`size-${product.slug}`} value={s} checked={size === s} disabled={!ok}
                    onChange={() => setSize(s)} />
                  <span>{s}</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      {hasLength && (
        <fieldset className="opt">
          <legend>{t('pdp.length')}{length && <>: <strong>{length}″</strong></>}</legend>
          <div className="chips">
            {product.lengths.map((l) => {
              const ok = canBuy({ color, size, length: l });
              return (
                <label key={l} className={`chip chip--opt ${ok ? '' : 'is-out'}`}>
                  <input type="radio" name={`len-${product.slug}`} value={l} checked={length === l} disabled={!ok}
                    onChange={() => setLength(l)} />
                  <span>{l}″</span>
                </label>
              );
            })}
          </div>
        </fieldset>
      )}

      <p className={`stock ${variant ? (soldOut ? 'stock--out' : variant.lowStock ? 'stock--low' : 'stock--ok') : ''}`} aria-live="polite">
        {!variant ? (missing ? t('pdp.choose', { what: missing }) : t('pdp.unavailable'))
          : soldOut ? t('pdp.soldOut')
            : variant.lowStock ? t('pdp.lowStock', { n: variant.available }) : t('pdp.inStock')}
        {variant && <span className="stock__sku"> · {t('pdp.sku')} {variant.sku}</span>}
      </p>

      <div className="picker__buy">
        <div className="qty" role="group" aria-label={t('pdp.qty')}>
          <button type="button" onClick={() => setQty((q) => Math.max(1, q - 1))} aria-label={t('cart.dec')} disabled={qty <= 1}>−</button>
          <span aria-live="polite">{qty}</span>
          <button type="button" onClick={() => setQty((q) => Math.min(variant?.available || 1, q + 1))} aria-label={t('cart.inc')}
            disabled={!variant || qty >= variant.available}>+</button>
        </div>
        <button type="button" className="btn btn--solid btn--block" onClick={add} disabled={!variant || soldOut || busy}>
          {busy ? t('pdp.adding') : soldOut ? t('pdp.soldOut') : !variant ? t('pdp.chooseOptions') : t('pdp.add')}
        </button>
        {!compact && (
          <button type="button" className={`icon-btn icon-btn--box ${wish.has(product.slug) ? 'is-liked' : ''}`}
            onClick={() => wish.toggle(product)} aria-pressed={wish.has(product.slug)}
            aria-label={wish.has(product.slug) ? t('card.removeWish') : t('card.addWish')}>
            <HeartIcon filled={wish.has(product.slug)} />
          </button>
        )}
      </div>
      {msg && <p className={`notice ${msg.ok ? 'notice--ok' : 'notice--err'}`} role="status">{msg.text}</p>}
      <SizeGuide open={guide} onClose={() => setGuide(false)} />
    </div>
  );
}
