import Header from './components/Header.jsx';
import Hero from './components/Hero.jsx';
import Features from './components/Features.jsx';
import Shop from './components/Shop.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import { CartProvider } from './context/CartContext.jsx';

export default function App() {
  return (
    <CartProvider>
      <Header />
      <main>
        <Hero />
        <Features />
        <Shop />
      </main>
      <Footer />
      <CartDrawer />
    </CartProvider>
  );
}
