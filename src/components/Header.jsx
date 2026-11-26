import { useEffect, useState } from 'react';
import Logo from './Logo.jsx';
import { BagIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from './Icons.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { LANGS } from '../i18n/translations.js';

const links = [
  { href: '#home', key: 'nav.home' },
  { href: '#colored', key: 'nav.colored' },
  { href: '#daily', key: 'nav.catalog' },
  { href: '#contact', key: 'nav.contact' },
];

function LangSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="lang" role="group" aria-label={t('header.language')}>
      {LANGS.map((l) => (
        <button
          key={l.code}
          className={`lang__btn ${lang === l.code ? 'is-active' : ''}`}
          onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code}
          title={l.name}
          lang={l.code}
        >
          {l.label}
        </button>
      ))}
    </div>
  );
}

export default function Header() {
  const { count, setOpen } = useCart();
  const { t } = useI18n();
  const [active, setActive] = useState('#home');
  const [menu, setMenu] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [search, setSearch] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <header className={`header ${scrolled ? 'header--scrolled' : ''}`}>
      <div className="container header__inner">
        <nav className={`nav ${menu ? 'nav--open' : ''}`} aria-label={t('nav.menu')}>
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`nav__link ${active === l.href ? 'is-active' : ''}`}
              onClick={() => { setActive(l.href); setMenu(false); }}
            >
              {t(l.key)}
            </a>
          ))}
        </nav>

        <button className="icon-btn menu-toggle" onClick={() => setMenu(!menu)} aria-label={t('nav.menu')}>
          {menu ? <CloseIcon /> : <MenuIcon />}
        </button>

        <a href="#home" className="header__logo"><Logo /></a>

        <div className="header__actions">
          <LangSwitch />
          <span className="divider" />
          <button className="icon-btn" aria-label={t('header.search')} onClick={() => setSearch(!search)}><SearchIcon /></button>
          <button className="icon-btn hide-sm" aria-label={t('header.account')}><UserIcon /></button>
          <button className="icon-btn cart-btn" aria-label={t('header.cart')} onClick={() => setOpen(true)}>
            <BagIcon />
            {count > 0 && <span className="badge">{count}</span>}
          </button>
        </div>
      </div>
      {search && (
        <div className="search-bar">
          <div className="container">
            <input autoFocus type="search" placeholder={t('header.searchPlaceholder')} />
          </div>
        </div>
      )}
    </header>
  );
}
