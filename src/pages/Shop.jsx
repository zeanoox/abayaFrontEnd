import { useEffect, useMemo, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { api, qs } from '../api.js';
import { useApi, useSeo } from '../lib/hooks.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { Drawer, ErrorState, SkeletonGrid } from '../components/ui.jsx';
import { FilterIcon } from '../components/Icons.jsx';

const PAGE = 12;
const SORTS = ['newest', 'popular', 'price_asc', 'price_desc'];

function Filters({ facets, params, set, categories, current }) {
  const { t, tr, price } = useI18n();
  const list = (k) => (params.get(k) ? params.get(k).split(',') : []);
  const toggle = (k, v) => {
    const cur = list(k);
    set(k, cur.includes(v) ? cur.filter((x) => x !== v) : [...cur, v]);
  };
  const [min, setMin] = useState(params.get('minPrice') || '');
  const [max, setMax] = useState(params.get('maxPrice') || '');
  useEffect(() => { setMin(params.get('minPrice') || ''); setMax(params.get('maxPrice') || ''); }, [params]);

  return (
    <div className="filters">
      <div className="filter">
        <h3>{t('shop.category')}</h3>
        <ul className="filter__cats">
          <li><Link to={`/shop${qs({ q: params.get('q') })}`} className={!current ? 'is-active' : ''}>{t('shop.all')}</Link></li>
          {categories.filter((c) => !c.parent).map((c) => (
            <li key={c.slug}>
              <Link to={`/collections/${c.slug}`} className={current === c.slug ? 'is-active' : ''}>{tr(c.name)}</Link>
              {categories.some((s) => s.parent === c.slug) && (current === c.slug || categories.find((s) => s.slug === current)?.parent === c.slug) && (
                <ul>
                  {categories.filter((s) => s.parent === c.slug).map((s) => (
                    <li key={s.slug}><Link to={`/collections/${s.slug}`} className={current === s.slug ? 'is-active' : ''}>{tr(s.name)}</Link></li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </div>

      {facets?.sizes?.length > 0 && (
        <fieldset className="filter">
          <legend>{t('shop.size')}</legend>
          <div className="chips">
            {facets.sizes.map((s) => (
              <label key={s.code} className="chip chip--opt">
                <input type="checkbox" checked={list('size').includes(s.code)} onChange={() => toggle('size', s.code)} />
                <span>{s.code === 'OS' ? 'One size' : s.code}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      {facets?.colors?.length > 0 && (
        <fieldset className="filter">
          <legend>{t('shop.color')}</legend>
          <div className="swatches swatches--filter">
            {facets.colors.map((c) => (
              <label key={c.code} className="swatch swatch--lg" style={{ '--c': c.hex }} title={tr(c.name)}>
                <input type="checkbox" checked={list('color').includes(c.code)} onChange={() => toggle('color', c.code)} />
                <span className="sr-only">{tr(c.name)}</span>
              </label>
            ))}
          </div>
        </fieldset>
      )}

      <fieldset className="filter">
        <legend>{t('shop.price')}</legend>
        <form className="price-range" onSubmit={(e) => { e.preventDefault(); set('minPrice', min); set('maxPrice', max); }}>
          <label><span className="sr-only">{t('shop.min')}</span>
            <input type="number" inputMode="decimal" min="0" step="1" placeholder={`${t('shop.min')} ${facets?.price?.min != null ? price(facets.price.min) : ''}`}
              value={min} onChange={(e) => setMin(e.target.value)} /></label>
          <span aria-hidden="true">–</span>
          <label><span className="sr-only">{t('shop.max')}</span>
            <input type="number" inputMode="decimal" min="0" step="1" placeholder={`${t('shop.max')} ${facets?.price?.max != null ? price(facets.price.max) : ''}`}
              value={max} onChange={(e) => setMax(e.target.value)} /></label>
          <button className="btn btn--outline btn--sm">OK</button>
        </form>
      </fieldset>

      <fieldset className="filter">
        <legend>{t('shop.availability')}</legend>
        <label className="check">
          <input type="checkbox" checked={params.get('inStock') === 'true'} onChange={(e) => set('inStock', e.target.checked ? 'true' : '')} />
          {t('shop.inStock')}
        </label>
      </fieldset>
    </div>
  );
}

export default function Shop() {
  const { slug } = useParams();
  const [params, setParams] = useSearchParams();
  const { t, tr } = useI18n();
  const { data: categories } = useApi('/categories');
  const [mobile, setMobile] = useState(false);

  const filterKey = useMemo(() => {
    const p = Object.fromEntries(params.entries());
    return qs({ ...p, category: slug, limit: PAGE });
  }, [params, slug]);
  const { data, error, loading, reload } = useApi(`/products${filterKey}`, { keep: true });

  // "Load more" appends further pages to the first one.
  const [extra, setExtra] = useState([]);
  const [page, setPage] = useState(1);
  const [more, setMore] = useState(false);
  useEffect(() => { setExtra([]); setPage(1); }, [filterKey]);
  const items = [...(data?.items || []), ...extra];

  async function loadMore() {
    setMore(true);
    try {
      const next = await api(`/products${filterKey}&page=${page + 1}`);
      setExtra((e) => [...e, ...next.items]);
      setPage((p) => p + 1);
    } finally {
      setMore(false);
    }
  }

  const set = (k, v) => {
    const p = new URLSearchParams(params);
    if (!v || (Array.isArray(v) && !v.length)) p.delete(k); else p.set(k, Array.isArray(v) ? v.join(',') : v);
    setParams(p, { replace: true });
  };
  const clear = () => setParams(params.get('q') ? { q: params.get('q') } : {}, { replace: true });

  const cat = categories?.find((c) => c.slug === slug);
  const q = params.get('q');
  const title = q ? t('shop.searchFor', { q }) : cat ? tr(cat.name) : t('shop.title');
  useSeo({ title, description: cat ? tr(cat.description) : t('meta.desc') });
  const activeCount = ['size', 'color', 'minPrice', 'maxPrice', 'inStock'].filter((k) => params.get(k)).length;

  const filters = <Filters facets={data?.facets} params={params} set={set} categories={categories || []} current={slug} />;

  return (
    <div className="container shop">
      <nav className="crumbs" aria-label="Breadcrumb">
        <Link to="/">{t('common.home')}</Link> / {cat?.parent && <><Link to={`/collections/${cat.parent}`}>{tr(categories.find((c) => c.slug === cat.parent)?.name)}</Link> / </>}
        <span aria-current="page">{title}</span>
      </nav>
      <header className="shop__head">
        <div>
          <h1>{title}</h1>
          {cat?.description && <p className="muted">{tr(cat.description)}</p>}
        </div>
      </header>

      <div className="shop__layout">
        <aside className="shop__side" aria-label={t('shop.filters')}>{filters}</aside>
        <div>
          <div className="toolbar">
            <button className="btn btn--outline btn--sm show-sm" onClick={() => setMobile(true)}>
              <FilterIcon /> {t('shop.filters')}{activeCount > 0 && ` (${activeCount})`}
            </button>
            <p className="muted" aria-live="polite">{data ? t('shop.results', { n: data.total }) : ''}</p>
            {activeCount > 0 && <button className="link-btn hide-sm" onClick={clear}>{t('shop.clear')}</button>}
            <label className="sort">
              <span>{t('shop.sort')}</span>
              <select value={params.get('sort') || 'newest'} onChange={(e) => set('sort', e.target.value === 'newest' ? '' : e.target.value)}>
                {SORTS.map((s) => <option key={s} value={s}>{t(`sort.${s}`)}</option>)}
              </select>
            </label>
          </div>

          {error ? <ErrorState error={error} onRetry={reload} />
            : !data && loading ? <SkeletonGrid n={6} cols={3} />
              : items.length === 0 ? (
                <div className="state"><p>{t('shop.empty')}</p>{activeCount > 0 && <button className="btn btn--outline" onClick={clear}>{t('shop.clear')}</button>}</div>
              ) : (
                <>
                  <div className={`grid grid--3 ${loading ? 'is-loading' : ''}`}>
                    {items.map((p, i) => <ProductCard key={p.id} product={p} eager={i < 3} />)}
                  </div>
                  <div className="load-more">
                    <p className="muted">{t('shop.showing', { a: items.length, b: data.total })}</p>
                    {items.length < data.total && (
                      <button className="btn btn--outline" onClick={loadMore} disabled={more}>{more ? t('common.loading') : t('shop.loadMore')}</button>
                    )}
                  </div>
                </>
              )}
        </div>
      </div>

      <Drawer open={mobile} onClose={() => setMobile(false)} title={t('shop.filters')} side="start"
        footer={<>
          <button className="btn btn--solid btn--block" onClick={() => setMobile(false)}>{t('shop.apply')}{data ? ` (${data.total})` : ''}</button>
          {activeCount > 0 && <button className="btn btn--outline btn--block" onClick={clear}>{t('shop.clear')}</button>}
        </>}>
        {filters}
      </Drawer>
    </div>
  );
}
