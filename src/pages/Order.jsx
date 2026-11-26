import { useEffect, useRef, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api, img } from '../api.js';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useSeo } from '../lib/hooks.js';
import { date } from '../lib/format.js';
import { ErrorState, Loading } from '../components/ui.jsx';
import { CheckIcon } from '../components/Icons.jsx';
import { countryName } from '../components/Summary.jsx';

export function OrderView({ order }) {
  const { t, tr, price, lang } = useI18n();
  return (
    <div className="two-col">
      <section className="panel">
        <h2 className="h4">{t('order.items')}</h2>
        <ul className="lines">
          {order.items.map((i) => (
            <li key={i.sku} className="line">
              <span className="line__thumb">{i.image && <img src={img(i.image)} alt="" width="90" height="120" />}</span>
              <div className="line__info">
                <strong>{tr(i.name)}</strong>
                <span className="muted">{i.variant}</span>
                <span className="muted">{i.quantity} × {price(i.unitPrice)}</span>
              </div>
              <strong className="line__total">{price(i.lineTotal)}</strong>
            </li>
          ))}
        </ul>
      </section>
      <aside className="panel">
        <dl className="totals">
          <div className="sum-row"><dt>{t('order.status')}</dt><dd><span className={`status status--${order.status}`}>{t(`status.${order.status}`)}</span></dd></div>
          <div className="sum-row"><dt>{t('cart.subtotal')}</dt><dd>{price(order.subtotal)}</dd></div>
          {order.discount > 0 && <div className="sum-row sum-row--disc"><dt>{t('cart.discount')}{order.couponCode ? ` (${order.couponCode})` : ''}</dt><dd>−{price(order.discount)}</dd></div>}
          <div className="sum-row"><dt>{t('cart.shipping')} · {order.shippingName}</dt><dd>{order.shippingCost ? price(order.shippingCost) : t('cart.free')}</dd></div>
          <div className="sum-row sum-row--total"><dt>{t('cart.total')}</dt><dd>{price(order.total)}</dd></div>
        </dl>
        <p className="muted small">{date(order.createdAt, lang)}</p>
        {order.shippingAddress && (
          <>
            <h3 className="h5">{t('order.shipTo')}</h3>
            <address>
              {order.fullName}<br />{order.shippingAddress.line1}{order.shippingAddress.line2 && <>, {order.shippingAddress.line2}</>}<br />
              {order.shippingAddress.postalCode} {order.shippingAddress.city}<br />{countryName(order.shippingAddress.country, lang)}
            </address>
          </>
        )}
        {order.shipments?.map((s) => s.tracking_url && (
          <a key={s.tracking_url} href={s.tracking_url} target="_blank" rel="noopener noreferrer" className="btn btn--outline">{t('order.tracking')}</a>
        ))}
      </aside>
    </div>
  );
}

export default function Order() {
  const { number } = useParams();
  const [params] = useSearchParams();
  const token = params.get('token');
  const { t } = useI18n();
  const cart = useCart();
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);
  const tries = useRef(0);
  useSeo({ title: t('order.title', { n: number }) });

  useEffect(() => {
    let timer;
    let stop = false;
    async function load() {
      try {
        // The backend checks the payment with Mollie before answering — this page cannot mark anything as paid.
        const o = await api(`/orders/${encodeURIComponent(number)}?token=${encodeURIComponent(token || '')}`);
        if (stop) return;
        setOrder(o);
        setError(null);
        if (o.status === 'PENDING_PAYMENT' && tries.current++ < 40) timer = setTimeout(load, 3000);
        else cart.refresh(); // paid orders empty the cart server-side
      } catch (err) {
        if (!stop) setError(err);
      }
    }
    load();
    return () => { stop = true; clearTimeout(timer); };
  }, [number, token]); // eslint-disable-line react-hooks/exhaustive-deps

  if (error) return <div className="container"><ErrorState error={error} /></div>;
  if (!order) return <div className="container"><Loading /></div>;

  const paid = ['PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED'].includes(order.status);
  return (
    <div className="container order-page">
      <div className={`order-hero ${paid ? 'is-paid' : ''}`}>
        {paid && <span className="order-hero__icon"><CheckIcon width={32} height={32} /></span>}
        {order.status === 'PENDING_PAYMENT' && <span className="spinner" aria-hidden="true" />}
        <h1>{paid ? t('order.thanks') : order.status === 'CANCELLED' ? t('order.cancelled') : order.status === 'PENDING_PAYMENT' ? t('order.pending') : t(`status.${order.status}`)}</h1>
        <p className="muted">{t('order.title', { n: order.number })}</p>
        <p>{paid ? t('order.paidText') : order.status === 'CANCELLED' ? t('order.cancelledText') : order.status === 'PENDING_PAYMENT' ? t('order.pendingText') : ''}</p>
        {order.payment?.checkoutUrl && <a className="btn btn--solid" href={order.payment.checkoutUrl}>{t('order.completePayment')}</a>}
        {order.status === 'CANCELLED' && <Link className="btn btn--solid" to="/cart">{t('order.backToCart')}</Link>}
      </div>
      <OrderView order={order} />
    </div>
  );
}
