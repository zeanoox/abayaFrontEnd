import { useEffect, useState } from 'react';
import { img } from '../api.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import { ChevronEnd, ChevronStart, ExpandIcon } from './Icons.jsx';
import { Modal } from './ui.jsx';

/** Main image with hover zoom, thumbnails and a full-screen viewer. */
export default function Gallery({ images, name }) {
  const { t, tr, dir } = useI18n();
  const [i, setI] = useState(0);
  const [zoom, setZoom] = useState(null);
  const [full, setFull] = useState(false);
  useEffect(() => setI(0), [images]);
  if (!images.length) return <div className="gallery__main" />;

  const cur = images[Math.min(i, images.length - 1)];
  const go = (d) => setI((x) => (x + d + images.length) % images.length);
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setZoom({ x: ((e.clientX - r.left) / r.width) * 100, y: ((e.clientY - r.top) / r.height) * 100 });
  };
  const keys = (e) => {
    const back = dir === 'rtl' ? 'ArrowRight' : 'ArrowLeft';
    const fwd = dir === 'rtl' ? 'ArrowLeft' : 'ArrowRight';
    if (e.key === back) go(-1);
    if (e.key === fwd) go(1);
  };

  return (
    <div className="gallery" onKeyDown={keys}>
      <div className="gallery__thumbs" role="tablist">
        {images.map((im, k) => (
          <button key={im.url} role="tab" aria-selected={k === i} className={k === i ? 'is-active' : ''} onClick={() => setI(k)}
            aria-label={tr(im.alt) || name}>
            <img src={img(im.url)} alt="" width="120" height="160" loading="lazy" />
          </button>
        ))}
      </div>
      <div className="gallery__main" onMouseMove={onMove} onMouseLeave={() => setZoom(null)}>
        <img src={img(cur.url)} alt={tr(cur.alt) || name} width="600" height="800" fetchpriority="high"
          style={zoom ? { transform: 'scale(2)', transformOrigin: `${zoom.x}% ${zoom.y}%` } : undefined} />
        <button className="gallery__btn gallery__btn--prev" onClick={() => go(-1)} aria-label={t('pdp.prev')}><ChevronStart /></button>
        <button className="gallery__btn gallery__btn--next" onClick={() => go(1)} aria-label={t('pdp.next')}><ChevronEnd /></button>
        <button className="gallery__full" onClick={() => setFull(true)} aria-label={t('pdp.fullscreen')}><ExpandIcon /></button>
      </div>
      <Modal open={full} onClose={() => setFull(false)} title={name} className="modal__box--full">
        <div className="lightbox" onKeyDown={keys}>
          <img src={img(cur.url)} alt={tr(cur.alt) || name} />
          <button className="gallery__btn gallery__btn--prev" onClick={() => go(-1)} aria-label={t('pdp.prev')}><ChevronStart /></button>
          <button className="gallery__btn gallery__btn--next" onClick={() => go(1)} aria-label={t('pdp.next')}><ChevronEnd /></button>
          <p className="lightbox__count">{i + 1} / {images.length}</p>
        </div>
      </Modal>
    </div>
  );
}
