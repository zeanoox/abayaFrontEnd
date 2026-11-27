import { useState } from 'react';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useCart } from '../context/CartContext.jsx';

export function CouponForm() {
  const { t, price } = useI18n();
  const { cart, applyCoupon, removeCoupon } = useCart();
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const c = cart?.coupon;

  async function submit(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setBusy(true);
    try { await applyCoupon(code.trim()); setCode(''); } catch { /* shown via coupon state */ } finally { setBusy(false); }
  }

  return (
    <div className="coupon">
      {c && (
        <p className={`notice ${c.valid ? 'notice--ok' : 'notice--err'}`} role="status">
          <strong>{c.code}</strong> — {c.valid ? '✓' : t(`coupon.${c.error}`, { amount: price(c.minSubtotal) })}
          <button className="link-btn" onClick={() => removeCoupon()}>{t('cart.removeCoupon')}</button>
        </p>
      )}
      <form className="inline-form" onSubmit={submit}>
        <label htmlFor="coupon" className="sr-only">{t('cart.coupon')}</label>
        <input id="coupon" value={code} onChange={(e) => setCode(e.target.value.toUpperCase())} placeholder={t('cart.coupon')}
          maxLength={40} autoComplete="off" />
        <button className="btn btn--outline" disabled={busy || !code.trim()}>{t('cart.apply')}</button>
      </form>
    </div>
  );
}

export function Totals({ cart }) {
  const { t, price } = useI18n();
  return (
    <>
    <dl className="totals">
      <div className="sum-row"><dt>{t('cart.subtotal')}</dt><dd>{price(cart.subtotal)}</dd></div>
      {cart.discount > 0 && <div className="sum-row sum-row--disc"><dt>{t('cart.discount')}{cart.coupon?.valid ? ` (${cart.coupon.code})` : ''}</dt><dd>−{price(cart.discount)}</dd></div>}
      <div className="sum-row"><dt>{t('cart.shipping')}</dt><dd>{cart.shipping ? (cart.shippingCost === 0 ? t('cart.free') : price(cart.shippingCost)) : '—'}</dd></div>
      <div className="sum-row sum-row--total"><dt>{t('cart.total')}</dt><dd>{price(cart.total)}</dd></div>
    </dl>
    {cart.shippingCost > 0 && <p className="muted small">{t('co.shipNote')}</p>}
    </>
  );
}

export const COUNTRIES = ['NL', 'BE', 'DE', 'FR', 'LU', 'AT', 'ES', 'IT', 'DK', 'SE', 'IE', 'PL'];

export function countryName(code, lang) {
  try {
    return new Intl.DisplayNames([lang === 'ar' ? 'ar' : lang], { type: 'region' }).of(code);
  } catch {
    return code;
  }
}

export function ShippingChoice({ cart, onChange, name = 'shipping' }) {
  const { t, tr, price } = useI18n();
  if (!cart.shippingOptions.length) return <p className="notice notice--err">{t('cart.noShipping')}</p>;
  return (
    <div className="ship-opts" role="radiogroup">
      {cart.shippingOptions.map((o) => (
        <label key={o.code} className={`ship-opt ${cart.shipping?.code === o.code ? 'is-active' : ''}`}>
          <input type="radio" name={name} value={o.code} checked={cart.shipping?.code === o.code} onChange={() => onChange(o.code)} />
          <span className="ship-opt__name">{tr(o.name)}
            <small className="muted">{o.maxDays <= 1 && o.price === 0 && o.regularPrice === 0 ? t('cart.dayPickup') : t('cart.days', { a: o.minDays, b: o.maxDays })}
              {o.freeOver && o.price > 0 ? ` · ${t('cart.freeFrom', { amount: price(o.freeOver) })}` : ''}</small>
          </span>
          <strong>{o.price === 0 ? t('cart.free') : price(o.price)}</strong>
        </label>
      ))}
    </div>
  );
}
