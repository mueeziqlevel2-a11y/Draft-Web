import React, { useEffect, useState } from 'react';
import {
  AlertCircle,
  ArrowRight,
  CheckCircle2,
  Heart,
  Package,
  Search,
  ShoppingBag,
  Trash2,
  Truck,
} from 'lucide-react';
import { CATEGORY_LABELS } from '../data/products';
import { useStore } from '../context/StoreContext';
import { ProductImage } from '../components/ProductCard';
import { OrderRecord, OrderStatus } from '../types';
import { formatPrice, getProductById, validatePromoCode } from '../utils/storage';

export const WishlistPage: React.FC = () => {
  const { wishlist, toggleWishlist, addToCart, navigate, pushToast } = useStore();
  const items = wishlist
    .map((id) => getProductById(id))
    .filter((p): p is NonNullable<typeof p> => Boolean(p));

  const totalValue = items.reduce((sum, p) => sum + p.price, 0);

  const handleAddAll = () => {
    const inStock = items.filter((p) => p.stock > 0);
    if (inStock.length === 0) {
      pushToast('No stock available', 'Saved items are currently out of stock.', 'warning');
      return;
    }
    inStock.forEach((p) => addToCart(p.id, 1));
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#222B3E] pb-6">
        <div className="space-y-1">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F7FB]">
            Saved Wishlist
          </h1>
          <p className="text-sm text-[#9CA8BE] font-mono tabular-nums">
            {items.length} Saved Item{items.length === 1 ? '' : 's'} · Estimated Total{' '}
            {formatPrice(totalValue)}
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={handleAddAll}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#00D4FF] text-[#0B0E14] text-sm font-semibold hover:bg-[#33DEFF] transition-colors"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Add All to Cart</span>
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-[#222B3E] bg-[#111622] p-12 text-center space-y-4">
          <Heart className="w-10 h-10 text-[#64728C] mx-auto" />
          <h2 className="font-display text-xl font-semibold text-[#F4F7FB]">
            Your Wishlist is Empty
          </h2>
          <p className="text-sm text-[#9CA8BE] max-w-md mx-auto">
            Click the heart icon on any GPU, processor, mouse, or keyboard to save it here for
            comparison and future builds.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('pc-parts')}
              className="px-5 py-2.5 rounded-md bg-[#00D4FF] text-[#0B0E14] text-sm font-semibold"
            >
              Browse PC Parts
            </button>
            <button
              type="button"
              onClick={() => navigate('gaming-gear')}
              className="px-5 py-2.5 rounded-md border border-[#33415C] bg-[#161D2C] text-sm font-medium text-[#F4F7FB]"
            >
              Browse Gaming Gear
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((item) => (
            <div
              key={item.id}
              className="rounded-lg border border-[#222B3E] bg-[#111622] overflow-hidden flex flex-col"
            >
              <button
                type="button"
                onClick={() => navigate('part-details', { productId: item.id })}
                className="aspect-[4/3] bg-[#0E131D] border-b border-[#222B3E] block"
              >
                <ProductImage src={item.images[0]} alt={item.name} />
              </button>
              <div className="p-4 flex-1 flex flex-col justify-between gap-4">
                <div className="space-y-1">
                  <p className="text-xs text-[#9CA8BE]">
                    {item.brand} · {CATEGORY_LABELS[item.category]}
                  </p>
                  <button
                    type="button"
                    onClick={() => navigate('part-details', { productId: item.id })}
                    className="font-display text-base font-semibold text-[#F4F7FB] hover:text-[#00D4FF] text-left block"
                  >
                    {item.name}
                  </button>
                  <p className="font-mono tabular-nums text-lg font-bold text-[#F4F7FB]">
                    {formatPrice(item.price)}
                  </p>
                </div>

                <div className="flex items-center gap-2 pt-3 border-t border-[#222B3E]">
                  <button
                    type="button"
                    disabled={item.stock <= 0}
                    onClick={() => {
                      addToCart(item.id, 1);
                      toggleWishlist(item.id);
                    }}
                    className="flex-1 py-2.5 rounded-md bg-[#00D4FF] text-[#0B0E14] text-xs font-semibold hover:bg-[#33DEFF] disabled:opacity-50"
                  >
                    {item.stock > 0 ? 'Move to Cart' : 'Out of Stock'}
                  </button>
                  <button
                    type="button"
                    onClick={() => toggleWishlist(item.id)}
                    aria-label={`Remove ${item.name} from wishlist`}
                    className="p-2.5 rounded-md border border-[#222B3E] bg-[#161D2C] text-[#9CA8BE] hover:text-[#EF4444]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export const CartPage: React.FC = () => {
  const {
    cart,
    cartTotals,
    activePromoCode,
    setActivePromo,
    updateCartQty,
    removeFromCart,
    navigate,
    pushToast,
  } = useStore();

  const [promoInput, setPromoInput] = useState(activePromoCode || '');
  const [promoError, setPromoError] = useState('');

  const lineItems = cart
    .map((ci) => {
      const product = getProductById(ci.productId);
      return product ? { ...ci, product } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    const res = validatePromoCode(promoInput);
    if (res.ok && res.entry) {
      setActivePromo(res.entry.code);
      setPromoError('');
      pushToast('Promo applied', `${res.entry.code} (${res.entry.discountPercent}% off)`, 'success');
    } else {
      setPromoError(res.message);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-[#222B3E] pb-6 space-y-1">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F7FB]">
          Shopping Cart
        </h1>
        <p className="text-sm text-[#9CA8BE]">
          Free express delivery on orders over <span className="font-mono">$150</span>.
        </p>
      </div>

      {lineItems.length === 0 ? (
        <div className="rounded-lg border border-[#222B3E] bg-[#111622] p-12 text-center space-y-4">
          <ShoppingBag className="w-10 h-10 text-[#64728C] mx-auto" />
          <h2 className="font-display text-xl font-semibold text-[#F4F7FB]">
            Your Vault Cart is Empty
          </h2>
          <p className="text-sm text-[#9CA8BE] max-w-md mx-auto">
            Add components from PC Parts, Gaming Gear, Flash Deals, or build a full rig in PC
            Builder.
          </p>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <button
              type="button"
              onClick={() => navigate('pc-parts')}
              className="px-5 py-2.5 rounded-md bg-[#00D4FF] text-[#0B0E14] text-sm font-semibold"
            >
              Shop PC Parts
            </button>
            <button
              type="button"
              onClick={() => navigate('flash-deals')}
              className="px-5 py-2.5 rounded-md border border-[#33415C] bg-[#161D2C] text-sm font-medium text-[#F4F7FB]"
            >
              View Flash Deals
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Items */}
          <div className="lg:col-span-8 space-y-3">
            {lineItems.map(({ product, quantity }) => (
              <div
                key={product.id}
                className="rounded-lg border border-[#222B3E] bg-[#111622] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <button
                    type="button"
                    onClick={() => navigate('part-details', { productId: product.id })}
                    className="w-24 h-18 rounded-md border border-[#222B3E] bg-[#0E131D] overflow-hidden shrink-0"
                  >
                    <ProductImage src={product.images[0]} alt={product.name} />
                  </button>
                  <div className="min-w-0 space-y-1">
                    <p className="text-xs text-[#9CA8BE]">
                      {product.brand} · {product.sku}
                    </p>
                    <button
                      type="button"
                      onClick={() => navigate('part-details', { productId: product.id })}
                      className="font-display text-base font-semibold text-[#F4F7FB] hover:text-[#00D4FF] text-left block truncate"
                    >
                      {product.name}
                    </button>
                    <p className="font-mono tabular-nums text-xs text-[#9CA8BE]">
                      {formatPrice(product.price)} each
                    </p>
                  </div>
                </div>

                <div className="flex items-center justify-between sm:justify-end gap-4 shrink-0">
                  <div className="inline-flex items-center rounded-md border border-[#222B3E] bg-[#161D2C]">
                    <button
                      type="button"
                      onClick={() => updateCartQty(product.id, quantity - 1)}
                      aria-label={`Decrease ${product.name} quantity`}
                      className="px-3 py-1.5 text-sm text-[#F4F7FB] hover:text-[#00D4FF]"
                    >
                      −
                    </button>
                    <span className="px-3 font-mono tabular-nums text-sm text-[#F4F7FB]">
                      {quantity}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateCartQty(product.id, quantity + 1)}
                      aria-label={`Increase ${product.name} quantity`}
                      className="px-3 py-1.5 text-sm text-[#F4F7FB] hover:text-[#00D4FF]"
                    >
                      +
                    </button>
                  </div>

                  <span className="font-mono tabular-nums text-base font-bold text-[#F4F7FB] w-24 text-right">
                    {formatPrice(product.price * quantity)}
                  </span>

                  <button
                    type="button"
                    onClick={() => removeFromCart(product.id)}
                    aria-label={`Remove ${product.name}`}
                    className="p-2 rounded-md border border-[#222B3E] text-[#9CA8BE] hover:text-[#EF4444]"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* Summary */}
          <aside className="lg:col-span-4 rounded-lg border border-[#222B3E] bg-[#111622] p-6 space-y-5 lg:sticky lg:top-24">
            <h2 className="font-display text-lg font-semibold text-[#F4F7FB]">Order Summary</h2>

            <form onSubmit={handleApplyPromo} className="space-y-2">
              <label htmlFor="cart-promo" className="block text-xs font-medium text-[#9CA8BE]">
                Promo Code (Try VAULT15 or RIG10)
              </label>
              <div className="flex gap-2">
                <input
                  id="cart-promo"
                  type="text"
                  value={promoInput}
                  onChange={(e) => setPromoInput(e.target.value)}
                  placeholder="Enter code"
                  className="flex-1 px-3 py-2 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm font-mono uppercase text-[#F4F7FB]"
                />
                <button
                  type="submit"
                  className="px-4 py-2 rounded-md border border-[#33415C] bg-[#161D2C] text-xs font-semibold text-[#F4F7FB] hover:border-[#00D4FF]"
                >
                  Apply
                </button>
              </div>
              {promoError && (
                <p role="alert" className="text-xs text-[#EF4444]">
                  {promoError}
                </p>
              )}
              {activePromoCode && !promoError && (
                <div className="flex items-center justify-between text-xs text-[#10B981]">
                  <span>
                    {activePromoCode} active (-{cartTotals.discountPercent}%)
                  </span>
                  <button
                    type="button"
                    onClick={() => {
                      setActivePromo(null);
                      setPromoInput('');
                    }}
                    className="underline text-[#9CA8BE]"
                  >
                    Remove
                  </button>
                </div>
              )}
            </form>

            <div className="space-y-2.5 pt-4 border-t border-[#222B3E] text-sm">
              <div className="flex justify-between">
                <span className="text-[#9CA8BE]">Subtotal</span>
                <span className="font-mono tabular-nums text-[#F4F7FB]">
                  {formatPrice(cartTotals.subtotal)}
                </span>
              </div>
              {cartTotals.discountAmount > 0 && (
                <div className="flex justify-between text-[#10B981]">
                  <span>Promo Discount</span>
                  <span className="font-mono tabular-nums">
                    −{formatPrice(cartTotals.discountAmount)}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-[#9CA8BE]">Shipping</span>
                <span className="font-mono tabular-nums text-[#F4F7FB]">
                  {cartTotals.shippingFee === 0 ? 'FREE' : formatPrice(cartTotals.shippingFee)}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-3 border-t border-[#222B3E]">
                <span className="font-semibold text-[#F4F7FB]">Estimated Total</span>
                <span className="font-mono tabular-nums text-2xl font-bold text-[#F4F7FB]">
                  {formatPrice(cartTotals.total)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate('checkout')}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-md bg-[#00D4FF] text-[#0B0E14] font-semibold text-sm hover:bg-[#33DEFF] transition-colors min-h-[44px]"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </aside>
        </div>
      )}
    </div>
  );
};

export const CheckoutPage: React.FC = () => {
  const { cart, cartTotals, activePromoCode, placeOrder, navigate } = useStore();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [postalCode, setPostalCode] = useState('');
  const [notes, setNotes] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [confirmedOrder, setConfirmedOrder] = useState<OrderRecord | null>(null);

  const lineItems = cart
    .map((ci) => {
      const product = getProductById(ci.productId);
      return product ? { ...ci, product } : null;
    })
    .filter((x): x is NonNullable<typeof x> => x !== null);

  if (confirmedOrder) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-14 space-y-6">
        <div className="rounded-lg border border-[#10B981]/50 bg-[#111622] p-8 space-y-6">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-8 h-8 text-[#10B981] shrink-0" />
            <div>
              <p className="text-xs font-semibold uppercase tracking-wider text-[#10B981]">
                Cash-on-Delivery Order Confirmed
              </p>
              <h1 className="font-display text-2xl font-bold text-[#F4F7FB]">
                Order {confirmedOrder.orderId}
              </h1>
            </div>
          </div>

          <p className="text-sm text-[#9CA8BE]">
            Thank you, <span className="text-[#F4F7FB] font-medium">{confirmedOrder.customer.fullName}</span>.
            Your simulated Cash-on-Delivery order has been saved locally and queued for dispatch to{' '}
            <span className="text-[#F4F7FB]">
              {confirmedOrder.customer.address}, {confirmedOrder.customer.city}
            </span>
            .
          </p>

          <div className="rounded-md border border-[#222B3E] bg-[#161D2C] p-4 space-y-2 text-sm">
            {confirmedOrder.items.map((it) => (
              <div key={it.productId} className="flex justify-between">
                <span className="text-[#9CA8BE]">
                  {it.name} × {it.quantity}
                </span>
                <span className="font-mono tabular-nums text-[#F4F7FB]">
                  {formatPrice(it.unitPrice * it.quantity)}
                </span>
              </div>
            ))}
            <div className="pt-2 border-t border-[#222B3E] flex justify-between font-bold">
              <span className="text-[#F4F7FB]">Total Due on Delivery</span>
              <span className="font-mono tabular-nums text-[#00D4FF]">
                {formatPrice(confirmedOrder.total)}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => navigate('order-tracking', { orderId: confirmedOrder.orderId })}
              className="px-5 py-2.5 rounded-md bg-[#00D4FF] text-[#0B0E14] text-sm font-semibold hover:bg-[#33DEFF]"
            >
              Track Your Order
            </button>
            <button
              type="button"
              onClick={() => navigate('home')}
              className="px-5 py-2.5 rounded-md border border-[#33415C] bg-[#161D2C] text-sm font-medium text-[#F4F7FB]"
            >
              Return Home
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (lineItems.length === 0) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-16 text-center space-y-4">
        <ShoppingBag className="w-10 h-10 text-[#64728C] mx-auto" />
        <h1 className="font-display text-2xl font-bold text-[#F4F7FB]">
          Your Cart is Empty
        </h1>
        <p className="text-sm text-[#9CA8BE]">
          Add hardware components or gaming peripherals before proceeding to checkout.
        </p>
        <button
          type="button"
          onClick={() => navigate('pc-parts')}
          className="px-5 py-2.5 rounded-md bg-[#00D4FF] text-[#0B0E14] text-sm font-semibold"
        >
          Shop PC Parts
        </button>
      </div>
    );
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const nextErrors: Record<string, string> = {};

    if (fullName.trim().length < 3) {
      nextErrors.fullName = 'Full name must be at least 3 characters.';
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = 'Enter a valid email address.';
    }
    if (phone.replace(/\D/g, '').length < 8) {
      nextErrors.phone = 'Enter a valid phone number (at least 8 digits).';
    }
    if (address.trim().length < 8) {
      nextErrors.address = 'Enter a complete street delivery address.';
    }
    if (city.trim().length < 2) {
      nextErrors.city = 'City is required.';
    }
    if (postalCode.trim().length < 3) {
      nextErrors.postalCode = 'Postal code is required.';
    }

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) {
      const firstId = `chk-${Object.keys(nextErrors)[0]}`;
      document.getElementById(firstId)?.focus();
      return;
    }

    const order = placeOrder({
      fullName: fullName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      address: address.trim(),
      city: city.trim(),
      postalCode: postalCode.trim(),
      notes: notes.trim(),
    });
    if (order) {
      setConfirmedOrder(order);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-[#222B3E] pb-6 space-y-1">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F7FB]">
          Cash-on-Delivery Checkout
        </h1>
        <p className="text-sm text-[#9CA8BE]">
          Simulated academic checkout — no online card entry required. Pay upon parcel inspection.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Feature: Checkout Form */}
        <form
          onSubmit={handleSubmit}
          noValidate
          className="lg:col-span-7 rounded-lg border border-[#222B3E] bg-[#111622] p-6 space-y-5"
        >
          <h2 className="font-display text-lg font-semibold text-[#F4F7FB]">
            Delivery Information
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="chk-fullName" className="block text-xs font-medium text-[#9CA8BE]">
                Full Name *
              </label>
              <input
                id="chk-fullName"
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Jordan Vance"
                className={`w-full px-3.5 py-2.5 rounded-md bg-[#161D2C] border text-sm text-[#F4F7FB] min-h-[42px] ${
                  errors.fullName ? 'border-[#EF4444]' : 'border-[#222B3E]'
                }`}
              />
              {errors.fullName && (
                <p role="alert" className="text-xs text-[#EF4444]">
                  {errors.fullName}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="chk-email" className="block text-xs font-medium text-[#9CA8BE]">
                Email Address *
              </label>
              <input
                id="chk-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="jordan@example.com"
                className={`w-full px-3.5 py-2.5 rounded-md bg-[#161D2C] border text-sm text-[#F4F7FB] min-h-[42px] ${
                  errors.email ? 'border-[#EF4444]' : 'border-[#222B3E]'
                }`}
              />
              {errors.email && (
                <p role="alert" className="text-xs text-[#EF4444]">
                  {errors.email}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="chk-phone" className="block text-xs font-medium text-[#9CA8BE]">
                Phone Number *
              </label>
              <input
                id="chk-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 555 019 4821"
                className={`w-full px-3.5 py-2.5 rounded-md bg-[#161D2C] border text-sm font-mono text-[#F4F7FB] min-h-[42px] ${
                  errors.phone ? 'border-[#EF4444]' : 'border-[#222B3E]'
                }`}
              />
              {errors.phone && (
                <p role="alert" className="text-xs text-[#EF4444]">
                  {errors.phone}
                </p>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="chk-address" className="block text-xs font-medium text-[#9CA8BE]">
                Street Delivery Address *
              </label>
              <input
                id="chk-address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="742 Evergreen Terrace, Apt 4B"
                className={`w-full px-3.5 py-2.5 rounded-md bg-[#161D2C] border text-sm text-[#F4F7FB] min-h-[42px] ${
                  errors.address ? 'border-[#EF4444]' : 'border-[#222B3E]'
                }`}
              />
              {errors.address && (
                <p role="alert" className="text-xs text-[#EF4444]">
                  {errors.address}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="chk-city" className="block text-xs font-medium text-[#9CA8BE]">
                City *
              </label>
              <input
                id="chk-city"
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                placeholder="Seattle"
                className={`w-full px-3.5 py-2.5 rounded-md bg-[#161D2C] border text-sm text-[#F4F7FB] min-h-[42px] ${
                  errors.city ? 'border-[#EF4444]' : 'border-[#222B3E]'
                }`}
              />
              {errors.city && (
                <p role="alert" className="text-xs text-[#EF4444]">
                  {errors.city}
                </p>
              )}
            </div>

            <div className="space-y-1.5">
              <label htmlFor="chk-postalCode" className="block text-xs font-medium text-[#9CA8BE]">
                Postal Code *
              </label>
              <input
                id="chk-postalCode"
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                placeholder="98101"
                className={`w-full px-3.5 py-2.5 rounded-md bg-[#161D2C] border text-sm font-mono text-[#F4F7FB] min-h-[42px] ${
                  errors.postalCode ? 'border-[#EF4444]' : 'border-[#222B3E]'
                }`}
              />
              {errors.postalCode && (
                <p role="alert" className="text-xs text-[#EF4444]">
                  {errors.postalCode}
                </p>
              )}
            </div>

            <div className="space-y-1.5 sm:col-span-2">
              <label htmlFor="chk-notes" className="block text-xs font-medium text-[#9CA8BE]">
                Delivery Instructions (Optional)
              </label>
              <textarea
                id="chk-notes"
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Call on arrival, leave with building concierge..."
                className="w-full px-3.5 py-2 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm text-[#F4F7FB]"
              />
            </div>
          </div>

          <div className="rounded-md border border-[#00D4FF]/40 bg-[#0B2A38]/50 p-4 flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <Truck className="w-5 h-5 text-[#00D4FF] shrink-0" />
              <div>
                <p className="text-sm font-semibold text-[#F4F7FB]">
                  Payment Method: Cash on Delivery (COD)
                </p>
                <p className="text-xs text-[#9CA8BE]">
                  Pay courier in cash or mobile tap upon sealed hardware delivery.
                </p>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-3.5 rounded-md bg-[#00D4FF] text-[#0B0E14] font-semibold text-sm hover:bg-[#33DEFF] transition-colors min-h-[46px]"
          >
            Place Cash-on-Delivery Order ({formatPrice(cartTotals.total)})
          </button>
        </form>

        {/* Summary */}
        <aside className="lg:col-span-5 rounded-lg border border-[#222B3E] bg-[#111622] p-6 space-y-4 lg:sticky lg:top-24">
          <h2 className="font-display text-lg font-semibold text-[#F4F7FB]">
            Items in Order ({lineItems.length})
          </h2>

          <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
            {lineItems.map(({ product, quantity }) => (
              <div key={product.id} className="flex items-center justify-between gap-3 text-sm">
                <div className="min-w-0">
                  <p className="text-[#F4F7FB] font-medium truncate">{product.name}</p>
                  <p className="text-xs text-[#64728C] font-mono tabular-nums">
                    Qty {quantity} × {formatPrice(product.price)}
                  </p>
                </div>
                <span className="font-mono tabular-nums text-[#F4F7FB] shrink-0">
                  {formatPrice(product.price * quantity)}
                </span>
              </div>
            ))}
          </div>

          <div className="space-y-2 pt-4 border-t border-[#222B3E] text-sm">
            <div className="flex justify-between">
              <span className="text-[#9CA8BE]">Subtotal</span>
              <span className="font-mono tabular-nums text-[#F4F7FB]">
                {formatPrice(cartTotals.subtotal)}
              </span>
            </div>
            {cartTotals.discountAmount > 0 && (
              <div className="flex justify-between text-[#10B981]">
                <span>Promo ({activePromoCode})</span>
                <span className="font-mono tabular-nums">
                  −{formatPrice(cartTotals.discountAmount)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-[#9CA8BE]">Delivery Fee</span>
              <span className="font-mono tabular-nums text-[#F4F7FB]">
                {cartTotals.shippingFee === 0 ? 'FREE' : formatPrice(cartTotals.shippingFee)}
              </span>
            </div>
            <div className="flex justify-between items-baseline pt-3 border-t border-[#222B3E]">
              <span className="font-semibold text-[#F4F7FB]">Total Due (COD)</span>
              <span className="font-mono tabular-nums text-2xl font-bold text-[#00D4FF]">
                {formatPrice(cartTotals.total)}
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
};

const ORDER_STAGES: OrderStatus[] = ['Processing', 'Confirmed', 'Shipped', 'Delivered'];

export const OrderTrackingPage: React.FC = () => {
  const { orders, params, advanceOrderStatus, navigate } = useStore();
  const [queryId, setQueryId] = useState(params.orderId || orders[0]?.orderId || '');
  const [searchedId, setSearchedId] = useState(params.orderId || orders[0]?.orderId || '');
  const [lookupError, setLookupError] = useState('');

  useEffect(() => {
    if (params.orderId) {
      setQueryId(params.orderId);
      setSearchedId(params.orderId);
      setLookupError('');
    }
  }, [params.orderId]);

  const activeOrder = orders.find(
    (o) => o.orderId.toUpperCase() === searchedId.trim().toUpperCase()
  );

  const handleLookup = (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = queryId.trim().toUpperCase();
    if (!trimmed) {
      setLookupError('Enter an Order ID (format: GV-2026-XXXX).');
      return;
    }
    const found = orders.find((o) => o.orderId.toUpperCase() === trimmed);
    setSearchedId(trimmed);
    if (!found) {
      setLookupError(`Order "${trimmed}" not found in local order history.`);
    } else {
      setLookupError('');
    }
  };

  const currentStageIndex = activeOrder ? ORDER_STAGES.indexOf(activeOrder.status) : -1;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="border-b border-[#222B3E] pb-6 space-y-2">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F7FB]">
          Order Tracking
        </h1>
        <p className="text-sm text-[#9CA8BE]">
          Look up any locally placed GameVault order and monitor fulfillment progress.
        </p>
      </div>

      {/* Lookup Bar */}
      <form
        onSubmit={handleLookup}
        className="rounded-lg border border-[#222B3E] bg-[#111622] p-5 space-y-4"
      >
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-[#64728C] absolute left-3.5 top-1/2 -translate-y-1/2" />
            <label htmlFor="track-order-id" className="sr-only">
              Order ID
            </label>
            <input
              id="track-order-id"
              type="text"
              value={queryId}
              onChange={(e) => setQueryId(e.target.value)}
              placeholder="Enter Order ID (e.g., GV-2026-4819)"
              className="w-full pl-10 pr-4 py-2.5 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm font-mono uppercase text-[#F4F7FB] min-h-[44px]"
            />
          </div>
          <button
            type="submit"
            className="px-6 py-2.5 rounded-md bg-[#00D4FF] text-[#0B0E14] font-semibold text-sm hover:bg-[#33DEFF] min-h-[44px]"
          >
            Track Order
          </button>
        </div>

        {orders.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-xs text-[#9CA8BE]">
            <span>Recent local orders:</span>
            {orders.slice(0, 5).map((o) => (
              <button
                key={o.orderId}
                type="button"
                onClick={() => {
                  setQueryId(o.orderId);
                  setSearchedId(o.orderId);
                  setLookupError('');
                }}
                className={`font-mono px-2.5 py-1 rounded border transition-colors ${
                  activeOrder?.orderId === o.orderId
                    ? 'border-[#00D4FF] bg-[#0B2A38] text-[#00D4FF]'
                    : 'border-[#222B3E] bg-[#161D2C] text-[#F4F7FB]'
                }`}
              >
                {o.orderId}
              </button>
            ))}
          </div>
        )}

        {lookupError && (
          <div
            role="alert"
            className="flex items-center gap-2 text-sm text-[#EF4444] p-3 rounded-md border border-[#EF4444]/40 bg-[#EF4444]/10"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{lookupError}</span>
          </div>
        )}
      </form>

      {orders.length === 0 && !lookupError ? (
        <div className="rounded-lg border border-[#222B3E] bg-[#111622] p-12 text-center space-y-4">
          <Package className="w-10 h-10 text-[#64728C] mx-auto" />
          <h2 className="font-display text-xl font-semibold text-[#F4F7FB]">
            No Orders Recorded Yet
          </h2>
          <p className="text-sm text-[#9CA8BE] max-w-md mx-auto">
            Place an order through the Cash-on-Delivery Checkout page to generate a trackable Order
            ID.
          </p>
          <button
            type="button"
            onClick={() => navigate('pc-parts')}
            className="px-5 py-2.5 rounded-md bg-[#00D4FF] text-[#0B0E14] text-sm font-semibold"
          >
            Start Shopping
          </button>
        </div>
      ) : activeOrder ? (
        <div className="space-y-6">
          {/* Status Timeline */}
          <div className="rounded-lg border border-[#222B3E] bg-[#111622] p-6 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#222B3E]">
              <div>
                <p className="text-xs text-[#9CA8BE]">
                  Placed {new Date(activeOrder.createdAt).toLocaleString()}
                </p>
                <h2 className="font-mono text-xl font-bold text-[#F4F7FB]">
                  {activeOrder.orderId} · {activeOrder.status}
                </h2>
              </div>

              {activeOrder.status !== 'Delivered' && (
                <button
                  type="button"
                  onClick={() => advanceOrderStatus(activeOrder.orderId)}
                  className="px-4 py-2 rounded-md border border-[#33415C] bg-[#161D2C] text-xs font-semibold text-[#00D4FF] hover:border-[#00D4FF]"
                >
                  Simulate Next Stage →
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
              {ORDER_STAGES.map((stage, idx) => {
                const done = idx <= currentStageIndex;
                const current = idx === currentStageIndex;
                return (
                  <div
                    key={stage}
                    className={`p-4 rounded-md border transition-colors ${
                      current
                        ? 'border-[#00D4FF] bg-[#0B2A38]/60'
                        : done
                          ? 'border-[#10B981]/50 bg-[#10B981]/10'
                          : 'border-[#222B3E] bg-[#161D2C]/50 opacity-60'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-mono text-xs text-[#9CA8BE]">0{idx + 1}</span>
                      <CheckCircle2
                        className={`w-4 h-4 ${
                          done ? (current ? 'text-[#00D4FF]' : 'text-[#10B981]') : 'text-[#64728C]'
                        }`}
                      />
                    </div>
                    <p className="font-display text-sm font-semibold text-[#F4F7FB]">{stage}</p>
                    <p className="text-xs text-[#9CA8BE] mt-0.5">
                      {stage === 'Processing' && 'Queued for pick & pack'}
                      {stage === 'Confirmed' && 'Sealed & verified'}
                      {stage === 'Shipped' && 'Out with COD courier'}
                      {stage === 'Delivered' && 'Received & settled'}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Receipt */}
          <div className="rounded-lg border border-[#222B3E] bg-[#111622] p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2 text-sm">
              <h3 className="font-display text-base font-semibold text-[#F4F7FB]">
                Recipient & Delivery
              </h3>
              <p className="text-[#F4F7FB]">{activeOrder.customer.fullName}</p>
              <p className="text-[#9CA8BE]">{activeOrder.customer.email}</p>
              <p className="text-[#9CA8BE] font-mono">{activeOrder.customer.phone}</p>
              <p className="text-[#9CA8BE]">
                {activeOrder.customer.address}, {activeOrder.customer.city}{' '}
                {activeOrder.customer.postalCode}
              </p>
            </div>

            <div className="space-y-2 text-sm">
              <h3 className="font-display text-base font-semibold text-[#F4F7FB]">
                Order Breakdown
              </h3>
              {activeOrder.items.map((it) => (
                <div key={it.productId} className="flex justify-between">
                  <span className="text-[#9CA8BE]">
                    {it.name} × {it.quantity}
                  </span>
                  <span className="font-mono tabular-nums text-[#F4F7FB]">
                    {formatPrice(it.unitPrice * it.quantity)}
                  </span>
                </div>
              ))}
              {activeOrder.discountAmount > 0 && (
                <div className="flex justify-between text-[#10B981]">
                  <span>Promo ({activeOrder.promoCode})</span>
                  <span className="font-mono tabular-nums">
                    −{formatPrice(activeOrder.discountAmount)}
                  </span>
                </div>
              )}
              <div className="pt-2 border-t border-[#222B3E] flex justify-between font-bold">
                <span className="text-[#F4F7FB]">COD Total</span>
                <span className="font-mono tabular-nums text-[#00D4FF]">
                  {formatPrice(activeOrder.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
