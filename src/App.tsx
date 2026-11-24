import React from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Layout } from './components/Layout';
import { HomePage, FlashDealsPage, AboutPage } from './pages/StorefrontPages';
import {
  PcPartsPage,
  PartDetailsPage,
  GamingGearPage,
  PreBuiltPcsPage,
} from './pages/CatalogPages';
import {
  WattageCalculatorPage,
  CompareGearPage,
  PcBuilderPage,
  BenchmarkGuidePage,
} from './pages/ToolsPages';
import {
  WishlistPage,
  CartPage,
  CheckoutPage,
  OrderTrackingPage,
} from './pages/CommercePages';

const ActivePageRouter: React.FC = () => {
  const { page } = useStore();

  switch (page) {
    case 'home':
      return <HomePage />;
    case 'flash-deals':
      return <FlashDealsPage />;
    case 'about':
      return <AboutPage />;
    case 'pc-parts':
      return <PcPartsPage />;
    case 'part-details':
      return <PartDetailsPage />;
    case 'wattage-calculator':
      return <WattageCalculatorPage />;
    case 'gaming-gear':
      return <GamingGearPage />;
    case 'compare-gear':
      return <CompareGearPage />;
    case 'wishlist':
      return <WishlistPage />;
    case 'pc-builder':
      return <PcBuilderPage />;
    case 'pre-built-pcs':
      return <PreBuiltPcsPage />;
    case 'benchmark-guide':
      return <BenchmarkGuidePage />;
    case 'cart':
      return <CartPage />;
    case 'checkout':
      return <CheckoutPage />;
    case 'order-tracking':
      return <OrderTrackingPage />;
    default:
      return <HomePage />;
  }
};

export default function App() {
  return (
    <StoreProvider>
      <Layout>
        <ActivePageRouter />
      </Layout>
    </StoreProvider>
  );
}
