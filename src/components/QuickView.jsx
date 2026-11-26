import { useState } from 'react';
import { Link } from 'react-router-dom';
import { img } from '../api.js';
import { useApi } from '../lib/hooks.js';
import { useI18n } from '../i18n/I18nContext.jsx';
import { ErrorState, Loading, Modal } from './ui.jsx';
import VariantPicker from './VariantPicker.jsx';

export default function QuickView({ slug, onClose }) {
  const { tr, t } = useI18n();
  const { data: p, error, loading, reload } = useApi(`/products/${slug}`);
  const [color, setColor] = useState(null);
  const active = color || p?.colors.find((c) => c.inStock)?.code || p?.colors[0]?.code;
  const image = p && (p.images.find((i) => i.color === active) || p.images[0]);

  return (
    <Modal open onClose={onClose} title={p ? tr(p.name) : t('card.quickView')} className="modal__box--lg">
      {loading && <Loading />}
      {error && <ErrorState error={error} onRetry={reload} />}
      {p && (
        <div className="quick">
          <div className="quick__img">{image && <img src={img(image.url)} alt={tr(image.alt)} />}</div>
          <div>
            <VariantPicker product={p} color={active} onColorChange={setColor} compact />
            <Link to={`/products/${p.slug}`} className="link" onClick={onClose}>{t('pdp.description')} →</Link>
          </div>
        </div>
      )}
    </Modal>
  );
}
