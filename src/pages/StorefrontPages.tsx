import React, { useEffect, useMemo, useState } from 'react';
import {
  ArrowRight,
  CheckCircle2,
  Clock,
  Cpu,
  Gauge,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Tag,
  Truck,
  Wrench,
  AlertCircle,
  X,
} from 'lucide-react';
import { ASSETS, GAMEVAULT_PRODUCTS, PROMO_CODES } from '../data/products';
import { useStore } from '../context/StoreContext';
import { ProductCard, ProductImage } from '../components/ProductCard';
import { formatPrice, validatePromoCode } from '../utils/storage';

function useCountdown(targetHours = 11) {
  const [secondsLeft, setSecondsLeft] = useState(targetHours * 3600 + 24 * 60 + 48);
  useEffect(() => {
    const id = window.setInterval(() => {
      setSecondsLeft((s) => (s > 0 ? s - 1 : targetHours * 3600));
    }, 1000);
    return () => window.clearInterval(id);
  }, [targetHours]);

  const hrs = Math.floor(secondsLeft / 3600);
  const mins = Math.floor((secondsLeft % 3600) / 60);
  const secs = secondsLeft % 60;
  const pad = (n: number) => String(n).padStart(2, '0');
  return { hrs: pad(hrs), mins: pad(mins), secs: pad(secs) };
}

