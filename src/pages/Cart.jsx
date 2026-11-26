import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useSeo } from '../lib/hooks.js';
import CartLines from '../components/CartLines.jsx';
import { COUNTRIES, CouponForm, ShippingChoice, Totals, countryName } from '../components/Summary.jsx';
import { Loading, useErrorMessage } from '../components/ui.jsx';

export default function Cart() {
  const cart = useCart();
  const { t, lang } = useI18n();
  const nav = useNavigate();
  const errMsg = useErrorMessage();
  const [err, setErr] = useState(null);
  useSeo({ title: t('cart.title') });
  const c = cart.cart;

  if (!c && cart.token() && !cart.error) return <div className="container"><Loading /></div>;
  if (!c || !c.lines.length) {
    return (
      <div className="container state state--page">
        <h1>{t('cart.title')}</h1>
        <p className="muted">{t('cart.empty')}</p>
        <Link to="/shop" className="btn btn--solid">{t('cart.continue')}</Link>
      </div>
    );
  }
  const hasIssues = c.lines.some((l) => l.issue);

  return (
    <div className="container cart-page">
      <h1>{t('cart.title')}</h1>
      <div className="two-col">
        <section>
          {err && <p className="notice notice--err" role="alert">{errMsg(err)}</p>}
          <CartLines lines={c.lines} onError={setErr} />
          <Link to="/shop" className="link">← {t('cart.continue')}</Link>
        </section>
        <aside className="panel">
          <CouponForm />
          <div className="field">
            <label htmlFor="ship-country">{t('cart.shipTo')}</label>
            <select id="ship-country" value={cart.country} onChange={(e) => cart.setShippingOptions({ country: e.target.value, shipping: undefined })}>
              {COUNTRIES.map((code) => <option key={code} value={code}>{countryName(code, lang)}</option>)}
            </select>
          </div>
          <ShippingChoice cart={c} onChange={(code) => cart.setShippingOptions({ shipping: code })} />
          <Totals cart={c} />
          {hasIssues && <p className="notice notice--err" role="alert">{t('cart.fixIssues')}</p>}
          <button className="btn btn--solid btn--block" disabled={!c.canCheckout} onClick={() => nav('/checkout')}>{t('cart.checkout')}</button>
          <p className="muted small">{t('co.guest')}</p>
        </aside>
      </div>
    </div>
  );
}
