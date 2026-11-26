import AbayaArt from './AbayaArt.jsx';
import { CloseIcon } from './Icons.jsx';
import { useCart } from '../context/CartContext.jsx';
import { formatPrice } from '../data/products.js';

export default function CartDrawer() {
  const { items, open, setOpen, setQty, total } = useCart();

  return (
    <>
      <div className={`overlay ${open ? 'is-open' : ''}`} onClick={() => setOpen(false)} />
      <aside className={`drawer ${open ? 'is-open' : ''}`} aria-label="سلة التسوق" aria-hidden={!open}>
        <div className="drawer__head">
          <h3>سلة التسوق</h3>
          <button className="icon-btn" onClick={() => setOpen(false)} aria-label="إغلاق"><CloseIcon /></button>
        </div>

        {items.length === 0 ? (
          <p className="drawer__empty">سلتك فارغة حالياً</p>
        ) : (
          <ul className="drawer__list">
            {items.map((i) => (
              <li key={i.id} className="line">
                <div className="line__thumb" style={{ background: i.accent }}>
                  <AbayaArt color={i.color} accent={i.accent} type={i.type} />
                </div>
                <div className="line__info">
                  <strong>{i.name}</strong>
                  <span>{formatPrice(i.price)}</span>
                  <div className="qty">
                    <button onClick={() => setQty(i.id, i.qty + 1)} aria-label="زيادة">+</button>
                    <span>{i.qty}</span>
                    <button onClick={() => setQty(i.id, i.qty - 1)} aria-label="إنقاص">−</button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="drawer__foot">
          <div className="drawer__total"><span>المجموع</span><strong>{formatPrice(total)}</strong></div>
          <button className="btn btn--solid" disabled={!items.length}>إتمام الطلب</button>
        </div>
      </aside>
    </>
  );
}
