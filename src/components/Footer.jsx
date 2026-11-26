import { useState } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../api.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import Logo from './Logo.jsx';
import { FacebookIcon, InstagramIcon, MailIcon, TiktokIcon } from './Icons.jsx';

export default function Footer() {
  const { t, lang } = useI18n();
  const [state, setState] = useState('idle');
  const [email, setEmail] = useState('');

  async function subscribe(e) {
    e.preventDefault();
    setState('busy');
    try {
      await api('/newsletter', { method: 'POST', body: { email, locale: lang } });
      setState('done');
    } catch {
      setState('error');
    }
  }

  return (
    <footer className="footer" id="contact">
      <div className="container footer__news">
        <div>
          <h2 className="h3">{t('footer.community')}</h2>
          <p className="muted">{t('footer.communityText')}</p>
        </div>
        {state === 'done' ? <p className="notice notice--ok" role="status">{t('footer.thanks')}</p> : (
          <form onSubmit={subscribe} className="inline-form">
            <label htmlFor="nl-email" className="sr-only">{t('footer.email')}</label>
            <input id="nl-email" type="email" required maxLength={200} value={email} onChange={(e) => setEmail(e.target.value)} placeholder={t('footer.email')} />
            <button className="btn btn--solid" disabled={state === 'busy'}>{t('footer.subscribe')}</button>
            {state === 'error' && <p className="notice notice--err" role="alert">{t('err.generic')}</p>}
          </form>
        )}
      </div>
      <div className="container footer__grid">
        <div>
          <Logo size="md" />
          <p className="muted footer__tag">{t('hero.subtitle')}</p>
          <div className="socials">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram"><InstagramIcon /></a>
            <a href="https://tiktok.com" target="_blank" rel="noopener noreferrer" aria-label="TikTok"><TiktokIcon /></a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" aria-label="Facebook"><FacebookIcon /></a>
          </div>
        </div>
        <nav aria-label={t('footer.shop')}>
          <h3 className="h5">{t('footer.shop')}</h3>
          <Link to="/collections/new-arrivals">{t('nav.new')}</Link>
          <Link to="/collections/abayas">{t('nav.abayas')}</Link>
          <Link to="/collections/hijabs">{t('nav.hijabs')}</Link>
          <Link to="/collections/khimars">{t('nav.khimars')}</Link>
          <Link to="/collections/accessories">{t('nav.accessories')}</Link>
          <Link to="/collections/sale">{t('nav.sale')}</Link>
        </nav>
        <nav aria-label={t('footer.help')}>
          <h3 className="h5">{t('footer.help')}</h3>
          <Link to="/track">{t('nav.track')}</Link>
          <a href="#shipping">{t('footer.shipping')}</a>
          <a href="#returns">{t('footer.refund')}</a>
          <a href="#faq">{t('footer.faq')}</a>
        </nav>
        <div>
          <h3 className="h5">{t('footer.contact')}</h3>
          <a href="mailto:hello@lorim.nl" className="with-icon"><MailIcon /> hello@lorim.nl</a>
          <p className="muted">{t('footer.contactLine')}</p>
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} LORIM</span>
        <nav aria-label="Legal">
          <a href="#privacy">{t('footer.privacy')}</a>
          <a href="#terms">{t('footer.terms')}</a>
          <a href="#returns">{t('footer.refund')}</a>
          <a href="#shipping">{t('footer.shipping')}</a>
        </nav>
      </div>
    </footer>
  );
}
