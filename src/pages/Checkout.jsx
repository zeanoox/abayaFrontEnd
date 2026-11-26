import { useEffect, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { api } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useSeo } from '../lib/hooks.js';
import CartLines from '../components/CartLines.jsx';
import { COUNTRIES, CouponForm, ShippingChoice, Totals, countryName } from '../components/Summary.jsx';
import { Loading, useErrorMessage } from '../components/ui.jsx';
import { ShieldIcon } from '../components/Icons.jsx';

const SAVED = 'lorim-checkout';
const EMPTY = { fullName: '', email: '', phone: '', line1: '', line2: '', city: '', postalCode: '', country: 'NL' };
const POSTAL = { NL: /^[1-9][0-9]{3}\s?[A-Za-z]{2}$/, BE: /^[1-9][0-9]{3}$/, DE: /^[0-9]{5}$/, FR: /^[0-9]{5}$/, LU: /^[0-9]{4}$/ };

function validate(f, t) {
  const e = {};
  for (const k of ['fullName', 'email', 'phone', 'line1', 'city', 'postalCode']) if (!f[k].trim()) e[k] = t('co.required');
  if (f.email && !/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(f.email.trim())) e.email = t('co.invalidEmail');
  if (f.phone && !/^\+?[0-9 ()-]{8,20}$/.test(f.phone.trim())) e.phone = t('co.invalidPhone');
  if (f.postalCode && !(POSTAL[f.country] || /^[A-Za-z0-9 -]{3,10}$/).test(f.postalCode.trim())) e.postalCode = t('co.invalidPostal');
  return e;
}

// API field paths -> form field names.
const FIELD = { 'customer.fullName': 'fullName', 'customer.email': 'email', 'customer.phone': 'phone', 'address.line1': 'line1',
  'address.city': 'city', 'address.postalCode': 'postalCode', 'address.country': 'country' };

