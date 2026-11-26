import { useState } from 'react';
import { InstagramIcon, TiktokIcon } from './Icons.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z" />
  </svg>
);

export default function Footer() {
  const { t, dir } = useI18n();
  const [sent, setSent] = useState(false);
  return (
    <footer className="footer" id="contact">
      <div className="container footer__grid">
        <div>
          <h4>{t('footer.shop')}</h4>
          <a href="#home">{t('nav.home')}</a>
          <a href="#colored">{t('nav.colored')}</a>
          <a href="#daily">{t('nav.catalog')}</a>
          <a href="#contact">{t('nav.contact')}</a>
        </div>
        <div>
          <h4>{t('footer.connect')}</h4>
          <div className="socials">
            <a href="#" aria-label="Facebook"><FacebookIcon /></a>
            <a href="#" aria-label="Instagram"><InstagramIcon /></a>
            <a href="#" aria-label="TikTok"><TiktokIcon /></a>
          </div>
        </div>
        <div className="footer__news">
          <h4>{t('footer.community')}</h4>
          {sent ? (
            <p>{t('footer.thanks')}</p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <input type="email" placeholder={t('footer.email')} aria-label={t('footer.email')} required />
              <button type="submit" aria-label={t('footer.subscribe')}>{dir === 'rtl' ? '←' : '→'}</button>
            </form>
          )}
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} LORIM</span>
        <nav>
          <a href="#">{t('footer.privacy')}</a>
          <a href="#">{t('footer.refund')}</a>
          <a href="#">{t('footer.terms')}</a>
          <a href="#">{t('footer.shipping')}</a>
        </nav>
      </div>
    </footer>
  );
}
