import { useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useSeo } from '../lib/hooks.js';
import { CheckIcon } from '../components/Icons.jsx';
import { accountUrl } from './Track.jsx';

// Payment and the order confirmation happen on Shopify checkout. This page is only a landing
// spot if the Shopify thank-you page links back here (e.g. /order/1001).
export default function Order() {
  const { number } = useParams();
  const { t } = useI18n();
  const cart = useCart();
  useSeo({ title: t('order.thanks') });
  useEffect(() => { cart.refresh(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <div className="container order-page">
      <div className="order-hero is-paid">
        <span className="order-hero__icon"><CheckIcon width={32} height={32} /></span>
        <h1>{t('order.thanks')}</h1>
        {number && number !== 'thanks' && <p className="muted">{t('order.title', { n: number })}</p>}
        <p>{t('order.placedText')}</p>
        {accountUrl() && <a className="btn btn--outline" href={accountUrl()}>{t('order.openAccount')}</a>}
        <Link className="btn btn--solid" to="/shop">{t('cart.continue')}</Link>
      </div>
    </div>
  );
}
