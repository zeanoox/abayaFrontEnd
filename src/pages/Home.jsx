import { Link } from 'react-router-dom';
import { img } from '../api.js';
import { useApi, useSeo } from '../lib/hooks.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import Logo from '../components/Logo.jsx';
import { ErrorState, SkeletonGrid } from '../components/ui.jsx';
import { GiftIcon, ReturnIcon, ShieldIcon, StarIcon, TruckIcon } from '../components/Icons.jsx';

const HOME_CATS = ['abayas', 'occasion-abayas', 'hijabs', 'khimars'];

function Rail({ title, items, to, loading, eager }) {
  const { t } = useI18n();
  return (
    <section className="section">
      <div className="container">
        <div className="section__head">
          <h2>{title}</h2>
          {to && <Link to={to} className="link">{t('home.viewAll')}</Link>}
        </div>
        {loading ? <SkeletonGrid n={4} /> : (
          <div className="grid grid--4 rail">
            {items.map((p) => <ProductCard key={p.id} product={p} eager={eager} />)}
          </div>
        )}
      </div>
    </section>
  );
}

export default function Home() {
  const { t, tr } = useI18n();
  const { data, error, loading, reload } = useApi('/home');
  useSeo({ title: t('hero.title'), description: t('meta.desc') });

  const cats = data?.categories.filter((c) => HOME_CATS.includes(c.slug)) || [];
  // Category tiles use the first image of a product in that category.
  const tileImage = (slug) => {
    const all = [...(data?.featured || []), ...(data?.bestSellers || []), ...(data?.newArrivals || [])];
    const pick = { abayas: 'sara-everyday-abaya', 'occasion-abayas': 'amira-velvet-abaya', hijabs: 'chiffon-hijab', khimars: 'classic-khimar' }[slug];
    return all.find((p) => p.slug === pick)?.image?.url || all[0]?.image?.url;
  };

  return (
    <>
      <section className="hero">
        <div className="hero__art" aria-hidden="true">
          <div className="hero__arches"><span /><span /><span /></div>
          {data?.featured?.[0]?.image && <img className="hero__fig hero__fig--a" src={img(data.featured[0].image.url)} alt="" />}
          {data?.featured?.[1]?.image && <img className="hero__fig hero__fig--b" src={img(data.featured[1].image.url)} alt="" />}
        </div>
        <div className="hero__content">
          <Logo size="xl" />
          <div className="ornament" aria-hidden="true"><span />✦<span /></div>
          <h1>{t('hero.title')}</h1>
          <p>{t('hero.subtitle')}</p>
          <Link to="/collections/new-arrivals" className="btn btn--solid">{t('hero.cta')}</Link>
        </div>
      </section>

      <section className="features" aria-label="LORIM">
        <div className="container features__inner">
          {[[TruckIcon, 'feat.shipping'], [ShieldIcon, 'feat.secure'], [GiftIcon, 'feat.gift'], [ReturnIcon, 'feat.returns']].map(([Icon, k]) => (
            <div className="feature" key={k}>
              <Icon className="feature__icon" />
              <div><strong>{t(k)}</strong><span>{t(`${k}Sub`)}</span></div>
            </div>
          ))}
        </div>
      </section>

      {error ? <div className="container"><ErrorState error={error} onRetry={reload} /></div> : (
        <>
          <Rail title={t('home.featured')} items={data?.featured.slice(0, 4) || []} to="/shop" loading={loading} eager />

          <section className="section section--tint">
            <div className="container">
              <div className="section__head section__head--center"><h2>{t('home.categories')}</h2></div>
              <div className="cats">
                {cats.map((c) => (
                  <Link key={c.slug} to={`/collections/${c.slug}`} className="cat">
                    <span className="cat__img">{tileImage(c.slug) && <img src={img(tileImage(c.slug))} alt="" loading="lazy" />}</span>
                    <strong>{tr(c.name)}</strong>
                    <small>{tr(c.description)}</small>
                  </Link>
                ))}
              </div>
            </div>
          </section>

          <Rail title={t('home.new')} items={data?.newArrivals.slice(0, 4) || []} to="/collections/new-arrivals" loading={loading} />

          <section className="section">
            <div className="container promos">
              <Link to="/collections/occasion-abayas" className="promo promo--dark">
                <h3>{t('home.promo1.title')}</h3><p>{t('home.promo1.text')}</p><span className="btn btn--light">{t('home.promo1.cta')}</span>
              </Link>
              <Link to="/collections/sale" className="promo">
                <h3>{t('home.promo2.title')}</h3><p>{t('home.promo2.text')}</p><span className="btn btn--solid">{t('home.promo2.cta')}</span>
              </Link>
            </div>
          </section>

          <Rail title={t('home.best')} items={data?.bestSellers.slice(0, 4) || []} to="/shop?sort=popular" loading={loading} />
        </>
      )}

      <section className="about">
        <div className="container about__inner">
          <div className="ornament" aria-hidden="true"><span />✦<span /></div>
          <h2>{t('home.about.title')}</h2>
          <p>{t('home.about.text')}</p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section__head section__head--center"><h2>{t('home.reviews')}</h2></div>
          <div className="reviews">
            {[['home.review1', 'Fatima, Rotterdam'], ['home.review2', 'Amal, Utrecht'], ['home.review3', 'Noura, Antwerpen']].map(([k, who]) => (
              <figure key={k} className="review">
                <div className="stars" aria-label="5/5">{[1, 2, 3, 4, 5].map((i) => <StarIcon key={i} />)}</div>
                <blockquote>{t(k)}</blockquote>
                <figcaption>{who}</figcaption>
              </figure>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
