import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import CartLines from './CartLines.jsx';
import { Drawer, useErrorMessage } from './ui.jsx';

export default function CartDrawer() {
  const { cart, open, setOpen } = useCart();
  const { t, price } = useI18n();
  const nav = useNavigate();
  const errMsg = useErrorMessage();
  const [err, setErr] = useState(null);
  const lines = cart?.lines || [];
  const close = () => setOpen(false);
  const go = (to) => { close(); nav(to); };

  // Distance to free shipping for the cheapest paid method.
  const ship = cart?.shipping;
  const away = ship?.freeOver && ship.price > 0 ? ship.freeOver - (cart.subtotal - cart.discount) : null;

  return (
    <Drawer open={open} onClose={close} title={t('cart.title')}
      footer={lines.length > 0 && (
        <>
          {away > 0 && <p className="free-bar">{t('cart.awayFree', { amount: price(away) })}
            <span style={{ '--p': `${Math.min(100, ((cart.subtotal - cart.discount) / ship.freeOver) * 100)}%` }} /></p>}
          <div className="sum-row"><span>{t('cart.subtotal')}</span><strong>{price(cart.subtotal)}</strong></div>
          {cart.discount > 0 && <div className="sum-row"><span>{t('cart.discount')}</span><span>−{price(cart.discount)}</span></div>}
          <button className="btn btn--solid btn--block" onClick={() => go('/checkout')} disabled={!cart.canCheckout}>{t('cart.checkout')}</button>
          <button className="btn btn--outline btn--block" onClick={() => go('/cart')}>{t('cart.view')}</button>
        </>
      )}>
      {err && <p className="notice notice--err" role="alert">{errMsg(err)}</p>}
      {lines.length === 0 ? (
        <div className="state">
          <p>{t('cart.empty')}</p>
          <Link to="/shop" className="btn btn--outline" onClick={close}>{t('cart.continue')}</Link>
        </div>
      ) : <CartLines lines={lines} onError={setErr} />}
    </Drawer>
  );
}
