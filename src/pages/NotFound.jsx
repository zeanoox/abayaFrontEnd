import { Link } from 'react-router-dom';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useSeo } from '../lib/hooks.js';

export default function NotFound() {
  const { t } = useI18n();
  useSeo({ title: t('common.notFound') });
  return (
    <div className="container state state--page">
      <h1>{t('common.notFound')}</h1>
      <p className="muted">{t('common.notFoundText')}</p>
      <Link to="/shop" className="btn btn--solid">{t('hero.cta')}</Link>
    </div>
  );
}
