import React, { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { PROMO_CODES } from '../data/products';
import {
  BuildSlotKey,
  CartItem,
  OrderCustomer,
  OrderRecord,
  PCBuildState,
  PageId,
  ToastMessage,
} from '../types';
import {
  EMPTY_BUILD,
  STORAGE_KEYS,
  generateOrderId,
  getNextOrderStatus,
  getProductById,
  safeReadStorage,
  safeWriteStorage,
  validatePromoCode,
} from '../utils/storage';

export interface RouteParams {
  productId?: string;
  category?: string;
  orderId?: string;
}

interface StoreContextValue {
  page: PageId;
  params: RouteParams;
  navigate: (page: PageId, params?: RouteParams) => void;
  cart: CartItem[];
  cartCount: number;
  wishlist: string[];
  wishlistCount: number;
  orders: OrderRecord[];
  build: PCBuildState;
  activePromoCode: string | null;
  compareIds: string[];
  toasts: ToastMessage[];
  addToCart: (productId: string, quantity?: number) => void;
  updateCartQty: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  toggleWishlist: (productId: string) => void;
  isWishlisted: (productId: string) => boolean;
  setActivePromo: (code: string | null) => void;
  toggleCompareId: (productId: string) => void;
  setCompareSlot: (index: number, productId: string | null) => void;
  clearCompare: () => void;
  setBuildSlot: (slot: BuildSlotKey, productId: string | null) => void;
  setBuildName: (name: string) => void;
  saveCurrentBuild: () => void;
  clearCurrentBuild: () => void;
  placeOrder: (customer: OrderCustomer) => OrderRecord | null;
  advanceOrderStatus: (orderId: string) => void;
  dismissToast: (id: string) => void;
  pushToast: (title: string, detail?: string, variant?: ToastMessage['variant']) => void;
  cartTotals: {
    subtotal: number;
    discountAmount: number;
    discountPercent: number;
    shippingFee: number;
    total: number;
  };
}

const StoreContext = createContext<StoreContextValue | null>(null);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [page, setPage] = useState<PageId>('home');
  const [params, setParams] = useState<RouteParams>({});

  const [cart, setCart] = useState<CartItem[]>(() => safeReadStorage<CartItem[]>(STORAGE_KEYS.CART, []));
  const [wishlist, setWishlist] = useState<string[]>(() =>
    safeReadStorage<string[]>(STORAGE_KEYS.WISHLIST, [])
  );
  const [orders, setOrders] = useState<OrderRecord[]>(() =>
    safeReadStorage<OrderRecord[]>(STORAGE_KEYS.ORDERS, [])
  );
  const [build, setBuild] = useState<PCBuildState>(() =>
    safeReadStorage<PCBuildState>(STORAGE_KEYS.BUILD, EMPTY_BUILD)
  );
  const [activePromoCode, setActivePromoCode] = useState<string | null>(() => {
    const saved = safeReadStorage<string | null>(STORAGE_KEYS.PROMO, null);
    if (!saved) return null;
    return validatePromoCode(saved).ok ? saved : null;
  });

  const [compareIds, setCompareIds] = useState<string[]>([
    'gpu-rtx-4090-apex',
    'gpu-rtx-4080-super-pro',
  ]);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  useEffect(() => {
    safeWriteStorage(STORAGE_KEYS.CART, cart);
  }, [cart]);

  useEffect(() => {
    safeWriteStorage(STORAGE_KEYS.WISHLIST, wishlist);
  }, [wishlist]);

  useEffect(() => {
    safeWriteStorage(STORAGE_KEYS.ORDERS, orders);
  }, [orders]);

  useEffect(() => {
    safeWriteStorage(STORAGE_KEYS.PROMO, activePromoCode);
  }, [activePromoCode]);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const pushToast = useCallback(
    (title: string, detail?: string, variant: ToastMessage['variant'] = 'info') => {
      const id = `${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
      setToasts((prev) => [...prev.slice(-2), { id, title, detail, variant }]);
      window.setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.id !== id));
      }, 3400);
    },
    []
  );

  const navigate = useCallback((nextPage: PageId, nextParams: RouteParams = {}) => {
    setPage(nextPage);
    setParams(nextParams);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  const addToCart = useCallback(
    (productId: string, quantity = 1) => {
      const product = getProductById(productId);
      if (!product) {
        pushToast('Item unavailable', 'Could not locate product record.', 'error');
        return;
      }
      if (product.stock <= 0) {
        pushToast('Out of stock', `${product.name} is currently unavailable.`, 'warning');
        return;
      }

      setCart((prev) => {
        const existing = prev.find((item) => item.productId === productId);
        if (existing) {
          const nextQty = Math.min(product.stock, existing.quantity + quantity);
          if (nextQty === existing.quantity) {
            pushToast('Stock limit reached', `Max available stock is ${product.stock}.`, 'warning');
            return prev;
          }
          pushToast('Cart updated', `${product.name} (${nextQty} in cart)`, 'success');
          return prev.map((item) =>
            item.productId === productId ? { ...item, quantity: nextQty } : item
          );
        }
        const safeQty = Math.min(product.stock, Math.max(1, quantity));
        pushToast('Added to cart', product.name, 'success');
        return [...prev, { productId, quantity: safeQty, addedAt: new Date().toISOString() }];
      });
    },
    [pushToast]
  );

  const updateCartQty = useCallback(
    (productId: string, quantity: number) => {
      const product = getProductById(productId);
      if (!product) return;
      if (quantity <= 0) {
        setCart((prev) => prev.filter((i) => i.productId !== productId));
        return;
      }
      if (quantity > product.stock) {
        pushToast('Stock cap reached', `Only ${product.stock} units available.`, 'warning');
      }
      const clamped = Math.min(product.stock, Math.max(1, quantity));
      setCart((prev) =>
        prev.map((item) => (item.productId === productId ? { ...item, quantity: clamped } : item))
      );
    },
    [pushToast]
  );

  const removeFromCart = useCallback(
    (productId: string) => {
      const product = getProductById(productId);
      setCart((prev) => prev.filter((item) => item.productId !== productId));
      if (product) {
        pushToast('Removed from cart', product.name, 'info');
      }
    },
    [pushToast]
  );

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);

  const toggleWishlist = useCallback(
    (productId: string) => {
      const product = getProductById(productId);
      setWishlist((prev) => {
        const exists = prev.includes(productId);
        if (exists) {
          pushToast('Removed from wishlist', product?.name, 'info');
          return prev.filter((id) => id !== productId);
        }
        pushToast('Saved to wishlist', product?.name, 'success');
        return [...prev, productId];
      });
    },
    [pushToast]
  );

  const isWishlisted = useCallback((productId: string) => wishlist.includes(productId), [wishlist]);

  const setActivePromo = useCallback((code: string | null) => {
    setActivePromoCode(code ? code.toUpperCase() : null);
  }, []);

  const toggleCompareId = useCallback(
    (productId: string) => {
      const product = getProductById(productId);
      setCompareIds((prev) => {
        if (prev.includes(productId)) {
          pushToast('Removed from comparison', product?.name, 'info');
          return prev.filter((id) => id !== productId);
        }
        if (prev.length >= 4) {
          pushToast('Comparison limit reached', 'Maximum 4 products can be compared.', 'warning');
          return prev;
        }
        pushToast('Added to comparison', product?.name, 'success');
        return [...prev, productId];
      });
    },
    [pushToast]
  );

  const setCompareSlot = useCallback((index: number, productId: string | null) => {
    setCompareIds((prev) => {
      const copy = [...prev];
      if (!productId) {
        copy.splice(index, 1);
        return copy;
      }
      copy[index] = productId;
      return copy.filter(Boolean);
    });
  }, []);

  const clearCompare = useCallback(() => {
    setCompareIds([]);
  }, []);

  const setBuildSlot = useCallback((slot: BuildSlotKey, productId: string | null) => {
    setBuild((prev) => {
      const next: PCBuildState = {
        ...prev,
        updatedAt: new Date().toISOString(),
        slots: { ...prev.slots, [slot]: productId },
      };
      safeWriteStorage(STORAGE_KEYS.BUILD, next);
      return next;
    });
  }, []);

  const setBuildName = useCallback((name: string) => {
    setBuild((prev) => ({ ...prev, buildName: name }));
  }, []);

  const saveCurrentBuild = useCallback(() => {
    const next: PCBuildState = {
      ...build,
      buildName: build.buildName.trim() || 'Custom Vault Rig',
      updatedAt: new Date().toISOString(),
    };
    setBuild(next);
    safeWriteStorage(STORAGE_KEYS.BUILD, next);
    pushToast('Build saved', `"${next.buildName}" stored in local memory.`, 'success');
  }, [build, pushToast]);

  const clearCurrentBuild = useCallback(() => {
    const fresh: PCBuildState = {
      ...EMPTY_BUILD,
      updatedAt: new Date().toISOString(),
      slots: { ...EMPTY_BUILD.slots },
    };
    setBuild(fresh);
    safeWriteStorage(STORAGE_KEYS.BUILD, fresh);
    pushToast('Build cleared', 'All 7 component slots reset.', 'info');
  }, [pushToast]);

  const cartTotals = useMemo(() => {
    const subtotal = cart.reduce((sum, item) => {
      const prod = getProductById(item.productId);
      return sum + (prod ? prod.price * item.quantity : 0);
    }, 0);

    const promoEntry = activePromoCode
      ? PROMO_CODES.find((p) => p.code === activePromoCode && p.status === 'active')
      : undefined;
    const discountPercent = promoEntry ? promoEntry.discountPercent : 0;
    const discountAmount = Math.round(subtotal * (discountPercent / 100) * 100) / 100;
    const discountedSubtotal = Math.max(0, subtotal - discountAmount);
    const shippingFee = subtotal === 0 ? 0 : discountedSubtotal >= 150 ? 0 : 14.99;
    const total = Math.round((discountedSubtotal + shippingFee) * 100) / 100;

    return {
      subtotal,
      discountAmount,
      discountPercent,
      shippingFee,
      total,
    };
  }, [cart, activePromoCode]);

  const placeOrder = useCallback(
    (customer: OrderCustomer): OrderRecord | null => {
      if (cart.length === 0) return null;

      const items = cart
        .map((item) => {
          const prod = getProductById(item.productId);
          if (!prod) return null;
          return {
            productId: prod.id,
            name: prod.name,
            sku: prod.sku,
            unitPrice: prod.price,
            quantity: item.quantity,
            image: prod.images[0] || '',
          };
        })
        .filter((x): x is NonNullable<typeof x> => x !== null);

      const newOrder: OrderRecord = {
        orderId: generateOrderId(),
        createdAt: new Date().toISOString(),
        status: 'Processing',
        customer,
        items,
        promoCode: cartTotals.discountPercent > 0 ? activePromoCode : null,
        subtotal: cartTotals.subtotal,
        discountAmount: cartTotals.discountAmount,
        shippingFee: cartTotals.shippingFee,
        total: cartTotals.total,
      };

      setOrders((prev) => [newOrder, ...prev]);
      setCart([]);
      setActivePromoCode(null);
      pushToast('Order confirmed', `Order ${newOrder.orderId} scheduled for COD dispatch.`, 'success');
      return newOrder;
    },
    [cart, cartTotals, activePromoCode, pushToast]
  );

  const advanceOrderStatus = useCallback(
    (orderId: string) => {
      setOrders((prev) =>
        prev.map((order) =>
          order.orderId === orderId
            ? { ...order, status: getNextOrderStatus(order.status) }
            : order
        )
      );
      pushToast('Order status updated', `Order ${orderId} progressed.`, 'info');
    },
    [pushToast]
  );

  const cartCount = useMemo(() => cart.reduce((acc, item) => acc + item.quantity, 0), [cart]);
  const wishlistCount = wishlist.length;

  const value: StoreContextValue = {
    page,
    params,
    navigate,
    cart,
    cartCount,
    wishlist,
    wishlistCount,
    orders,
    build,
    activePromoCode,
    compareIds,
    toasts,
    addToCart,
    updateCartQty,
    removeFromCart,
    clearCart,
    toggleWishlist,
    isWishlisted,
    setActivePromo,
    toggleCompareId,
    setCompareSlot,
    clearCompare,
    setBuildSlot,
    setBuildName,
    saveCurrentBuild,
    clearCurrentBuild,
    placeOrder,
    advanceOrderStatus,
    dismissToast,
    pushToast,
    cartTotals,
  };

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>;
};

export function useStore(): StoreContextValue {
  const ctx = useContext(StoreContext);
  if (!ctx) throw new Error('useStore must be used inside StoreProvider');
  return ctx;
}
