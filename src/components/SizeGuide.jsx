import { useI18n } from '../i18n/I18nContext.jsx';
import { Modal } from './ui.jsx';

const SIZES = [
  ['S', '88–92', '38', '56'],
  ['M', '94–98', '40', '57'],
  ['L', '100–106', '42', '58'],
  ['XL', '108–114', '44', '59'],
  ['XXL', '116–124', '46', '60'],
];
const LENGTHS = [
  [52, '132', '150–157'],
  [54, '137', '158–163'],
  [56, '142', '164–170'],
  [58, '147', '171–178'],
];

export default function SizeGuide({ open, onClose }) {
  const { t } = useI18n();
  return (
    <Modal open={open} onClose={onClose} title={t('size.title')} className="modal__box--md">
      <p className="muted">{t('size.intro')}</p>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>{t('size.size')}</th><th>{t('size.bust')}</th><th>{t('size.shoulder')}</th><th>{t('size.sleeve')}</th></tr></thead>
          <tbody>{SIZES.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
      <h3 className="h4">{t('size.lengthTitle')}</h3>
      <p className="muted">{t('size.lengthIntro')}</p>
      <div className="table-wrap">
        <table className="table">
          <thead><tr><th>{t('pdp.length')} (″)</th><th>cm</th><th>{t('size.height')} (cm)</th></tr></thead>
          <tbody>{LENGTHS.map((r) => <tr key={r[0]}>{r.map((c, i) => <td key={i}>{c}</td>)}</tr>)}</tbody>
        </table>
      </div>
    </Modal>
  );
}
