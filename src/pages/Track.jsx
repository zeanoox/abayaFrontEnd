import { useState } from 'react';
import { api } from '../api.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useSeo } from '../lib/hooks.js';
import { useErrorMessage } from '../components/ui.jsx';
import { OrderView } from './Order.jsx';

export default function Track() {
  const { t } = useI18n();
  const errMsg = useErrorMessage();
  const [number, setNumber] = useState('');
  const [email, setEmail] = useState('');
  const [order, setOrder] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);
  useSeo({ title: t('order.lookupTitle') });

  async function submit(e) {
    e.preventDefault();
    setBusy(true);
    setErr(null);
    try {
      setOrder(await api('/orders/lookup', { method: 'POST', body: { number: number.trim(), email: email.trim() } }));
    } catch (error) {
      setOrder(null);
      setErr(error);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="container narrow-page">
      <h1>{t('order.lookupTitle')}</h1>
      <p className="muted">{t('order.lookupText')}</p>
      <form className="panel" onSubmit={submit}>
        <div className="field-row">
          <div className="field">
            <label htmlFor="tr-num">{t('order.number')}</label>
            <input id="tr-num" required placeholder="LR-10001" value={number} onChange={(e) => setNumber(e.target.value)} dir="ltr" maxLength={12} />
          </div>
          <div className="field">
            <label htmlFor="tr-email">{t('co.email')}</label>
            <input id="tr-email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} maxLength={200} />
          </div>
        </div>
        {err && <p className="notice notice--err" role="alert">{err.status === 404 || err.status === 400 ? t('order.notFound') : errMsg(err)}</p>}
        <button className="btn btn--solid" disabled={busy}>{t('order.find')}</button>
      </form>
      {order && <OrderView order={order} />}
    </div>
  );
}
