import { useState } from 'react';
import Logo from './Logo.jsx';
import AbayaArt from './AbayaArt.jsx';

// Full-width image banner. Drop a photo at public/images/hero.jpg to replace the illustration.
export default function Hero() {
  const [photo, setPhoto] = useState(true);

  return (
    <section id="home" className="banner">
      <div className="banner__media" aria-hidden="true">
        {photo ? (
          <img src="/images/hero.jpg" alt="" onError={() => setPhoto(false)} />
        ) : (
          <div className="banner__art">
            <div className="banner__arches"><span /><span /><span /></div>
            <AbayaArt color="#5f6146" accent="#e9e1cf" embroidery className="banner__figure banner__figure--a" />
            <AbayaArt color="#b9a88c" accent="#f1ece3" className="banner__figure banner__figure--b" />
          </div>
        )}
      </div>
      <div className="banner__content">
        <Logo size="xl" />
        <div className="ornament" aria-hidden="true"><span />✦<span /></div>
        <h1>مغطّاة بالأناقة</h1>
        <p>أناقة تدوم .. بتفاصيلها</p>
        <a href="#colored" className="btn btn--solid">تسوقي الآن</a>
      </div>
    </section>
  );
}
