import { useI18n } from '../i18n/I18nContext.jsx';
import { useSeo } from '../lib/hooks.js';
import { SHOPIFY } from '../shopify/config.js';

// Orders live in Shopify. Customers follow them through the link in their confirmation email
// or by signing in to Shopify customer accounts with the email address they used.
export const accountUrl = () => SHOPIFY.accountUrl || (SHOPIFY.domain ? `https://${SHOPIFY.domain}/account` : '');

export default function Track() {
  const { t } = useI18n();
  useSeo({ title: t('order.lookupTitle') });
  return (
    <div className="container narrow-page">
      <h1>{t('order.lookupTitle')}</h1>
      <div className="panel">
        <p>{t('order.lookupText')}</p>
        {accountUrl() && <a className="btn btn--solid" href={accountUrl()}>{t('order.openAccount')}</a>}
      </div>
    </div>
  );
}
