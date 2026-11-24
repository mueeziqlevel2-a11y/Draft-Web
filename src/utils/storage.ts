import { GAMEVAULT_PRODUCTS, PROMO_CODES } from '../data/products';
import { BuildSlotKey, OrderRecord, PCBuildState, Product, PromoCodeEntry } from '../types';

export const STORAGE_KEYS = {
  CART: 'gv_cart',
  WISHLIST: 'gv_wishlist',
  ORDERS: 'gv_orders',
  BUILD: 'gv_build',
  PROMO: 'gv_active_promo',
} as const;

export function safeReadStorage<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return fallback;
    const parsed = JSON.parse(raw) as T;
    return parsed ?? fallback;
  } catch {
    return fallback;
  }
}

export function safeWriteStorage<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore storage quota errors cleanly
  }
}

export function formatPrice(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: amount % 1 === 0 ? 0 : 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function getProductById(id: string | null | undefined): Product | undefined {
  if (!id) return undefined;
  return GAMEVAULT_PRODUCTS.find((p) => p.id === id);
}

export interface PromoValidationResult {
  ok: boolean;
  entry?: PromoCodeEntry;
  reason: 'valid' | 'empty' | 'expired' | 'invalid';
  message: string;
}

export function validatePromoCode(rawCode: string): PromoValidationResult {
  const normalized = rawCode.trim().toUpperCase();
  if (!normalized) {
    return {
      ok: false,
      reason: 'empty',
      message: 'Enter a promo code to validate.',
    };
  }
  const found = PROMO_CODES.find((p) => p.code === normalized);
  if (!found) {
    return {
      ok: false,
      reason: 'invalid',
      message: `Code "${normalized}" is not recognized. Active codes: VAULT15 or RIG10.`,
    };
  }
  if (found.status === 'expired') {
    return {
      ok: false,
      entry: found,
      reason: 'expired',
      message: `Code "${found.code}" expired on ${found.expiryDate}.`,
    };
  }
  return {
    ok: true,
    entry: found,
    reason: 'valid',
    message: `${found.code} applied — ${found.discountPercent}% discount active.`,
  };
}

export const EMPTY_BUILD: PCBuildState = {
  buildName: 'Custom Vault Rig',
  updatedAt: new Date().toISOString(),
  slots: {
    cpu: null,
    gpu: null,
    motherboard: null,
    ram: null,
    storage: null,
    psu: null,
    case: null,
  },
};

export interface BuildAnalysis {
  selectedProducts: Partial<Record<BuildSlotKey, Product>>;
  missingSlots: BuildSlotKey[];
  totalPrice: number;
  estimatedWattage: number;
  recommendedPsuWatts: number;
  errors: string[];
  warnings: string[];
  isCompatible: boolean;
}

export function analyzePCBuild(slots: Record<BuildSlotKey, string | null>): BuildAnalysis {
  const selectedProducts: Partial<Record<BuildSlotKey, Product>> = {};
  const missingSlots: BuildSlotKey[] = [];

  (Object.keys(slots) as BuildSlotKey[]).forEach((slot) => {
    const prod = getProductById(slots[slot]);
    if (prod) {
      selectedProducts[slot] = prod;
    } else {
      missingSlots.push(slot);
    }
  });

  const cpu = selectedProducts.cpu;
  const gpu = selectedProducts.gpu;
  const mb = selectedProducts.motherboard;
  const ram = selectedProducts.ram;
  const storage = selectedProducts.storage;
  const psu = selectedProducts.psu;
  const pcCase = selectedProducts.case;

  const totalPrice = Object.values(selectedProducts).reduce((sum, p) => sum + (p?.price || 0), 0);

  const cpuWatts = cpu?.compatibility.tdpWatts || 0;
  const gpuWatts = gpu?.compatibility.tdpWatts || 0;
  const ramWatts = ram?.compatibility.tdpWatts || 0;
  const storageWatts = storage?.compatibility.tdpWatts || 0;
  const baseSystemOverhead = Object.keys(selectedProducts).length > 0 ? 75 : 0;
  const estimatedWattage = cpuWatts + gpuWatts + ramWatts + storageWatts + baseSystemOverhead;
  const recommendedPsuWatts =
    estimatedWattage > 0 ? Math.ceil((estimatedWattage * 1.25) / 50) * 50 : 0;

  const errors: string[] = [];
  const warnings: string[] = [];

  if (cpu && mb && cpu.compatibility.socket !== mb.compatibility.socket) {
    errors.push(
      `Socket mismatch: ${cpu.name} (${cpu.compatibility.socket}) is incompatible with ${mb.name} (${mb.compatibility.socket}).`
    );
  }

  if (mb && ram && mb.compatibility.memoryType !== ram.compatibility.memoryType) {
    errors.push(
      `Memory mismatch: ${mb.name} requires ${mb.compatibility.memoryType}, but ${ram.name} is ${ram.compatibility.memoryType}.`
    );
  }

  if (
    mb &&
    pcCase &&
    mb.compatibility.formFactor &&
    pcCase.compatibility.supportedFormFactors &&
    !pcCase.compatibility.supportedFormFactors.includes(mb.compatibility.formFactor)
  ) {
    errors.push(
      `Form factor conflict: ${mb.name} (${mb.compatibility.formFactor}) does not fit inside ${pcCase.name}.`
    );
  }

  if (
    gpu &&
    pcCase &&
    gpu.compatibility.lengthMm &&
    pcCase.compatibility.maxGpuMm &&
    gpu.compatibility.lengthMm > pcCase.compatibility.maxGpuMm
  ) {
    errors.push(
      `Clearance conflict: ${gpu.name} (${gpu.compatibility.lengthMm}mm) exceeds ${pcCase.name} max GPU clearance (${pcCase.compatibility.maxGpuMm}mm).`
    );
  }

  if (psu && psu.compatibility.psuWatts && estimatedWattage > 0) {
    if (psu.compatibility.psuWatts < estimatedWattage) {
      errors.push(
        `Insufficient power: Selected ${psu.compatibility.psuWatts}W PSU is below estimated ${estimatedWattage}W load.`
      );
    } else if (psu.compatibility.psuWatts < recommendedPsuWatts) {
      warnings.push(
        `Tight PSU headroom: ${psu.compatibility.psuWatts}W covers ${estimatedWattage}W load, though ${recommendedPsuWatts}W is recommended for 25% transient headroom.`
      );
    }
  }

  if (cpu && ram && cpu.compatibility.memoryType && ram.compatibility.memoryType) {
    if (cpu.compatibility.socket === 'AM5' && ram.compatibility.memoryType !== 'DDR5') {
      errors.push(`AM5 processor ${cpu.name} strictly requires DDR5 memory.`);
    }
  }

  return {
    selectedProducts,
    missingSlots,
    totalPrice,
    estimatedWattage,
    recommendedPsuWatts,
    errors,
    warnings,
    isCompatible: errors.length === 0,
  };
}

export function generateOrderId(): string {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `GV-2026-${num}`;
}

export function getNextOrderStatus(current: OrderRecord['status']): OrderRecord['status'] {
  switch (current) {
    case 'Processing':
      return 'Confirmed';
    case 'Confirmed':
      return 'Shipped';
    case 'Shipped':
      return 'Delivered';
    default:
      return 'Delivered';
  }
}
