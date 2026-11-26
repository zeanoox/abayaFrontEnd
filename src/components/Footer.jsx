import Logo from './Logo.jsx';
import { InstagramIcon, SnapIcon, TiktokIcon } from './Icons.jsx';

export default function Footer() {
  return (
    <>
      <section className="about" id="about">
        <div className="container about__inner">
          <h2>من لوريم</h2>
          <p>
            في لوريم نؤمن أن الأناقة الحقيقية تسكن في التفاصيل. نصمم عباياتنا بخطوط نقية وأقمشة مختارة بعناية،
            لتمنحك حضوراً هادئاً وفخامة تدوم معك في كل مناسبة.
          </p>
        </div>
      </section>

      <section className="newsletter">
        <div className="container newsletter__inner">
          <div>
            <h3>انضمي لعالم لوريم</h3>
            <p>كوني أول من يعرف عن التصاميم الجديدة والعروض الخاصة.</p>
          </div>
          <form onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="بريدك الإلكتروني" required />
            <button className="btn btn--solid" type="submit">اشتراك</button>
          </form>
        </div>
      </section>

      <footer className="footer" id="contact">
        <div className="container footer__grid">
          <div>
            <Logo size="md" />
            <p className="footer__tag">أناقة تدوم .. بتفاصيلها</p>
            <div className="socials">
              <a href="#" aria-label="Instagram"><InstagramIcon /></a>
              <a href="#" aria-label="TikTok"><TiktokIcon /></a>
              <a href="#" aria-label="Snapchat"><SnapIcon /></a>
            </div>
          </div>
          <div>
            <h4>تسوقي</h4>
            <a href="#shop">عبايات يومية</a>
            <a href="#shop">عبايات ملوّنة</a>
            <a href="#shop">عبايات المناسبات</a>
            <a href="#shop">الطُّرَح</a>
          </div>
          <div>
            <h4>المساعدة</h4>
            <a href="#">سياسة الشحن</a>
            <a href="#">الاستبدال والاسترجاع</a>
            <a href="#">دليل المقاسات</a>
            <a href="#">الخصوصية</a>
          </div>
          <div>
            <h4>تواصل معنا</h4>
            <a href="mailto:hello@lorim.store">hello@lorim.store</a>
            <a href="#">واتساب</a>
          </div>
        </div>
        <div className="footer__bottom">© {new Date().getFullYear()} LORIM. جميع الحقوق محفوظة.</div>
      </footer>
    </>
  );
}
