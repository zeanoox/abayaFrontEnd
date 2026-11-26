import { createPortal } from 'react-dom';
import { useDialog } from '../lib/hooks.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import { CloseIcon } from './Icons.jsx';

export function Price({ price, salePrice, className = '' }) {
  const { price: fmt } = useI18n();
  return (
    <span className={`price ${className}`}>
      {salePrice != null ? (
        <>
          <span className="price__sale">{fmt(salePrice)}</span>{' '}
          <del className="price__was">{fmt(price)}</del>
        </>
      ) : fmt(price)}
    </span>
  );
}

export function Modal({ open, onClose, title, children, className = '', labelledBy }) {
  const { t } = useI18n();
  const ref = useDialog(open, onClose);
  if (!open) return null;
  return createPortal(
    <div className="modal" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div ref={ref} className={`modal__box ${className}`} role="dialog" aria-modal="true" aria-label={labelledBy ? undefined : title} aria-labelledby={labelledBy}>
        <button className="icon-btn modal__close" onClick={onClose} aria-label={t('common.close')}><CloseIcon /></button>
        {title && <h2 className="modal__title">{title}</h2>}
        {children}
      </div>
    </div>,
    document.body,
  );
}

export function Drawer({ open, onClose, title, side = 'end', children, footer }) {
  const { t } = useI18n();
  const ref = useDialog(open, onClose);
  return createPortal(
    <>
      <div className={`overlay ${open ? 'is-open' : ''}`} onClick={onClose} aria-hidden="true" />
      <aside ref={open ? ref : undefined} className={`drawer drawer--${side} ${open ? 'is-open' : ''}`}
        role="dialog" aria-modal="true" aria-label={title} aria-hidden={!open} inert={open ? undefined : ''}>
        <div className="drawer__head">
          <h2>{title}</h2>
          <button className="icon-btn" onClick={onClose} aria-label={t('common.close')}><CloseIcon /></button>
        </div>
        <div className="drawer__body">{children}</div>
        {footer && <div className="drawer__foot">{footer}</div>}
      </aside>
    </>,
    document.body,
  );
}

export function Loading({ label }) {
  const { t } = useI18n();
  return <div className="state" role="status"><span className="spinner" aria-hidden="true" />{label || t('common.loading')}</div>;
}

export function ErrorState({ error, onRetry }) {
  const { t } = useI18n();
  const msg = error?.code === 'NETWORK' ? t('common.offline') : t('err.generic');
  return (
    <div className="state state--error" role="alert">
      <p>{msg}</p>
      {onRetry && <button className="btn btn--outline" onClick={onRetry}>{t('common.retry')}</button>}
    </div>
  );
}

export function SkeletonGrid({ n = 4, cols = 4 }) {
  return (
    <div className={`grid grid--${cols}`} aria-hidden="true">
      {Array.from({ length: n }, (_, i) => <div key={i} className="skeleton-card"><div /><span /><span /></div>)}
    </div>
  );
}

/** Translates an API error into a friendly message. */
export function useErrorMessage() {
  const { t, price } = useI18n();
  return (err) => {
    if (!err) return '';
    const key = `err.${err.code}`;
    const s = t(key, { n: err.body?.available ?? '', amount: price(err.body?.minSubtotal) });
    return s === key ? t('err.generic') : s;
  };
}
