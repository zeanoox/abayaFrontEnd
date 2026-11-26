import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext.jsx';
import { useI18n } from '../i18n/I18nContext.jsx';
import { useSeo } from '../lib/hooks.js';
import ProductCard from '../components/ProductCard.jsx';

export default function Wishlist() {
  const { items } = useWishlist();
  const { t } = useI18n();
  useSeo({ title: t('wish.title') });
  return (
    <div className="container section">
      <h1>{t('wish.title')}</h1>
      {items.length === 0 ? (
        <div className="state"><p className="muted">{t('wish.empty')}</p><Link to="/shop" className="btn btn--solid">{t('hero.cta')}</Link></div>
      ) : (
        <div className="grid grid--4">{items.map((p) => <ProductCard key={p.slug} product={{ ...p, id: p.slug }} />)}</div>
      )}
    </div>
  );
}
