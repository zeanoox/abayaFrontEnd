// Stylised illustration used as a placeholder until real product photos are added.
// Swap for <img src={product.image} /> once the backend serves images.
let uid = 0;

export default function AbayaArt({ color = '#5f6146', accent = '#e9e1cf', type = 'abaya', embroidery = false, className }) {
  const id = `g${++uid}`;
  if (type === 'hijab') {
    return (
      <svg viewBox="0 0 200 260" className={className} role="img" aria-label="طرحة">
        <defs>
          <linearGradient id={id} x1="0" x2="1">
            <stop offset="0" stopColor={color} stopOpacity=".85" />
            <stop offset=".5" stopColor={color} />
            <stop offset="1" stopColor={color} stopOpacity=".8" />
          </linearGradient>
        </defs>
        <path d="M100 30c-26 0-40 22-40 46 0 10 3 18 7 24l-22 120c30 12 80 12 110 0l-22-120c4-6 7-14 7-24 0-24-14-46-40-46z" fill={`url(#${id})`} />
        <ellipse cx="100" cy="80" rx="20" ry="25" fill="#e9d6c1" />
        <path d="M80 100c10 14 30 14 40 0" fill="none" stroke={color} strokeWidth="10" />
        <path d="M70 140l-8 70M100 130v90M130 140l8 70" stroke="#000" strokeOpacity=".12" strokeWidth="2" fill="none" />
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 200 320" className={className} role="img" aria-label="عباية">
      <defs>
        <linearGradient id={id} x1="0" x2="1">
          <stop offset="0" stopColor={color} stopOpacity=".82" />
          <stop offset=".45" stopColor={color} />
          <stop offset="1" stopColor={color} stopOpacity=".78" />
        </linearGradient>
      </defs>
      {/* body */}
      <path d="M100 22c-17 0-28 14-28 30 0 8 2 14 5 18-14 6-22 14-25 24L30 300c40 14 100 14 140 0L148 94c-3-10-11-18-25-24 3-4 5-10 5-18 0-16-11-30-28-30z" fill={`url(#${id})`} />
      {/* face */}
      <ellipse cx="100" cy="52" rx="13" ry="17" fill="#e9d6c1" />
      {/* sleeves */}
      <path d="M58 98c-8 30-14 70-22 112 10 4 22 4 30 0l8-70z" fill={color} />
      <path d="M142 98c8 30 14 70 22 112-10 4-22 4-30 0l-8-70z" fill={color} />
      {/* folds */}
      <path d="M85 120l-12 175M100 115v188M115 120l12 175" stroke="#000" strokeOpacity=".13" strokeWidth="2" fill="none" />
      {embroidery && (
        <g stroke={accent} strokeWidth="1.4" fill="none" opacity=".9">
          <path d="M46 200c4-20 8-40 12-70" />
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`translate(${56 - i * 2.2} ${140 + i * 13})`}>
              <path d="M0 0c-6-2-9-7-8-11 5 1 8 6 8 11z" />
              <path d="M0 0c6-3 9-8 7-12-5 2-7 7-7 12z" />
            </g>
          ))}
        </g>
      )}
      {/* trim */}
      <path d="M100 70v230" stroke={accent} strokeOpacity=".35" strokeWidth="1.5" />
    </svg>
  );
}
