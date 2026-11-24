export type PageId =
  | 'home'
  | 'flash-deals'
  | 'about'
  | 'pc-parts'
  | 'part-details'
  | 'wattage-calculator'
  | 'gaming-gear'
  | 'compare-gear'
  | 'wishlist'
  | 'pc-builder'
  | 'pre-built-pcs'
  | 'benchmark-guide'
  | 'cart'
  | 'checkout'
  | 'order-tracking';

export type ProductCategory =
  | 'gpu'
  | 'cpu'
  | 'motherboard'
  | 'ram'
  | 'storage'
  | 'psu'
  | 'case'
  | 'mouse'
  | 'keyboard'
  | 'prebuilt';

export interface ProductCompatibility {
  socket?: string;
  memoryType?: 'DDR5' | 'DDR4';
  formFactor?: 'ATX' | 'mATX' | 'ITX';
  supportedFormFactors?: ('ATX' | 'mATX' | 'ITX')[];
  tdpWatts?: number;
  psuWatts?: number;
  lengthMm?: number;
  maxGpuMm?: number;
  performanceTier?: '1080p' | '1440p' | '4K' | 'Workstation';
  targetFps?: string;
}

export interface Product {
  id: string;
  sku: string;
  name: string;
  brand: string;
  category: ProductCategory;
  price: number;
  originalPrice: number | null;
  isFlashDeal: boolean;
  isBestSeller: boolean;
  dealClaimedPercent?: number;
  rating: number;
  reviewCount: number;
  stock: number;
  images: string[];
  shortSpecs: string[];
  description: string;
  specs: Record<string, string>;
  compatibility: ProductCompatibility;
}

export interface CartItem {
  productId: string;
  quantity: number;
  addedAt: string;
}

export type OrderStatus = 'Processing' | 'Confirmed' | 'Shipped' | 'Delivered';

export interface OrderCustomer {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  postalCode: string;
  notes: string;
}

export interface OrderItemSnapshot {
  productId: string;
  name: string;
  sku: string;
  unitPrice: number;
  quantity: number;
  image: string;
}

export interface OrderRecord {
  orderId: string;
  createdAt: string;
  status: OrderStatus;
  customer: OrderCustomer;
  items: OrderItemSnapshot[];
  promoCode: string | null;
  subtotal: number;
  discountAmount: number;
  shippingFee: number;
  total: number;
}

export type BuildSlotKey =
  | 'cpu'
  | 'gpu'
  | 'motherboard'
  | 'ram'
  | 'storage'
  | 'psu'
  | 'case';

export interface PCBuildState {
  buildName: string;
  updatedAt: string;
  slots: Record<BuildSlotKey, string | null>;
}

export interface PromoCodeEntry {
  code: string;
  discountPercent: number;
  status: 'active' | 'expired';
  expiryDate: string;
  description: string;
}

export type ResolutionKey = '1080p' | '1440p' | '4K';

export interface BenchmarkPairing {
  label: string;
  tier: 'Mid-Range' | 'High-End' | 'Flagship';
  gpuId: string;
  cpuId: string;
  results: Record<ResolutionKey, { avgFps: number; low1Fps: number }>;
  note: string;
}

export interface GameBenchmark {
  id: string;
  title: string;
  preset: string;
  engineNote: string;
  pairings: BenchmarkPairing[];
}

export interface ToastMessage {
  id: string;
  title: string;
  detail?: string;
  variant: 'info' | 'success' | 'warning' | 'error';
}
