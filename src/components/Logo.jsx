export default function Logo({ size = 'sm' }) {
  return (
    <span className={`logo logo--${size}`} aria-label="LORIM">
      <span className="logo__l">L</span>
      <span className="logo__rest">ORIM</span>
    </span>
  );
}
