import { useState } from 'react';
import Logo from './Logo.jsx';
import AbayaArt from './AbayaArt.jsx';
import { ArrowLeft } from './Icons.jsx';

// Drop a photo at public/images/hero.jpg and it will replace the illustration automatically.
export default function Hero() {
  const [photo, setPhoto] = useState(true);

  return (
    <section id="home" className="hero">
      <div className="hero__arches" aria-hidden="true">
        <span /><span /><span />
      </div>
      <div className="container hero__inner">
        <div className="hero__text">
          <Logo size="xl" />
          <div className="ornament" aria-hidden="true"><span />✦<span /></div>
          <h1 className="hero__tagline">أناقة تدوم .. بتفاصيلها</h1>
          <a href="#shop" className="btn btn--outline">
            تسوقي الآن <ArrowLeft />
          </a>
        </div>
        <div className="hero__visual">
          {photo ? (
            <img src="/images/hero.jpg" alt="عباية لوريم" onError={() => setPhoto(false)} />
          ) : (
            <AbayaArt color="#5f6146" accent="#e9e1cf" embroidery className="hero__art" />
          )}
        </div>
      </div>
    </section>
  );
}