export const HomePage: React.FC = () => {
  const { navigate } = useStore();
  const countdown = useCountdown(11);
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const flashItems = useMemo(
    () => GAMEVAULT_PRODUCTS.filter((p) => p.isFlashDeal).slice(0, 4),
    []
  );
  const bestSellers = useMemo(
    () => GAMEVAULT_PRODUCTS.filter((p) => p.isBestSeller).slice(0, 4),
    []
  );

  const categories = [
    {
      title: 'Graphics Cards',
      count: '5 Models',
      desc: 'RTX 40-Series & Radeon RDNA 3',
      img: ASSETS.gpu,
      action: () => navigate('pc-parts', { category: 'gpu' }),
    },
    {
      title: 'Processors',
      count: '5 Models',
      desc: 'Ryzen 3D V-Cache & Core 14th Gen',
      img: ASSETS.cpu,
      action: () => navigate('pc-parts', { category: 'cpu' }),
    },
    {
      title: 'Gaming Mice',
      count: '3 Models',
      desc: '54g–60g 8000Hz Wireless Esports',
      img: ASSETS.mouse,
      action: () => navigate('gaming-gear', { category: 'mouse' }),
    },
    {
      title: 'Keyboards',
      count: '3 Models',
      desc: 'Hall-Effect Magnetic & Gasket CNC',
      img: ASSETS.keyboard,
      action: () => navigate('gaming-gear', { category: 'keyboard' }),
    },
    {
      title: 'Pre-Built PCs',
      count: '4 Tiers',
      desc: '24h Stress-Tested Turnkey Towers',
      img: ASSETS.heroPc,
      action: () => navigate('pre-built-pcs'),
    },
  ];

  const setups = [
    {
      title: 'Esports 360Hz Desk',
      spec: 'Ryzen 7 7800X3D · Wooting 80HE · Superlight 2',
      price: '$2,187',
      target: () => navigate('pc-builder'),
      img: ASSETS.keyboard,
    },
    {
      title: '4K Ray-Tracing Rig',
      spec: 'RTX 4090 Apex · Ryzen 7 9800X3D · 64GB DDR5',
      price: '$3,299',
      target: () => navigate('pre-built-pcs'),
      img: ASSETS.heroPc,
    },
    {
      title: 'Zero-Drag FPS Kit',
      spec: 'Viper V3 Pro 54g · Keychron Q1 HE Wireless',
      price: '$348',
      target: () => navigate('gaming-gear'),
      img: ASSETS.mouse,
    },
  ];

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = email.trim();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmed) {
      setEmailError('Please enter your email address.');
      setSubscribed(false);
      return;
    }
    if (!emailRegex.test(trimmed)) {
      setEmailError('Enter a valid email format (e.g., builder@domain.com).');
      setSubscribed(false);
      return;
    }
    setEmailError('');
    setSubscribed(true);
    setEmail('');
  };

  return (
    <div>
      {/* Slim Dismissible-Style Promo Strip */}
      <div className="border-b border-[#222B3E] bg-[#080B10]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-9 flex items-center justify-between text-xs text-[#9CA8BE]">
          <button
            type="button"
            onClick={() => navigate('flash-deals')}
            className="hover:text-[#00D4FF] transition-colors truncate"
          >
            Active Promo: Use code <span className="font-mono text-[#00D4FF] font-semibold">VAULT15</span> for 15% off hardware drops
          </button>
          <div className="hidden sm:flex items-center gap-5 shrink-0">
            <button
              type="button"
              onClick={() => navigate('wattage-calculator')}
              className="hover:text-[#F4F7FB] transition-colors"
            >
              Wattage Calculator
            </button>
            <button
              type="button"
              onClick={() => navigate('order-tracking')}
              className="hover:text-[#F4F7FB] transition-colors"
            >
              Track Order
            </button>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <section className="border-b border-[#222B3E] bg-[#0B0E14]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-stretch">
            <div className="lg:col-span-6 flex flex-col justify-center space-y-6">
              <p className="text-xs font-semibold tracking-widest uppercase text-[#00D4FF]">
                GameVault Hardware · Series 2026
              </p>
              <h1 className="font-display text-4xl sm:text-5xl font-bold tracking-tight text-[#F4F7FB] leading-[1.1]">
                Precision Hardware. Built to Dominate.
              </h1>
              <p className="text-base sm:text-lg text-[#9CA8BE] leading-relaxed max-w-xl">
                Unlock Your Ultimate Setup with factory-sealed flagship GPUs, magnetic esports
                peripherals, and verified compatibility tools engineered for serious builders.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <button
                  type="button"
                  onClick={() => navigate('pc-parts')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-[#00D4FF] text-[#0B0E14] font-semibold text-sm hover:bg-[#33DEFF] transition-colors min-h-[44px]"
                >
                  <span>Shop PC Parts</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  onClick={() => navigate('pc-builder')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-md border border-[#33415C] bg-[#111622] text-[#F4F7FB] font-medium text-sm hover:border-[#00D4FF] transition-colors min-h-[44px]"
                >
                  <span>Launch PC Builder</span>
                </button>
              </div>

              <div className="pt-4 border-t border-[#222B3E] flex flex-wrap gap-x-6 gap-y-2 text-xs text-[#9CA8BE]">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-[#00D4FF]" />
                  2-Year Vault Warranty
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="w-4 h-4 text-[#00D4FF]" />
                  Cash on Delivery Ready
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Wrench className="w-4 h-4 text-[#00D4FF]" />
                  Live Socket & Clearance Checks
                </span>
              </div>
            </div>

            <div className="lg:col-span-6">
              <div className="relative h-full min-h-[300px] rounded-lg border border-[#222B3E] bg-[#111622] overflow-hidden">
                <ProductImage
                  src={ASSETS.heroPc}
                  alt="GameVault Apex One custom liquid-cooled flagship gaming PC"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-[#0B0E14] via-[#0B0E14]/75 to-transparent p-5 flex items-end justify-between gap-4">
                  <div>
                    <p className="text-xs text-[#00D4FF] font-medium">Featured Flagship Tower</p>
                    <p className="font-display text-lg font-semibold text-[#F4F7FB]">
                      Apex One · RTX 4090 + 9800X3D
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigate('part-details', { productId: 'pb-vault-apex-4k' })}
                    className="px-4 py-2 rounded-md border border-[#33415C] bg-[#111622]/90 text-xs font-semibold text-[#F4F7FB] hover:border-[#00D4FF] whitespace-nowrap shrink-0"
                  >
                    Inspect Rig
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Categories */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#F4F7FB]">
              Core Hardware Categories
            </h2>
            <p className="text-sm text-[#9CA8BE] mt-1">
              Curated components and peripherals across every performance tier.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {categories.map((cat) => (
            <button
              key={cat.title}
              type="button"
              onClick={cat.action}
              className="group text-left rounded-lg border border-[#222B3E] bg-[#111622] hover:border-[#00D4FF] transition-all overflow-hidden flex flex-col"
            >
              <div className="aspect-[4/3] w-full bg-[#0E131D] overflow-hidden border-b border-[#222B3E]">
                <ProductImage
                  src={cat.img}
                  alt={cat.title}
                  className="transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="p-4 flex-1 flex flex-col justify-between gap-2">
                <div>
                  <div className="flex items-center justify-between text-xs text-[#9CA8BE]">
                    <span>{cat.count}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-[#64728C] group-hover:text-[#00D4FF] transition-colors" />
                  </div>
                  <h3 className="font-display text-base font-semibold text-[#F4F7FB] mt-1">
                    {cat.title}
                  </h3>
                </div>
                <p className="text-xs text-[#64728C]">{cat.desc}</p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Flash Deals Preview Band */}
      <section className="border-y border-[#222B3E] bg-[#0F141F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
              <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#F4F7FB]">
                Flash Hardware Deals
              </h2>
              <p className="text-sm text-[#9CA8BE] mt-1">
                Limited-allocation markdowns on flagship silicon and peripherals.
              </p>
            </div>
            <div className="flex items-center gap-4">
              <div className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-[#222B3E] bg-[#111622] font-mono tabular-nums text-sm text-[#F4F7FB]">
                <Clock className="w-4 h-4 text-[#FF3B5C]" />
                <span>
                  {countdown.hrs}:{countdown.mins}:{countdown.secs}
                </span>
              </div>
              <button
                type="button"
                onClick={() => navigate('flash-deals')}
                className="text-sm font-semibold text-[#00D4FF] hover:underline whitespace-nowrap"
              >
                All Deals & Promo Box →
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {flashItems.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </div>
      </section>

      {/* Best Selling Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
          <div>
            <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#F4F7FB]">
              Best-Selling Hardware
            </h2>
            <p className="text-sm text-[#9CA8BE] mt-1">
              Top-rated graphics cards, CPUs, and tournament peripherals trusted by builders.
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('pc-parts')}
            className="text-sm font-semibold text-[#00D4FF] hover:underline whitespace-nowrap"
          >
            Browse Full Catalog →
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {bestSellers.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </section>

      {/* Featured Setups + Engineering Tools Split */}
      <section className="border-t border-[#222B3E] bg-[#0F141F]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 space-y-12">
          <div>
            <div className="flex items-end justify-between gap-4 mb-6">
              <div>
                <h2 className="font-display text-2xl sm:text-3xl font-semibold text-[#F4F7FB]">
                  Featured Gaming Setups
                </h2>
                <p className="text-sm text-[#9CA8BE] mt-1">
                  Balanced hardware combinations engineered for zero bottlenecks.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {setups.map((setup) => (
                <div
                  key={setup.title}
                  className="rounded-lg border border-[#222B3E] bg-[#111622] overflow-hidden flex flex-col"
                >
                  <div className="aspect-[16/10] bg-[#0E131D] border-b border-[#222B3E]">
                    <ProductImage src={setup.img} alt={setup.title} />
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                    <div>
                      <h3 className="font-display text-lg font-semibold text-[#F4F7FB]">
                        {setup.title}
                      </h3>
                      <p className="text-xs text-[#9CA8BE] mt-1">{setup.spec}</p>
                    </div>
                    <div className="flex items-center justify-between pt-3 border-t border-[#222B3E]">
                      <span className="font-mono tabular-nums text-base font-bold text-[#F4F7FB]">
                        {setup.price}
                      </span>
                      <button
                        type="button"
                        onClick={setup.target}
                        className="text-sm font-semibold text-[#00D4FF] hover:underline"
                      >
                        Explore Setup →
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Promotional Engineering Banners */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
            <div className="rounded-lg border border-[#222B3E] bg-[#111622] p-6 sm:p-8 flex flex-col justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#00D4FF]">
                  <Cpu className="w-4 h-4" />
                  <span>7-Slot Configurator</span>
                </div>
                <h3 className="font-display text-2xl font-semibold text-[#F4F7FB]">
                  Custom PC Builder
                </h3>
                <p className="text-sm text-[#9CA8BE] leading-relaxed">
                  Select your CPU, GPU, motherboard, DDR4/DDR5 RAM, storage, PSU, and chassis with
                  automatic socket, clearance, and wattage verification.
                </p>
              </div>
              <div>
                <button
                  type="button"
                  onClick={() => navigate('pc-builder')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#00D4FF] text-[#0B0E14] font-semibold text-sm hover:bg-[#33DEFF] transition-colors"
                >
                  <span>Start Building</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            <div className="rounded-lg border border-[#222B3E] bg-[#111622] p-6 sm:p-8 flex flex-col justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 text-xs font-semibold text-[#7C5CFF]">
                  <Gauge className="w-4 h-4" />
                  <span>Power & FPS Lab</span>
                </div>
                <h3 className="font-display text-2xl font-semibold text-[#F4F7FB]">
                  Wattage & Benchmark Tools
                </h3>
                <p className="text-sm text-[#9CA8BE] leading-relaxed">
                  Size your power supply with a 25% transient safety margin and inspect real
                  1080p, 1440p, and 4K frame rates before ordering.
                </p>
              </div>
              <div className="flex flex-wrap gap-3">
                <button
                  type="button"
                  onClick={() => navigate('wattage-calculator')}
                  className="px-4 py-2.5 rounded-md border border-[#33415C] bg-[#161D2C] text-sm font-medium text-[#F4F7FB] hover:border-[#00D4FF] transition-colors"
                >
                  Wattage Calculator
                </button>
                <button
                  type="button"
                  onClick={() => navigate('benchmark-guide')}
                  className="px-4 py-2.5 rounded-md border border-[#33415C] bg-[#161D2C] text-sm font-medium text-[#F4F7FB] hover:border-[#7C5CFF] transition-colors"
                >
                  Benchmark Guide
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14">
        <div className="rounded-lg border border-[#222B3E] bg-[#111622] p-6 sm:p-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <h2 className="font-display text-2xl font-semibold text-[#F4F7FB]">
              Get Hardware Drops & Flash Codes First
            </h2>
            <p className="text-sm text-[#9CA8BE]">
              Restock alerts for flagship GPUs, benchmark updates, and seasonal promo codes.
            </p>
          </div>

          <form onSubmit={handleNewsletterSubmit} noValidate className="w-full lg:max-w-md space-y-2">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <label htmlFor="gv-newsletter-email" className="sr-only">
                Email address
              </label>
              <input
                id="gv-newsletter-email"
                type="email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (emailError) setEmailError('');
                }}
                placeholder="you@example.com"
                className={`flex-1 px-4 py-2.5 rounded-md bg-[#161D2C] border text-sm text-[#F4F7FB] placeholder:text-[#64728C] min-h-[44px] ${
                  emailError ? 'border-[#EF4444]' : 'border-[#222B3E] focus:border-[#00D4FF]'
                }`}
              />
              <button
                type="submit"
                className="px-5 py-2.5 rounded-md bg-[#00D4FF] text-[#0B0E14] font-semibold text-sm hover:bg-[#33DEFF] transition-colors whitespace-nowrap min-h-[44px]"
              >
                Subscribe
              </button>
            </div>
            {emailError && (
              <p role="alert" className="text-xs text-[#EF4444]">
                {emailError}
              </p>
            )}
            {subscribed && !emailError && (
              <p className="text-xs text-[#10B981]">
                Subscribed! Use code <span className="font-mono font-semibold">RIG10</span> at checkout for 10% off.
              </p>
            )}
          </form>
        </div>
      </section>
    </div>
  );
};

export const FlashDealsPage: React.FC = () => {
  const { activePromoCode, setActivePromo, pushToast } = useStore();
  const countdown = useCountdown(8);
  const [catFilter, setCatFilter] = useState<string>('all');
  const [promoInput, setPromoInput] = useState(activePromoCode || '');
  const [promoFeedback, setPromoFeedback] = useState<{
    type: 'success' | 'warning' | 'error';
    text: string;
  } | null>(
    activePromoCode
      ? { type: 'success', text: `${activePromoCode} is active and applied to your cart.` }
      : null
  );

  const flashDeals = useMemo(() => {
    return GAMEVAULT_PRODUCTS.filter((p) => p.isFlashDeal).filter((p) => {
      if (catFilter === 'all') return true;
      if (catFilter === 'peripherals') return p.category === 'mouse' || p.category === 'keyboard';
      return p.category === catFilter;
    });
  }, [catFilter]);

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const res = validatePromoCode(promoInput);
    if (res.ok && res.entry) {
      setActivePromo(res.entry.code);
      setPromoFeedback({ type: 'success', text: res.message });
      pushToast('Promo applied', `${res.entry.code} (${res.entry.discountPercent}% off)`, 'success');
    } else if (res.reason === 'expired') {
      setPromoFeedback({ type: 'warning', text: res.message });
    } else {
      setPromoFeedback({ type: 'error', text: res.message });
    }
  };

  const handleClearPromo = () => {
    setActivePromo(null);
    setPromoInput('');
    setPromoFeedback(null);
    pushToast('Promo removed', 'Discount cleared from cart summary.', 'info');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 pb-8 border-b border-[#222B3E]">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#FF3B5C]">
            Limited-Time Hardware Markdowns
          </p>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F7FB]">
            Flash Deals & Promo Vault
          </h1>
          <p className="text-sm text-[#9CA8BE] max-w-2xl">
            Verified price drops on GPUs, CPUs, NVMe drives, and wireless gear. Stack a valid
            promo code below for additional checkout savings.
          </p>
        </div>

        <div className="flex items-center gap-3 px-4 py-3 rounded-lg border border-[#222B3E] bg-[#111622] shrink-0">
          <Clock className="w-5 h-5 text-[#FF3B5C]" />
          <div>
            <p className="text-xs text-[#9CA8BE]">Batch Ends In</p>
            <p className="font-mono tabular-nums text-lg font-bold text-[#F4F7FB]">
              {countdown.hrs}h : {countdown.mins}m : {countdown.secs}s
            </p>
          </div>
        </div>
      </div>

      {/* Main Feature: Promo Code Box */}
      <section
        aria-label="Promo Code Box"
        className="rounded-lg border border-[#33415C] bg-[#111622] p-6 space-y-4"
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <h2 className="font-display text-lg font-semibold text-[#F4F7FB] flex items-center gap-2">
              <Tag className="w-4 h-4 text-[#00D4FF]" />
              <span>Promo Code Box</span>
            </h2>
            <p className="text-xs text-[#9CA8BE]">
              Test and activate a promotional code. Active codes carry automatically into Shopping
              Cart and Checkout.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs text-[#9CA8BE]">
            <span>Try:</span>
            {PROMO_CODES.map((p) => (
              <button
                key={p.code}
                type="button"
                onClick={() => setPromoInput(p.code)}
                className="font-mono px-2.5 py-1 rounded border border-[#222B3E] bg-[#161D2C] hover:border-[#00D4FF] text-[#F4F7FB] transition-colors"
              >
                {p.code}
              </button>
            ))}
          </div>
        </div>

        <form onSubmit={handlePromoSubmit} className="flex flex-col sm:flex-row gap-3">
          <label htmlFor="gv-promo-box-input" className="sr-only">
            Enter promo code
          </label>
          <input
            id="gv-promo-box-input"
            type="text"
            value={promoInput}
            onChange={(e) => setPromoInput(e.target.value)}
            placeholder="Enter promo code (e.g. VAULT15)"
            className="flex-1 px-4 py-2.5 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm font-mono uppercase text-[#F4F7FB] placeholder:normal-case placeholder:font-sans placeholder:text-[#64728C] min-h-[44px]"
          />
          <button
            type="submit"
            className="px-6 py-2.5 rounded-md bg-[#00D4FF] text-[#0B0E14] font-semibold text-sm hover:bg-[#33DEFF] transition-colors min-h-[44px] whitespace-nowrap"
          >
            Apply Code
          </button>
          {activePromoCode && (
            <button
              type="button"
              onClick={handleClearPromo}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-md border border-[#33415C] bg-[#161D2C] text-sm text-[#9CA8BE] hover:text-[#F4F7FB] min-h-[44px]"
            >
              <X className="w-4 h-4" />
              <span>Remove</span>
            </button>
          )}
        </form>

        {promoFeedback && (
          <div
            role="alert"
            className={`flex items-center gap-2 text-sm px-3.5 py-2.5 rounded-md border ${
              promoFeedback.type === 'success'
                ? 'border-[#10B981]/40 bg-[#10B981]/10 text-[#10B981]'
                : promoFeedback.type === 'warning'
                  ? 'border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B]'
                  : 'border-[#EF4444]/40 bg-[#EF4444]/10 text-[#EF4444]'
            }`}
          >
            {promoFeedback.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 shrink-0" />
            )}
            <span>{promoFeedback.text}</span>
          </div>
        )}
      </section>

      {/* Category Filter Tabs */}
      <div className="flex flex-wrap items-center gap-2">
        {[
          { id: 'all', label: 'All Deals' },
          { id: 'gpu', label: 'GPUs' },
          { id: 'cpu', label: 'CPUs' },
          { id: 'storage', label: 'Storage' },
          { id: 'peripherals', label: 'Peripherals' },
          { id: 'prebuilt', label: 'Pre-Built PCs' },
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setCatFilter(tab.id)}
            className={`px-4 py-2 rounded-md text-sm font-medium border transition-colors ${
              catFilter === tab.id
                ? 'border-[#00D4FF] bg-[#0B2A38] text-[#00D4FF]'
                : 'border-[#222B3E] bg-[#111622] text-[#9CA8BE] hover:text-[#F4F7FB]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Deal Grid */}
      {flashDeals.length === 0 ? (
        <div className="rounded-lg border border-[#222B3E] bg-[#111622] p-12 text-center space-y-3">
          <p className="font-display text-lg font-semibold text-[#F4F7FB]">
            No active flash deals in this category right now
          </p>
          <p className="text-sm text-[#9CA8BE]">
            Reset the category filter to view all current markdowns.
          </p>
          <button
            type="button"
            onClick={() => setCatFilter('all')}
            className="px-5 py-2.5 rounded-md bg-[#00D4FF] text-[#0B0E14] text-sm font-semibold"
          >
            Show All Deals
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {flashDeals.map((item) => (
            <div key={item.id} className="flex flex-col gap-2">
              <ProductCard product={item} />
              {item.dealClaimedPercent !== undefined && (
                <div className="px-1 space-y-1">
                  <div className="flex justify-between text-xs text-[#9CA8BE] font-mono tabular-nums">
                    <span>Batch Claimed</span>
                    <span>{item.dealClaimedPercent}%</span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-[#161D2C] overflow-hidden">
                    <div
                      className="h-full bg-[#FF3B5C] rounded-full"
                      style={{ width: `${item.dealClaimedPercent}%` }}
                    />
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const AboutPage: React.FC = () => {
  const { navigate, pushToast } = useStore();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [sent, setSent] = useState(false);

  const handleContact = (e: React.FormEvent) => {
    e.preventDefault();
    if (name.trim().length < 2) {
      setError('Please enter your name (at least 2 characters).');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError('Please enter a valid email address.');
      return;
    }
    if (message.trim().length < 10) {
      setError('Message must be at least 10 characters.');
      return;
    }
    setError('');
    setSent(true);
    setName('');
    setEmail('');
    setMessage('');
    pushToast('Message sent', 'Our hardware specialists will reply within 24 hours.', 'success');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-14">
      <div className="max-w-3xl space-y-4">
        <p className="text-xs font-semibold uppercase tracking-widest text-[#00D4FF]">
          About GameVault
        </p>
        <h1 className="font-display text-3xl sm:text-5xl font-bold text-[#F4F7FB] leading-tight">
          Engineered for Builders. Built on Transparency.
        </h1>
        <p className="text-base text-[#9CA8BE] leading-relaxed">
          GameVault was founded by PC hardware engineers and competitive players tired of opaque
          compatibility charts, inflated pre-built markups, and inconsistent peripheral specs.
          Every part in our catalog is factory-sealed, spec-verified, and supported by live build
          tools.
        </p>
      </div>

      {/* Trust Metrics Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { stat: '15,400+', label: 'Custom Rigs Powered Since 2023' },
          { stat: '4.9 / 5.0', label: 'Verified Builder Satisfaction' },
          { stat: '24 Hours', label: 'Burn-In Stress Test Per Pre-Built' },
          { stat: '24 Months', label: 'Direct Vault Replacement Warranty' },
        ].map((item) => (
          <div
            key={item.label}
            className="rounded-lg border border-[#222B3E] bg-[#111622] p-5 space-y-1"
          >
            <p className="font-mono tabular-nums text-2xl sm:text-3xl font-bold text-[#00D4FF]">
              {item.stat}
            </p>
            <p className="text-xs sm:text-sm text-[#9CA8BE]">{item.label}</p>
          </div>
        ))}
      </div>

      {/* Mission & Vision */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="rounded-lg border border-[#222B3E] bg-[#111622] p-7 space-y-3">
          <h2 className="font-display text-xl font-semibold text-[#F4F7FB]">Our Mission</h2>
          <p className="text-sm text-[#9CA8BE] leading-relaxed">
            Eliminate guesswork from PC building. By pairing retail component pricing with real-time
            socket validation, clearance verification, and accurate PSU wattage sizing, anyone can
            assemble a balanced rig with confidence.
          </p>
        </div>
        <div className="rounded-lg border border-[#222B3E] bg-[#111622] p-7 space-y-3">
          <h2 className="font-display text-xl font-semibold text-[#F4F7FB]">Our Vision</h2>
          <p className="text-sm text-[#9CA8BE] leading-relaxed">
            Become the benchmark hardware storefront where transparent FPS telemetry, honest thermal
            specifications, and dependable Cash-on-Delivery fulfillment set the standard for PC
            enthusiasts.
          </p>
        </div>
      </div>

      {/* Why Shop With GameVault */}
      <div className="space-y-6">
        <h2 className="font-display text-2xl font-semibold text-[#F4F7FB]">
          Why Shop With GameVault
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              title: '100% Genuine OEM Stock',
              desc: 'Direct distributor sourcing with verifiable serial numbers and full manufacturer warranties.',
            },
            {
              title: 'Real-Time Build Tools',
              desc: 'Check CPU sockets, DDR4/DDR5 pairing, GPU millimeter clearance, and PSU headroom before buying.',
            },
            {
              title: 'Cash on Delivery Support',
              desc: 'Inspect your sealed parcel at your doorstep with straightforward local COD order tracking.',
            },
            {
              title: 'Specialist Support',
              desc: 'Talk directly to technicians who test thermals, BIOS updates, and fan curves daily.',
            },
          ].map((pillar) => (
            <div
              key={pillar.title}
              className="rounded-lg border border-[#222B3E] bg-[#111622] p-5 space-y-2"
            >
              <h3 className="font-display text-base font-semibold text-[#F4F7FB]">
                {pillar.title}
              </h3>
              <p className="text-sm text-[#9CA8BE] leading-relaxed">{pillar.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Contact & Inquiry Section */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 rounded-lg border border-[#222B3E] bg-[#111622] p-6 sm:p-8">
        <div className="lg:col-span-5 space-y-5">
          <h2 className="font-display text-2xl font-semibold text-[#F4F7FB]">
            Contact Hardware Support
          </h2>
          <p className="text-sm text-[#9CA8BE]">
            Need help matching a cooler or checking an active COD dispatch? Reach out directly.
          </p>
          <div className="space-y-3 text-sm text-[#9CA8BE]">
            <p className="flex items-center gap-3">
              <Mail className="w-4 h-4 text-[#00D4FF]" />
              <span>support@gamevault-gear.com</span>
            </p>
            <p className="flex items-center gap-3">
              <Phone className="w-4 h-4 text-[#00D4FF]" />
              <span className="font-mono tabular-nums">+1 (800) 555-0194</span>
            </p>
            <p className="flex items-center gap-3">
              <MapPin className="w-4 h-4 text-[#00D4FF]" />
              <span>420 Silicon Way, Suite 200 · Open Mon–Sat 09:00–19:00</span>
            </p>
          </div>
          <button
            type="button"
            onClick={() => navigate('pc-parts')}
            className="px-4 py-2.5 rounded-md border border-[#33415C] bg-[#161D2C] text-sm font-medium text-[#F4F7FB] hover:border-[#00D4FF] transition-colors"
          >
            Browse Component Catalog
          </button>
        </div>

        <form onSubmit={handleContact} noValidate className="lg:col-span-7 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="about-name" className="block text-xs font-medium text-[#9CA8BE]">
                Your Name
              </label>
              <input
                id="about-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Alex Mercer"
                className="w-full px-3.5 py-2.5 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm text-[#F4F7FB] min-h-[42px]"
              />
            </div>
            <div className="space-y-1.5">
              <label htmlFor="about-email" className="block text-xs font-medium text-[#9CA8BE]">
                Email Address
              </label>
              <input
                id="about-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="alex@example.com"
                className="w-full px-3.5 py-2.5 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm text-[#F4F7FB] min-h-[42px]"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label htmlFor="about-msg" className="block text-xs font-medium text-[#9CA8BE]">
              Message
            </label>
            <textarea
              id="about-msg"
              rows={3}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about part compatibility, bulk orders, or warranty..."
              className="w-full px-3.5 py-2.5 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm text-[#F4F7FB]"
            />
          </div>

          {error && (
            <p role="alert" className="text-xs text-[#EF4444]">
              {error}
            </p>
          )}
          {sent && !error && (
            <p className="text-xs text-[#10B981]">
              Inquiry received! A GameVault hardware specialist will respond shortly.
            </p>
          )}

          <button
            type="submit"
            className="px-6 py-2.5 rounded-md bg-[#00D4FF] text-[#0B0E14] font-semibold text-sm hover:bg-[#33DEFF] transition-colors min-h-[42px]"
          >
            Send Inquiry
          </button>
        </form>
      </div>
    </div>
  );
};