export default function Checkout() {
  const cart = useCart();
  const { t, lang, price } = useI18n();
  const errMsg = useErrorMessage();
  useSeo({ title: t('co.title') });

  const [f, setF] = useState(() => {
    // Remember contact details on this device (never payment data).
    try { return { ...EMPTY, ...JSON.parse(sessionStorage.getItem(SAVED) || '{}') }; } catch { return EMPTY; }
  });
  const [errors, setErrors] = useState({});
  const [busy, setBusy] = useState(false);
  const [formErr, setFormErr] = useState(null);

  useEffect(() => { try { sessionStorage.setItem(SAVED, JSON.stringify(f)); } catch { /* ignore */ } }, [f]);
  // Keep shipping options in sync with the chosen country.
  useEffect(() => {
    if (cart.country !== f.country) cart.setShippingOptions({ country: f.country, shipping: undefined });
  }, [f.country]); // eslint-disable-line react-hooks/exhaustive-deps

  const c = cart.cart;
  if (!c && cart.token() && !cart.error) return <div className="container"><Loading /></div>;
  if (!c || !c.lines.length) return <Navigate to="/cart" replace />;

  const set = (k) => (e) => {
    const { value } = e.target;
    setF((prev) => ({ ...prev, [k]: value }));
    setErrors((prev) => (prev[k] ? { ...prev, [k]: undefined } : prev));
  };

  async function submit(e) {
    e.preventDefault();
    const v = validate(f, t);
    setErrors(v);
    setFormErr(null);
    if (Object.keys(v).length) {
      document.getElementById(`co-${Object.keys(v)[0]}`)?.focus();
      return;
    }
    setBusy(true);
    try {
      const res = await api('/checkout', {
        method: 'POST',
        body: {
          cartToken: cart.token(),
          locale: lang,
          customer: { fullName: f.fullName, email: f.email, phone: f.phone },
          address: { line1: f.line1, line2: f.line2 || undefined, city: f.city, postalCode: f.postalCode, country: f.country },
          shippingMethod: c.shipping.code,
          expectedTotal: c.total,
        },
      });
      window.location.assign(res.checkoutUrl); // off to Mollie
    } catch (err) {
      setBusy(false);
      if (err.code === 'VALIDATION') {
        const fe = {};
        for (const x of err.body.fields || []) if (FIELD[x.path]) fe[FIELD[x.path]] = t('co.required');
        setErrors(fe);
      }
      setFormErr(err);
      if (['CART_CHANGED', 'PRICE_CHANGED', 'COUPON_INVALID', 'OUT_OF_STOCK'].includes(err.code)) cart.refresh();
    }
  }

  const field = (k, label, props = {}) => (
    <div className={`field ${errors[k] ? 'has-error' : ''}`}>
      <label htmlFor={`co-${k}`}>{label}</label>
      <input id={`co-${k}`} value={f[k]} onChange={set(k)} aria-invalid={Boolean(errors[k])}
        aria-describedby={errors[k] ? `co-${k}-err` : undefined} {...props} />
      {errors[k] && <span id={`co-${k}-err`} className="field__err">{errors[k]}</span>}
    </div>
  );

  return (
    <div className="container checkout">
      <h1>{t('co.title')}</h1>
      <form className="two-col" onSubmit={submit} noValidate>
        <div>
          <p className="muted">{t('co.guest')}</p>
          <fieldset className="panel">
            <legend>{t('co.contact')}</legend>
            {field('fullName', t('co.fullName'), { autoComplete: 'name', maxLength: 120 })}
            <div className="field-row">
              {field('email', t('co.email'), { type: 'email', autoComplete: 'email', maxLength: 200, inputMode: 'email' })}
              {field('phone', t('co.phone'), { type: 'tel', autoComplete: 'tel', maxLength: 20, inputMode: 'tel', dir: 'ltr' })}
            </div>
          </fieldset>

          <fieldset className="panel">
            <legend>{t('co.address')}</legend>
            <div className="field">
              <label htmlFor="co-country">{t('co.country')}</label>
              <select id="co-country" value={f.country} onChange={set('country')} autoComplete="country">
                {COUNTRIES.map((code) => <option key={code} value={code}>{countryName(code, lang)}</option>)}
              </select>
            </div>
            {field('line1', t('co.line1'), { autoComplete: 'address-line1', maxLength: 160 })}
            {field('line2', t('co.line2'), { autoComplete: 'address-line2', maxLength: 160 })}
            <div className="field-row">
              {field('postalCode', t('co.postalCode'), { autoComplete: 'postal-code', maxLength: 12, dir: 'ltr' })}
              {field('city', t('co.city'), { autoComplete: 'address-level2', maxLength: 80 })}
            </div>
          </fieldset>

          <fieldset className="panel">
            <legend>{t('co.shippingMethod')}</legend>
            <ShippingChoice cart={c} onChange={(code) => cart.setShippingOptions({ shipping: code })} name="co-shipping" />
          </fieldset>
        </div>

        <aside className="panel summary">
          <h2 className="h4">{t('co.summary')}</h2>
          <CartLines lines={c.lines} readOnly />
          <CouponForm />
          <Totals cart={c} />
          {c.lines.some((l) => l.issue) && <p className="notice notice--err" role="alert">{t('cart.fixIssues')} <Link to="/cart">{t('co.backToCart')}</Link></p>}
          {formErr && <p className="notice notice--err" role="alert">{errMsg(formErr)}</p>}
          <button className="btn btn--solid btn--block btn--lg" disabled={busy || !c.canCheckout}>
            {busy ? t('co.paying') : t('co.pay', { amount: price(c.total) })}
          </button>
          <p className="muted small with-icon"><ShieldIcon width={18} height={18} /> {t('co.secure')}</p>
          <p className="muted small">{t('co.terms')}</p>
          <Link to="/cart" className="link">← {t('co.backToCart')}</Link>
        </aside>
      </form>
    </div>
  );
}
