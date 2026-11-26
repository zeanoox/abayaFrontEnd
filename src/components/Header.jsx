import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import Logo from './Logo.jsx';
import { BagIcon, ChevronDown, CloseIcon, HeartIcon, MenuIcon, SearchIcon, UserIcon } from './Icons.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { LANGS } from '../i18n/translations.js';
import { Modal } from './ui.jsx';

const ABAYA_SUBS = ['open-abayas', 'closed-abayas', 'everyday-abayas', 'occasion-abayas', 'luxury-abayas'];
const SUB_LABEL = {
  'open-abayas': { nl: 'Open abaya’s', en: 'Open abayas', ar: 'عبايات مفتوحة' },
  'closed-abayas': { nl: 'Gesloten abaya’s', en: 'Closed abayas', ar: 'عبايات مغلقة' },
  'everyday-abayas': { nl: 'Dagelijkse abaya’s', en: 'Everyday abayas', ar: 'عبايات يومية' },
  'occasion-abayas': { nl: 'Feestelijke abaya’s', en: 'Occasion abayas', ar: 'عبايات المناسبات' },
  'luxury-abayas': { nl: 'Luxe abaya’s', en: 'Luxury abayas', ar: 'عبايات فاخرة' },
};

function LangSwitch() {
  const { lang, setLang, t } = useI18n();
  return (
    <div className="lang" role="group" aria-label={t('header.language')}>
      {LANGS.map((l) => (
        <button key={l.code} className={`lang__btn ${lang === l.code ? 'is-active' : ''}`} onClick={() => setLang(l.code)}
          aria-pressed={lang === l.code} title={l.name} lang={l.code}>{l.label}</button>
      ))}
    </div>
  );
}

export default function Header() {
  const cart = useCart();
  const wish = useWishlist();
  const { t, tr } = useI18n();
  const nav = useNavigate();
  const loc = useLocation();
  const [menu, setMenu] = useState(false);
  const [search, setSearch] = useState(false);
  const [account, setAccount] = useState(false);
  const [q, setQ] = useState('');

  useEffect(() => { setMenu(false); setSearch(false); }, [loc.pathname, loc.search]);

  const submit = (e) => {
    e.preventDefault();
    if (q.trim()) nav(`/shop?q=${encodeURIComponent(q.trim())}`);
  };

  const links = [
    { to: '/collections/new-arrivals', label: t('nav.new') },
    { to: '/collections/abayas', label: t('nav.abayas'), subs: ABAYA_SUBS },
    { to: '/collections/hijabs', label: t('nav.hijabs') },
    { to: '/collections/khimars', label: t('nav.khimars') },
    { to: '/collections/accessories', label: t('nav.accessories') },
    { to: '/collections/sale', label: t('nav.sale'), sale: true },
  ];

  return (
    <header className="header">
      <a href="#main" className="skip">Skip to content</a>
      <div className="announce">{t('feat.shippingSub')} · {t('feat.returns')}</div>
      <div className="container header__inner">
        <button className="icon-btn menu-toggle" onClick={() => setMenu(!menu)} aria-expanded={menu} aria-controls="main-nav" aria-label={t('nav.menu')}>
          {menu ? <CloseIcon /> : <MenuIcon />}
        </button>

        <nav id="main-nav" className={`nav ${menu ? 'nav--open' : ''}`} aria-label={t('nav.menu')}>
          {links.map((l) => (
            <div key={l.to} className={`nav__item ${l.subs ? 'has-sub' : ''}`}>
              <NavLink to={l.to} className={`nav__link ${l.sale ? 'nav__link--sale' : ''}`}>
                {l.label}{l.subs && <ChevronDown className="nav__chev" />}
              </NavLink>
              {l.subs && (
                <div className="nav__sub">
                  <Link to={l.to}>{t('nav.allAbayas')}</Link>
                  {l.subs.map((s) => <Link key={s} to={`/collections/${s}`}>{tr(SUB_LABEL[s])}</Link>)}
                </div>
              )}
            </div>
          ))}
          <div className="nav__mobile-extra">
            <Link to="/track">{t('nav.track')}</Link>
            <LangSwitch />
          </div>
        </nav>

        <Link to="/" className="header__logo" aria-label="LORIM – home"><Logo /></Link>

        <div className="header__actions">
          <div className="hide-sm"><LangSwitch /></div>
          <button className="icon-btn" aria-label={t('header.search')} aria-expanded={search} onClick={() => setSearch(!search)}><SearchIcon /></button>
          <button className="icon-btn hide-sm" aria-label={t('header.account')} onClick={() => setAccount(true)}><UserIcon /></button>
          <Link to="/wishlist" className="icon-btn" aria-label={`${t('header.wishlist')} (${wish.count})`}>
            <HeartIcon />{wish.count > 0 && <span className="badge">{wish.count}</span>}
          </Link>
          <button className="icon-btn" aria-label={`${t('header.cart')} (${cart.count})`} onClick={() => cart.setOpen(true)}>
            <BagIcon />{cart.count > 0 && <span className="badge">{cart.count}</span>}
          </button>
        </div>
      </div>

      {search && (
        <div className="search-bar">
          <form className="container" role="search" onSubmit={submit}>
            <label htmlFor="site-search" className="sr-only">{t('header.search')}</label>
            <input id="site-search" autoFocus type="search" value={q} onChange={(e) => setQ(e.target.value)}
              placeholder={t('header.searchPlaceholder')} maxLength={80} />
            <button className="btn btn--solid" type="submit">{t('header.search')}</button>
          </form>
        </div>
      )}

      <Modal open={account} onClose={() => setAccount(false)} title={t('header.account')}>
        <p>{t('header.accountSoon')}</p>
        <Link to="/track" className="btn btn--outline" onClick={() => setAccount(false)}>{t('nav.track')}</Link>
      </Modal>
    </header>
  );
}
