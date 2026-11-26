import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Shop from './components/Shop.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import { CartProvider } from './context/CartContext.jsx';
import { I18nProvider } from './i18n/I18nContext.jsx';

export default function App() {
  return (
    <I18nProvider>
      <CartProvider>
        <Header />
        <main>
          <Hero />
          <Shop />
        </main>
        <Footer />
        <CartDrawer />
      </CartProvider>
    </I18nProvider>
  );
}
