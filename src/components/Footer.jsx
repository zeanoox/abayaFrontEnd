import { useState } from 'react';
import { InstagramIcon, TiktokIcon } from './Icons.jsx';

const FacebookIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden="true">
    <path d="M14 8h3V4h-3a4 4 0 0 0-4 4v3H7v4h3v6h4v-6h3l1-4h-4V8z" />
  </svg>
);

export default function Footer() {
  const [sent, setSent] = useState(false);
  return (
    <footer className="footer" id="contact">
      <div className="container footer__grid">
        <div>
          <h4>تسوقي</h4>
          <a href="#home">الرئيسية</a>
          <a href="#colored">عبايات ملوّنة</a>
          <a href="#daily">الكتالوج</a>
          <a href="#contact">تواصل معنا</a>
        </div>
        <div>
          <h4>تابعينا</h4>
          <div className="socials">
            <a href="#" aria-label="Facebook"><FacebookIcon /></a>
            <a href="#" aria-label="Instagram"><InstagramIcon /></a>
            <a href="#" aria-label="TikTok"><TiktokIcon /></a>
          </div>
        </div>
        <div className="footer__news">
          <h4>انضمي لمجتمعنا</h4>
          {sent ? (
            <p>شكراً لاشتراكك!</p>
          ) : (
            <form onSubmit={(e) => { e.preventDefault(); setSent(true); }}>
              <input type="email" placeholder="البريد الإلكتروني" required />
              <button type="submit" aria-label="اشتراك">←</button>
            </form>
          )}
        </div>
      </div>
      <div className="container footer__bottom">
        <span>© {new Date().getFullYear()} LORIM</span>
        <nav>
          <a href="#">سياسة الخصوصية</a>
          <a href="#">سياسة الاسترجاع</a>
          <a href="#">شروط الخدمة</a>
          <a href="#">سياسة الشحن</a>
        </nav>
      </div>
    </footer>
  );
}
