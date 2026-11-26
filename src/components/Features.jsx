import { GiftIcon, HeadsetIcon, ShieldIcon, TruckIcon } from './Icons.jsx';

const features = [
  { Icon: TruckIcon, title: 'شحن سريع', sub: 'لكافة المناطق' },
  { Icon: ShieldIcon, title: 'دفع آمن', sub: 'ومتعدد الخيارات' },
  { Icon: GiftIcon, title: 'تغليف فاخر', sub: 'بلمسة مميزة' },
  { Icon: HeadsetIcon, title: 'دعم فني', sub: 'على مدار الساعة' },
];

export default function Features() {
  return (
    <section className="features">
      <div className="container features__inner">
        {features.map(({ Icon, title, sub }) => (
          <div className="feature" key={title}>
            <Icon className="feature__icon" />
            <div>
              <strong>{title}</strong>
              <span>{sub}</span>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
