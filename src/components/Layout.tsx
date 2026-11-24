import React, { useEffect, useRef, useState } from 'react';
import {
  ChevronDown,
  Heart,
  Menu,
  ShoppingBag,
  X,
  CheckCircle2,
  AlertTriangle,
  AlertCircle,
  Info,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { PageId } from '../types';

export const BrandLogo: React.FC = () => (
  <span className="inline-flex items-center gap-2.5 whitespace-nowrap shrink-0">
    <svg
      width="28"
      height="28"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      className="shrink-0"
    >
      <path
        d="M16 2L28 9V23L16 30L4 23V9L16 2Z"
        stroke="#222B3E"
        strokeWidth="2"
        fill="#111622"
      />
      <path
        d="M16 5.5L24.5 10.5V14.5H19V12.5L16 10.8L11.5 13.4V18.6L16 21.2L20.5 18.6V16.5H16V14.5H24.5V21.5L16 26.5L7.5 21.5V10.5L16 5.5Z"
        fill="#F4F7FB"
      />
      <path d="M16 13.5L19 16L16 18.5L13 16L16 13.5Z" fill="#00D4FF" />
    </svg>
    <span className="font-display text-lg font-bold tracking-tight text-[#F4F7FB]">
      GAME<span className="text-[#00D4FF]">VAULT</span>
    </span>
  </span>
);

export const Layout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { page, navigate, cartCount, wishlistCount, toasts, dismissToast } = useStore();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setToolsOpen(false);
      }
    };
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setToolsOpen(false);
        setMobileOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEsc);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEsc);
    };
  }, []);

  const handleNav = (target: PageId, category?: string) => {
    setToolsOpen(false);
    setMobileOpen(false);
    navigate(target, category ? { category } : {});
  };

  const navLinkClass = (active: boolean) =>
    `text-sm font-medium transition-colors whitespace-nowrap shrink-0 py-1 border-b ${
      active
        ? 'text-[#00D4FF] border-[#00D4FF]'
        : 'text-[#9CA8BE] border-transparent hover:text-[#F4F7FB]'
    }`;

  const toolsPages: { id: PageId; label: string; desc: string }[] = [
    { id: 'wattage-calculator', label: 'Wattage Calculator', desc: 'Size PSU with 25% headroom' },
    { id: 'benchmark-guide', label: 'Benchmark Guide', desc: '1080p / 1440p / 4K FPS data' },
    { id: 'compare-gear', label: 'Compare Gear', desc: 'Side-by-side spec delta' },
    { id: 'pre-built-pcs', label: 'Pre-Built PCs', desc: 'Turnkey calibrated systems' },
    { id: 'order-tracking', label: 'Order Tracking', desc: 'Track local COD shipments' },
    { id: 'about', label: 'About Us', desc: 'Warranty & support hub' },
  ];

  const isToolsActive = toolsPages.some((t) => t.id === page);

  return (
    <div className="min-h-screen flex flex-col bg-[#0B0E14] text-[#F4F7FB]">
      {/* Sticky Single-Row Three-Zone Header */}
      <header className="sticky top-0 z-40 border-b border-[#222B3E] bg-[#0E131E]/95 backdrop-blur-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-6">
          {/* Zone 1: Brand Wordmark */}
          <button
            type="button"
            onClick={() => handleNav('home')}
            className="text-left focus-visible:outline-2 rounded cursor-pointer"
            aria-label="GameVault Home"
          >
            <BrandLogo />
          </button>

          {/* Zone 2: Clean Single-Line Navigation Links */}
          <nav
            aria-label="Primary Navigation"
            className="hidden lg:flex items-center gap-7"
          >
            <button
              type="button"
              onClick={() => handleNav('pc-parts')}
              className={navLinkClass(page === 'pc-parts' || page === 'part-details')}
            >
              PC Parts
            </button>
            <button
              type="button"
              onClick={() => handleNav('gaming-gear')}
              className={navLinkClass(page === 'gaming-gear')}
            >
              Gaming Gear
            </button>
            <button
              type="button"
              onClick={() => handleNav('pc-builder')}
              className={navLinkClass(page === 'pc-builder')}
            >
              PC Builder
            </button>
            <button
              type="button"
              onClick={() => handleNav('flash-deals')}
              className={navLinkClass(page === 'flash-deals')}
            >
              Flash Deals
            </button>

            <div className="relative" ref={dropdownRef}>
              <button
                type="button"
                onClick={() => setToolsOpen((v) => !v)}
                aria-expanded={toolsOpen}
                className={`inline-flex items-center gap-1 text-sm font-medium transition-colors whitespace-nowrap shrink-0 py-1 border-b ${
                  isToolsActive
                    ? 'text-[#00D4FF] border-[#00D4FF]'
                    : 'text-[#9CA8BE] border-transparent hover:text-[#F4F7FB]'
                }`}
              >
                <span>Tools & More</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    toolsOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {toolsOpen && (
                <div className="absolute left-0 mt-3 w-72 rounded-lg border border-[#33415C] bg-[#111622] shadow-2xl p-2 z-50">
                  {toolsPages.map((item) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => handleNav(item.id)}
                      className={`w-full text-left px-3 py-2.5 rounded-md transition-colors flex flex-col ${
                        page === item.id
                          ? 'bg-[#0B2A38] text-[#00D4FF]'
                          : 'hover:bg-[#161D2C] text-[#F4F7FB]'
                      }`}
                    >
                      <span className="text-sm font-medium">{item.label}</span>
                      <span className="text-xs text-[#9CA8BE]">{item.desc}</span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </nav>

          {/* Zone 3: Action Cluster */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <button
              type="button"
              onClick={() => handleNav('wishlist')}
              aria-label={`Wishlist (${wishlistCount} saved items)`}
              className={`inline-flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium border transition-colors whitespace-nowrap shrink-0 min-h-[40px] ${
                page === 'wishlist'
                  ? 'border-[#00D4FF] bg-[#0B2A38] text-[#00D4FF]'
                  : 'border-[#222B3E] bg-[#111622] text-[#F4F7FB] hover:border-[#33415C]'
              }`}
            >
              <Heart className="w-4 h-4" />
              <span className="hidden sm:inline">Wishlist</span>
              <span className="font-mono text-xs tabular-nums text-[#9CA8BE]">
                {wishlistCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => handleNav('cart')}
              aria-label={`Shopping Cart (${cartCount} items)`}
              className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md text-sm font-semibold bg-[#00D4FF] text-[#0B0E14] hover:bg-[#33DEFF] transition-colors whitespace-nowrap shrink-0 min-h-[40px]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Cart</span>
              <span className="font-mono text-xs tabular-nums font-bold px-1.5 py-0.5 rounded bg-[#0B0E14]/15">
                {cartCount}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="lg:hidden inline-flex items-center justify-center w-10 h-10 rounded-md border border-[#222B3E] bg-[#111622] text-[#F4F7FB] hover:border-[#33415C]"
            >
              <Menu className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-black/70 backdrop-blur-xs"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative ml-auto w-80 max-w-[85vw] bg-[#111622] border-l border-[#222B3E] h-full flex flex-col p-5 overflow-y-auto">
            <div className="flex items-center justify-between pb-4 border-b border-[#222B3E]">
              <BrandLogo />
              <button
                type="button"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
                className="w-10 h-10 inline-flex items-center justify-center rounded-md border border-[#222B3E] text-[#9CA8BE] hover:text-[#F4F7FB]"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="py-4 space-y-1">
              {(
                [
                  ['home', 'Home'],
                  ['pc-parts', 'PC Parts (GPUs & CPUs)'],
                  ['gaming-gear', 'Gaming Gear'],
                  ['pre-built-pcs', 'Pre-Built PCs'],
                  ['flash-deals', 'Flash Deals & Promos'],
                  ['pc-builder', 'PC Builder'],
                  ['wattage-calculator', 'Wattage Calculator'],
                  ['benchmark-guide', 'Benchmark Guide'],
                  ['compare-gear', 'Compare Gear'],
                  ['wishlist', 'Wishlist'],
                  ['cart', 'Shopping Cart'],
                  ['checkout', 'Checkout'],
                  ['order-tracking', 'Order Tracking'],
                  ['about', 'About GameVault'],
                ] as [PageId, string][]
              ).map(([target, label]) => (
                <button
                  key={target}
                  type="button"
                  onClick={() => handleNav(target)}
                  className={`w-full text-left px-3 py-2.5 rounded-md text-sm font-medium transition-colors min-h-[44px] flex items-center justify-between ${
                    page === target
                      ? 'bg-[#0B2A38] text-[#00D4FF]'
                      : 'text-[#F4F7FB] hover:bg-[#161D2C]'
                  }`}
                >
                  <span>{label}</span>
                </button>
              ))}
            </div>
          </aside>
        </div>
      )}

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Toast Stack */}
      <div
        aria-live="polite"
        aria-atomic="true"
        className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-[calc(100vw-2.5rem)] pointer-events-none"
      >
        {toasts.map((toast) => {
          const icon =
            toast.variant === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-[#10B981] shrink-0 mt-0.5" />
            ) : toast.variant === 'warning' ? (
              <AlertTriangle className="w-4 h-4 text-[#F59E0B] shrink-0 mt-0.5" />
            ) : toast.variant === 'error' ? (
              <AlertCircle className="w-4 h-4 text-[#EF4444] shrink-0 mt-0.5" />
            ) : (
              <Info className="w-4 h-4 text-[#00D4FF] shrink-0 mt-0.5" />
            );

          return (
            <div
              key={toast.id}
              className="pointer-events-auto flex items-start gap-3 p-3.5 rounded-lg border border-[#33415C] bg-[#111622] shadow-2xl"
            >
              {icon}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-[#F4F7FB]">{toast.title}</p>
                {toast.detail && (
                  <p className="text-xs text-[#9CA8BE] truncate mt-0.5">{toast.detail}</p>
                )}
              </div>
              <button
                type="button"
                onClick={() => dismissToast(toast.id)}
                aria-label="Dismiss notification"
                className="text-[#64728C] hover:text-[#F4F7FB] p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          );
        })}
      </div>

      {/* Complete 15-Page Global Footer */}
      <footer className="border-t border-[#222B3E] bg-[#090C11] mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 pb-10 border-b border-[#222B3E]">
            <div className="lg:col-span-2 space-y-3">
              <BrandLogo />
              <p className="text-sm text-[#9CA8BE] max-w-sm leading-relaxed">
                Unlock Your Ultimate Setup. Precision PC components, competitive peripherals,
                and verified hardware engineering tools built for modern builders.
              </p>
              <p className="text-xs text-[#64728C]">
                2-Year Vault Warranty · 24-Hour Burn-In Tested · Cash on Delivery Available
              </p>
            </div>

            <div>
              <h3 className="font-display text-sm font-semibold text-[#F4F7FB] mb-3">
                Storefront
              </h3>
              <ul className="space-y-2 text-sm text-[#9CA8BE]">
                <li>
                  <button
                    type="button"
                    onClick={() => handleNav('home')}
                    className="hover:text-[#00D4FF] transition-colors"
                  >
                    Home
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNav('flash-deals')}
                    className="hover:text-[#00D4FF] transition-colors"
                  >
                    Flash Deals
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNav('pc-parts')}
                    className="hover:text-[#00D4FF] transition-colors"
                  >
                    PC Parts (GPUs & CPUs)
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNav('gaming-gear')}
                    className="hover:text-[#00D4FF] transition-colors"
                  >
                    Gaming Gear
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNav('pre-built-pcs')}
                    className="hover:text-[#00D4FF] transition-colors"
                  >
                    Pre-Built PCs
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-display text-sm font-semibold text-[#F4F7FB] mb-3">
                Build & Analyze
              </h3>
              <ul className="space-y-2 text-sm text-[#9CA8BE]">
                <li>
                  <button
                    type="button"
                    onClick={() => handleNav('pc-builder')}
                    className="hover:text-[#00D4FF] transition-colors"
                  >
                    PC Builder
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNav('wattage-calculator')}
                    className="hover:text-[#00D4FF] transition-colors"
                  >
                    Wattage Calculator
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNav('benchmark-guide')}
                    className="hover:text-[#00D4FF] transition-colors"
                  >
                    Benchmark Guide
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNav('compare-gear')}
                    className="hover:text-[#00D4FF] transition-colors"
                  >
                    Compare Gear
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNav('part-details', undefined)}
                    className="hover:text-[#00D4FF] transition-colors"
                  >
                    Part Details Inspector
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="font-display text-sm font-semibold text-[#F4F7FB] mb-3">
                Orders & Company
              </h3>
              <ul className="space-y-2 text-sm text-[#9CA8BE]">
                <li>
                  <button
                    type="button"
                    onClick={() => handleNav('wishlist')}
                    className="hover:text-[#00D4FF] transition-colors"
                  >
                    Wishlist
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNav('cart')}
                    className="hover:text-[#00D4FF] transition-colors"
                  >
                    Shopping Cart
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNav('checkout')}
                    className="hover:text-[#00D4FF] transition-colors"
                  >
                    Checkout
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNav('order-tracking')}
                    className="hover:text-[#00D4FF] transition-colors"
                  >
                    Order Tracking
                  </button>
                </li>
                <li>
                  <button
                    type="button"
                    onClick={() => handleNav('about')}
                    className="hover:text-[#00D4FF] transition-colors"
                  >
                    About Us
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-[#64728C]">
            <p>© 2026 GameVault Hardware Store. Group 08 — Gaming Gear & PC Components.</p>
            <p className="font-mono tabular-nums">support@gamevault-gear.com</p>
          </div>
        </div>
      </footer>
    </div>
  );
};
