import { useEffect, useState } from 'react';
import Logo from './Logo.jsx';
import { BagIcon, CloseIcon, MenuIcon, SearchIcon, UserIcon } from './Icons.jsx';
import { useCart } from '../context/CartContext.jsx';

const links = [
  { href: '#home', label: 'الرئيسية' },
  { href: '#shop', label: 'المتجر' },
  { href: '#about', label: 'من لوريم' },
  { href: '#contact', label: 'تواصل معنا' },
];

export default function Header() {
  const { count, setOpen } = useCart();
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
        <nav className={`nav ${menu ? 'nav--open' : ''}`} aria-label="القائمة الرئيسية">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className={`nav__link ${active === l.href ? 'is-active' : ''}`}
              onClick={() => { setActive(l.href); setMenu(false); }}
            >
              {l.label}
            </a>
          ))}
        </nav>

        <button className="icon-btn menu-toggle" onClick={() => setMenu(!menu)} aria-label="القائمة">
          {menu ? <CloseIcon /> : <MenuIcon />}
        </button>

        <a href="#home" className="header__logo"><Logo /></a>

        <div className="header__actions">
          <button className="icon-btn" aria-label="بحث" onClick={() => setSearch(!search)}><SearchIcon /></button>
          <span className="divider" />
          <button className="icon-btn" aria-label="حسابي"><UserIcon /></button>
          <span className="divider" />
          <button className="icon-btn cart-btn" aria-label="السلة" onClick={() => setOpen(true)}>
            <BagIcon />
            {count > 0 && <span className="badge">{count}</span>}
          </button>
        </div>
      </div>
      {search && (
        <div className="search-bar">
          <div className="container">
            <input autoFocus type="search" placeholder="ابحثي عن عباية، طرحة، لون..." />
          </div>
        </div>
      )}
    </header>
  );
}
