import React, { useMemo, useState } from 'react';
import {
  AlertCircle,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Plus,
  Save,
  Search,
  ShoppingBag,
  Trash2,
  X,
  Zap,
} from 'lucide-react';
import { CATEGORY_LABELS, GAMEVAULT_PRODUCTS, GAME_BENCHMARKS } from '../data/products';
import { useStore } from '../context/StoreContext';
import { ProductImage } from '../components/ProductCard';
import { BuildSlotKey, Product, ResolutionKey } from '../types';
import { analyzePCBuild, formatPrice, getProductById } from '../utils/storage';

export const WattageCalculatorPage: React.FC = () => {
  const { addToCart, navigate } = useStore();
  const cpus = useMemo(() => GAMEVAULT_PRODUCTS.filter((p) => p.category === 'cpu'), []);
  const gpus = useMemo(() => GAMEVAULT_PRODUCTS.filter((p) => p.category === 'gpu'), []);
  const psus = useMemo(() => GAMEVAULT_PRODUCTS.filter((p) => p.category === 'psu'), []);

  const [cpuId, setCpuId] = useState<string>('');
  const [gpuId, setGpuId] = useState<string>('');
  const [ramSticks, setRamSticks] = useState<string>('2');
  const [nvmeCount, setNvmeCount] = useState<string>('1');
  const [sataCount, setSataCount] = useState<string>('0');
  const [fanCount, setFanCount] = useState<string>('4');
  const [coolingType, setCoolingType] = useState<'air' | 'aio240' | 'aio360'>('aio240');
  const [overclock, setOverclock] = useState(false);

  const selectedCpu = getProductById(cpuId);
  const selectedGpu = getProductById(gpuId);

  const nRam = Number(ramSticks);
  const nNvme = Number(nvmeCount);
  const nSata = Number(sataCount);
  const nFans = Number(fanCount);

  const validationError = useMemo(() => {
    if ([nRam, nNvme, nSata, nFans].some((v) => Number.isNaN(v) || v < 0)) {
      return 'Component quantities cannot be negative or blank.';
    }
    if (nRam > 8 || nNvme > 6 || nSata > 8 || nFans > 12) {
      return 'Enter realistic counts (max 8 RAM, 6 NVMe, 8 SATA, 12 fans).';
    }
    return '';
  }, [nRam, nNvme, nSata, nFans]);

  const calculation = useMemo(() => {
    if (!selectedCpu || !selectedGpu || validationError) return null;

    const cpuWatts = selectedCpu.compatibility.tdpWatts || 105;
    const gpuWatts = selectedGpu.compatibility.tdpWatts || 250;
    const ramWatts = nRam * 5;
    const storageWatts = nNvme * 7 + nSata * 9;
    const coolingWatts =
      (coolingType === 'air' ? 8 : coolingType === 'aio240' ? 18 : 26) + nFans * 3;
    const motherboardBase = 55;

    const rawSum = cpuWatts + gpuWatts + ramWatts + storageWatts + coolingWatts + motherboardBase;
    const peakLoad = Math.round(overclock ? rawSum * 1.15 : rawSum);
    const recommendedWatts = Math.ceil((peakLoad * 1.25) / 50) * 50;
    const tierOptions = [550, 650, 750, 850, 1000, 1200];
    const standardTier = tierOptions.find((t) => t >= recommendedWatts) || 1200;

    return {
      cpuWatts,
      gpuWatts,
      otherWatts: ramWatts + storageWatts + coolingWatts + motherboardBase,
      peakLoad,
      recommendedWatts,
      standardTier,
    };
  }, [selectedCpu, selectedGpu, validationError, nRam, nNvme, nSata, nFans, coolingType, overclock]);

  const matchingPsus = useMemo(() => {
    if (!calculation) return [];
    return psus
      .filter((p) => (p.compatibility.psuWatts || 0) >= calculation.standardTier)
      .sort((a, b) => (a.compatibility.psuWatts || 0) - (b.compatibility.psuWatts || 0));
  }, [psus, calculation]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2 border-b border-[#222B3E] pb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F7FB]">
          System Wattage & PSU Calculator
        </h1>
        <p className="text-sm text-[#9CA8BE]">
          Calculate peak transient power draw and select an 80+ Gold power supply with 25% safety
          headroom.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Inputs */}
        <div className="lg:col-span-7 rounded-lg border border-[#222B3E] bg-[#111622] p-6 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label htmlFor="calc-cpu" className="block text-xs font-medium text-[#9CA8BE]">
                Processor (CPU) *
              </label>
              <select
                id="calc-cpu"
                value={cpuId}
                onChange={(e) => setCpuId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm text-[#F4F7FB] min-h-[42px]"
              >
                <option value="">Select CPU...</option>
                {cpus.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.compatibility.tdpWatts}W)
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label htmlFor="calc-gpu" className="block text-xs font-medium text-[#9CA8BE]">
                Graphics Card (GPU) *
              </label>
              <select
                id="calc-gpu"
                value={gpuId}
                onChange={(e) => setGpuId(e.target.value)}
                className="w-full px-3.5 py-2.5 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm text-[#F4F7FB] min-h-[42px]"
              >
                <option value="">Select GPU...</option>
                {gpus.map((g) => (
                  <option key={g.id} value={g.id}>
                    {g.name} ({g.compatibility.tdpWatts}W)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-[#222B3E]">
            <div className="space-y-1.5">
              <label htmlFor="calc-ram" className="block text-xs font-medium text-[#9CA8BE]">
                RAM Sticks
              </label>
              <input
                id="calc-ram"
                type="number"
                min={0}
                max={8}
                value={ramSticks}
                onChange={(e) => setRamSticks(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm font-mono tabular-nums text-[#F4F7FB]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="calc-nvme" className="block text-xs font-medium text-[#9CA8BE]">
                NVMe SSDs
              </label>
              <input
                id="calc-nvme"
                type="number"
                min={0}
                max={6}
                value={nvmeCount}
                onChange={(e) => setNvmeCount(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm font-mono tabular-nums text-[#F4F7FB]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="calc-sata" className="block text-xs font-medium text-[#9CA8BE]">
                SATA Drives
              </label>
              <input
                id="calc-sata"
                type="number"
                min={0}
                max={8}
                value={sataCount}
                onChange={(e) => setSataCount(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm font-mono tabular-nums text-[#F4F7FB]"
              />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="calc-fans" className="block text-xs font-medium text-[#9CA8BE]">
                Case Fans
              </label>
              <input
                id="calc-fans"
                type="number"
                min={0}
                max={12}
                value={fanCount}
                onChange={(e) => setFanCount(e.target.value)}
                className="w-full px-3 py-2 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm font-mono tabular-nums text-[#F4F7FB]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-[#222B3E]">
            <div className="space-y-1.5">
              <label htmlFor="calc-cooling" className="block text-xs font-medium text-[#9CA8BE]">
                CPU Cooling Solution
              </label>
              <select
                id="calc-cooling"
                value={coolingType}
                onChange={(e) => setCoolingType(e.target.value as 'air' | 'aio240' | 'aio360')}
                className="w-full px-3.5 py-2.5 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm text-[#F4F7FB]"
              >
                <option value="air">Tower Air Cooler (8W)</option>
                <option value="aio240">240mm Liquid AIO (18W)</option>
                <option value="aio360">360mm Liquid AIO (26W)</option>
              </select>
            </div>

            <div className="flex items-end">
              <label className="w-full flex items-center justify-between px-4 py-2.5 rounded-md border border-[#222B3E] bg-[#161D2C] cursor-pointer min-h-[42px]">
                <span className="text-sm text-[#F4F7FB]">Overclocking Headroom (+15%)</span>
                <input
                  type="checkbox"
                  checked={overclock}
                  onChange={(e) => setOverclock(e.target.checked)}
                  className="w-4 h-4 accent-[#00D4FF]"
                />
              </label>
            </div>
          </div>

          {validationError && (
            <div
              role="alert"
              className="flex items-center gap-2 text-sm text-[#EF4444] p-3 rounded-md border border-[#EF4444]/40 bg-[#EF4444]/10"
            >
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{validationError}</span>
            </div>
          )}
        </div>

        {/* Right Live Output */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
          <div className="rounded-lg border border-[#222B3E] bg-[#111622] p-6 space-y-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-[#00D4FF]">
              <Zap className="w-4 h-4" />
              <span>Power & Headroom Output</span>
            </div>

            {!calculation ? (
              <div className="py-6 text-center space-y-2">
                <p className="text-sm font-medium text-[#F4F7FB]">
                  Select a CPU and GPU to calculate system wattage
                </p>
                <p className="text-xs text-[#9CA8BE]">
                  We factor transient GPU spikes plus a 25% continuous efficiency safety margin.
                </p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-md bg-[#161D2C] border border-[#222B3E]">
                    <p className="text-xs text-[#9CA8BE]">Estimated Peak Load</p>
                    <p className="font-mono tabular-nums text-2xl font-bold text-[#F4F7FB] mt-1">
                      {calculation.peakLoad}W
                    </p>
                  </div>
                  <div className="p-4 rounded-md bg-[#0B2A38] border border-[#00D4FF]/50">
                    <p className="text-xs text-[#00D4FF]">Recommended PSU</p>
                    <p className="font-mono tabular-nums text-2xl font-bold text-[#F4F7FB] mt-1">
                      {calculation.standardTier}W+
                    </p>
                  </div>
                </div>

                {/* Segmented Load Bar */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs text-[#9CA8BE] font-mono tabular-nums">
                    <span>Load Breakdown</span>
                    <span>
                      CPU {calculation.cpuWatts}W · GPU {calculation.gpuWatts}W · System{' '}
                      {calculation.otherWatts}W
                    </span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-[#161D2C] overflow-hidden flex">
                    <div
                      className="bg-[#00D4FF]"
                      style={{
                        width: `${(calculation.gpuWatts / calculation.standardTier) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-[#7C5CFF]"
                      style={{
                        width: `${(calculation.cpuWatts / calculation.standardTier) * 100}%`,
                      }}
                    />
                    <div
                      className="bg-[#10B981]"
                      style={{
                        width: `${(calculation.otherWatts / calculation.standardTier) * 100}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-3 pt-2 border-t border-[#222B3E]">
                  <p className="text-xs font-semibold text-[#F4F7FB]">
                    Recommended GameVault PSUs ({calculation.standardTier}W+ · 80+ Gold)
                  </p>
                  {matchingPsus.length === 0 ? (
                    <p className="text-xs text-[#9CA8BE]">
                      Requires 1200W+ workstation PSU. Contact support for custom unit sourcing.
                    </p>
                  ) : (
                    matchingPsus.map((psu) => (
                      <div
                        key={psu.id}
                        className="flex items-center justify-between gap-3 p-3 rounded-md border border-[#222B3E] bg-[#161D2C]"
                      >
                        <div className="min-w-0">
                          <button
                            type="button"
                            onClick={() => navigate('part-details', { productId: psu.id })}
                            className="text-sm font-medium text-[#F4F7FB] hover:text-[#00D4FF] truncate block text-left"
                          >
                            {psu.name}
                          </button>
                          <p className="text-xs font-mono tabular-nums text-[#9CA8BE]">
                            {formatPrice(psu.price)} · {psu.compatibility.psuWatts}W
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() => addToCart(psu.id, 1)}
                          className="px-3 py-1.5 rounded-md bg-[#00D4FF] text-[#0B0E14] text-xs font-semibold shrink-0"
                        >
                          Add
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export const CompareGearPage: React.FC = () => {
  const { compareIds, setCompareSlot, clearCompare, addToCart, navigate } = useStore();
  const [highlightDiffs, setHighlightDiffs] = useState(true);

  const selectedProducts = compareIds
    .map((id) => getProductById(id))
    .filter((p): p is Product => Boolean(p));

  const hasDuplicates = new Set(compareIds).size !== compareIds.length;
  const lowestPrice =
    selectedProducts.length >= 2 ? Math.min(...selectedProducts.map((p) => p.price)) : null;

  const allSpecKeys = useMemo(() => {
    const keys = new Set<string>();
    selectedProducts.forEach((p) => {
      Object.keys(p.specs).forEach((k) => keys.add(k));
    });
    return Array.from(keys);
  }, [selectedProducts]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#222B3E] pb-6">
        <div className="space-y-2">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F7FB]">
            Compare Gear & Components
          </h1>
          <p className="text-sm text-[#9CA8BE]">
            Side-by-side specification and pricing comparison for 2 to 4 products.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <label className="inline-flex items-center gap-2 px-3.5 py-2 rounded-md border border-[#222B3E] bg-[#111622] text-sm text-[#F4F7FB] cursor-pointer">
            <input
              type="checkbox"
              checked={highlightDiffs}
              onChange={(e) => setHighlightDiffs(e.target.checked)}
              className="accent-[#7C5CFF]"
            />
            <span>Highlight Differences</span>
          </label>
          {compareIds.length > 0 && (
            <button
              type="button"
              onClick={clearCompare}
              className="px-3.5 py-2 rounded-md border border-[#222B3E] bg-[#161D2C] text-sm text-[#9CA8BE] hover:text-[#F4F7FB]"
            >
              Clear All
            </button>
          )}
        </div>
      </div>

      {/* Slot Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[0, 1, 2, 3].map((slotIdx) => (
          <div
            key={slotIdx}
            className="rounded-lg border border-[#222B3E] bg-[#111622] p-3.5 space-y-2"
          >
            <label
              htmlFor={`compare-slot-${slotIdx}`}
              className="block text-xs font-medium text-[#9CA8BE]"
            >
              Comparison Slot {slotIdx + 1}
            </label>
            <select
              id={`compare-slot-${slotIdx}`}
              value={compareIds[slotIdx] || ''}
              onChange={(e) => setCompareSlot(slotIdx, e.target.value || null)}
              className="w-full px-3 py-2 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm text-[#F4F7FB]"
            >
              <option value="">Empty Slot</option>
              {GAMEVAULT_PRODUCTS.map((p) => (
                <option key={p.id} value={p.id}>
                  [{CATEGORY_LABELS[p.category]}] {p.name}
                </option>
              ))}
            </select>
          </div>
        ))}
      </div>

      {hasDuplicates && (
        <div
          role="alert"
          className="flex items-center gap-2 text-sm text-[#F59E0B] p-3.5 rounded-md border border-[#F59E0B]/40 bg-[#F59E0B]/10"
        >
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>Duplicate product selected across slots. Choose distinct items to compare.</span>
        </div>
      )}

      {selectedProducts.length < 2 ? (
        <div className="rounded-lg border border-[#222B3E] bg-[#111622] p-10 text-center space-y-4">
          <p className="font-display text-lg font-semibold text-[#F4F7FB]">
            Select at least 2 products above to compare side-by-side
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              type="button"
              onClick={() => {
                setCompareSlot(0, 'gpu-rtx-4090-apex');
                setCompareSlot(1, 'gpu-rx-7900-xtx-nitro');
              }}
              className="px-4 py-2 rounded-md border border-[#33415C] bg-[#161D2C] text-sm text-[#F4F7FB] hover:border-[#00D4FF]"
            >
              Compare Top GPUs (RTX 4090 vs RX 7900 XTX)
            </button>
            <button
              type="button"
              onClick={() => {
                setCompareSlot(0, 'mouse-logitech-superlight-2');
                setCompareSlot(1, 'mouse-razer-viper-v3-pro');
              }}
              className="px-4 py-2 rounded-md border border-[#33415C] bg-[#161D2C] text-sm text-[#F4F7FB] hover:border-[#00D4FF]"
            >
              Compare Pro Wireless Mice
            </button>
          </div>
        </div>
      ) : (
        <div className="rounded-lg border border-[#222B3E] bg-[#111622] overflow-x-auto">
          <table className="w-full text-sm min-w-[680px]">
            <thead>
              <tr className="border-b border-[#222B3E]">
                <th className="text-left p-4 w-48 text-xs font-medium text-[#9CA8BE] align-top bg-[#161D2C]">
                  Hardware Overview
                </th>
                {selectedProducts.map((prod) => (
                  <th key={prod.id} className="p-4 text-left align-top min-w-[210px]">
                    <div className="space-y-3">
                      <div className="aspect-[4/3] rounded-md border border-[#222B3E] bg-[#0E131D] overflow-hidden">
                        <ProductImage src={prod.images[0]} alt={prod.name} />
                      </div>
                      <button
                        type="button"
                        onClick={() => navigate('part-details', { productId: prod.id })}
                        className="font-display text-base font-semibold text-[#F4F7FB] hover:text-[#00D4FF] text-left block"
                      >
                        {prod.name}
                      </button>
                      <div className="flex items-baseline gap-2">
                        <span className="font-mono tabular-nums text-lg font-bold text-[#F4F7FB]">
                          {formatPrice(prod.price)}
                        </span>
                        {lowestPrice === prod.price && (
                          <span className="text-xs font-semibold text-[#10B981]">Best Price</span>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => addToCart(prod.id, 1)}
                        className="w-full py-2 rounded-md bg-[#00D4FF] text-[#0B0E14] text-xs font-semibold hover:bg-[#33DEFF]"
                      >
                        Add to Cart
                      </button>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#222B3E]">
                <th scope="row" className="text-left px-4 py-3 text-[#9CA8BE] bg-[#161D2C]/50">
                  Category
                </th>
                {selectedProducts.map((p) => (
                  <td key={p.id} className="px-4 py-3 text-[#F4F7FB]">
                    {CATEGORY_LABELS[p.category]}
                  </td>
                ))}
              </tr>
              {allSpecKeys.map((key) => {
                const values = selectedProducts.map((p) => p.specs[key] || '—');
                const differs = new Set(values).size > 1;
                return (
                  <tr
                    key={key}
                    className={`border-b border-[#222B3E] last:border-b-0 ${
                      highlightDiffs && differs ? 'bg-[#1E1838]/60' : ''
                    }`}
                  >
                    <th
                      scope="row"
                      className="text-left px-4 py-3 text-[#9CA8BE] bg-[#161D2C]/50 font-medium"
                    >
                      <span>{key.replace('_', ' / ')}</span>
                      {highlightDiffs && differs && (
                        <span className="block text-[11px] text-[#7C5CFF] font-normal">
                          Differs
                        </span>
                      )}
                    </th>
                    {values.map((val, idx) => (
                      <td
                        key={`${key}-${idx}`}
                        className="px-4 py-3 font-mono tabular-nums text-[#F4F7FB]"
                      >
                        {val}
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const BUILD_SLOTS: { key: BuildSlotKey; label: string; category: string }[] = [
  { key: 'cpu', label: 'Processor (CPU)', category: 'cpu' },
  { key: 'motherboard', label: 'Motherboard', category: 'motherboard' },
  { key: 'ram', label: 'Memory (RAM)', category: 'ram' },
  { key: 'gpu', label: 'Graphics Card (GPU)', category: 'gpu' },
  { key: 'storage', label: 'NVMe Storage', category: 'storage' },
  { key: 'psu', label: 'Power Supply (PSU)', category: 'psu' },
  { key: 'case', label: 'Chassis (Case)', category: 'case' },
];

export const PcBuilderPage: React.FC = () => {
  const {
    build,
    setBuildSlot,
    setBuildName,
    saveCurrentBuild,
    clearCurrentBuild,
    addToCart,
    pushToast,
  } = useStore();

  const [pickerSlot, setPickerSlot] = useState<BuildSlotKey | null>(null);
  const [pickerSearch, setPickerSearch] = useState('');
  const [compatibleOnly, setCompatibleOnly] = useState(true);

  const analysis = useMemo(() => analyzePCBuild(build.slots), [build.slots]);

  const pickerCandidates = useMemo(() => {
    if (!pickerSlot) return [];
    const slotMeta = BUILD_SLOTS.find((s) => s.key === pickerSlot);
    if (!slotMeta) return [];

    const q = pickerSearch.trim().toLowerCase();
    return GAMEVAULT_PRODUCTS.filter((p) => p.category === slotMeta.category).filter((cand) => {
      if (q && !`${cand.name} ${cand.brand} ${cand.shortSpecs.join(' ')}`.toLowerCase().includes(q)) {
        return false;
      }
      if (compatibleOnly) {
        const simulated = analyzePCBuild({ ...build.slots, [pickerSlot]: cand.id });
        return simulated.isCompatible;
      }
      return true;
    });
  }, [pickerSlot, pickerSearch, compatibleOnly, build.slots]);

  const handleAddBuildToCart = () => {
    const selectedIds = Object.values(build.slots).filter((id): id is string => Boolean(id));
    if (selectedIds.length === 0) {
      pushToast('Empty build', 'Select at least one component before adding to cart.', 'warning');
      return;
    }
    if (!analysis.isCompatible) {
      pushToast(
        'Compatibility conflict',
        'Resolve red compatibility errors before adding this build.',
        'error'
      );
      return;
    }
    selectedIds.forEach((id) => addToCart(id, 1));
    if (analysis.missingSlots.length > 0) {
      pushToast(
        'Partial build added',
        `Missing slots (${analysis.missingSlots.join(', ')}) were skipped.`,
        'info'
      );
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#222B3E] pb-6">
        <div className="space-y-2">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F7FB]">
            Custom PC Builder
          </h1>
          <p className="text-sm text-[#9CA8BE]">
            Assemble your 7-component configuration with live socket, DDR, length, and PSU checks.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <label htmlFor="build-name-input" className="sr-only">
            Build Name
          </label>
          <input
            id="build-name-input"
            type="text"
            value={build.buildName}
            onChange={(e) => setBuildName(e.target.value)}
            placeholder="My Custom Rig"
            className="px-3.5 py-2 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm text-[#F4F7FB] min-h-[40px]"
          />
          <button
            type="button"
            onClick={saveCurrentBuild}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md border border-[#33415C] bg-[#111622] text-sm font-medium text-[#F4F7FB] hover:border-[#00D4FF] min-h-[40px]"
          >
            <Save className="w-4 h-4 text-[#00D4FF]" />
            <span>Save Build</span>
          </button>
          <button
            type="button"
            onClick={clearCurrentBuild}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-md border border-[#222B3E] bg-[#161D2C] text-sm text-[#9CA8BE] hover:text-[#EF4444] min-h-[40px]"
          >
            <Trash2 className="w-4 h-4" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Main Feature: 7-Slot PC Part Picker */}
        <div className="lg:col-span-8 space-y-3">
          {BUILD_SLOTS.map((slot) => {
            const selected = analysis.selectedProducts[slot.key];
            return (
              <div
                key={slot.key}
                className="rounded-lg border border-[#222B3E] bg-[#111622] p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="flex items-center gap-4 min-w-0">
                  <div className="w-16 h-12 rounded-md border border-[#222B3E] bg-[#0E131D] overflow-hidden shrink-0 flex items-center justify-center">
                    {selected ? (
                      <ProductImage src={selected.images[0]} alt={selected.name} />
                    ) : (
                      <Cpu className="w-5 h-5 text-[#64728C]" />
                    )}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-medium text-[#9CA8BE]">{slot.label}</p>
                    {selected ? (
                      <>
                        <p className="font-display text-base font-semibold text-[#F4F7FB] truncate">
                          {selected.name}
                        </p>
                        <p className="text-xs text-[#64728C] truncate">
                          {selected.shortSpecs.join(' · ')}
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-[#64728C]">No component selected</p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3 shrink-0 justify-end">
                  {selected && (
                    <span className="font-mono tabular-nums text-base font-bold text-[#F4F7FB]">
                      {formatPrice(selected.price)}
                    </span>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      setPickerSearch('');
                      setPickerSlot(slot.key);
                    }}
                    className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-md text-xs font-semibold min-h-[38px] ${
                      selected
                        ? 'border border-[#33415C] bg-[#161D2C] text-[#F4F7FB] hover:border-[#00D4FF]'
                        : 'bg-[#00D4FF] text-[#0B0E14] hover:bg-[#33DEFF]'
                    }`}
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{selected ? 'Change' : `Choose ${slot.key.toUpperCase()}`}</span>
                  </button>
                  {selected && (
                    <button
                      type="button"
                      onClick={() => setBuildSlot(slot.key, null)}
                      aria-label={`Remove ${selected.name}`}
                      className="p-2 rounded-md border border-[#222B3E] text-[#9CA8BE] hover:text-[#EF4444]"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Summary & Compatibility Engine */}
        <aside className="lg:col-span-4 space-y-4 lg:sticky lg:top-24">
          <div className="rounded-lg border border-[#222B3E] bg-[#111622] p-6 space-y-5">
            <h2 className="font-display text-lg font-semibold text-[#F4F7FB]">
              Build Telemetry & Total
            </h2>

            {/* Compatibility Banner */}
            {Object.keys(analysis.selectedProducts).length === 0 ? (
              <div className="p-3.5 rounded-md border border-[#222B3E] bg-[#161D2C] text-xs text-[#9CA8BE]">
                Select components on the left to begin live compatibility checks.
              </div>
            ) : analysis.errors.length > 0 ? (
              <div
                role="alert"
                className="p-3.5 rounded-md border border-[#EF4444]/50 bg-[#EF4444]/10 space-y-2"
              >
                <div className="flex items-center gap-2 text-xs font-semibold text-[#EF4444]">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{analysis.errors.length} Compatibility Conflict(s)</span>
                </div>
                <ul className="space-y-1 text-xs text-[#F4F7FB]">
                  {analysis.errors.map((err) => (
                    <li key={err}>{err}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <div className="p-3.5 rounded-md border border-[#10B981]/40 bg-[#10B981]/10 flex items-center gap-2 text-xs font-medium text-[#10B981]">
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span>All selected components are verified compatible.</span>
              </div>
            )}

            {analysis.warnings.map((w) => (
              <div
                key={w}
                className="p-3 rounded-md border border-[#F59E0B]/40 bg-[#F59E0B]/10 text-xs text-[#F59E0B] flex items-start gap-2"
              >
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{w}</span>
              </div>
            ))}

            {analysis.missingSlots.length > 0 && (
              <p className="text-xs text-[#9CA8BE]">
                Missing slots ({analysis.missingSlots.length}):{' '}
                <span className="text-[#F4F7FB] uppercase font-mono">
                  {analysis.missingSlots.join(', ')}
                </span>
              </p>
            )}

            <div className="space-y-2.5 pt-3 border-t border-[#222B3E] text-sm">
              <div className="flex justify-between">
                <span className="text-[#9CA8BE]">Estimated Load</span>
                <span className="font-mono tabular-nums text-[#F4F7FB]">
                  {analysis.estimatedWattage}W
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#9CA8BE]">Recommended PSU</span>
                <span className="font-mono tabular-nums text-[#00D4FF]">
                  {analysis.recommendedPsuWatts > 0 ? `${analysis.recommendedPsuWatts}W+` : '—'}
                </span>
              </div>
              <div className="flex justify-between items-baseline pt-2 border-t border-[#222B3E]">
                <span className="font-semibold text-[#F4F7FB]">Total Build Price</span>
                <span className="font-mono tabular-nums text-2xl font-bold text-[#F4F7FB]">
                  {formatPrice(analysis.totalPrice)}
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={handleAddBuildToCart}
              className="w-full inline-flex items-center justify-center gap-2 py-3 rounded-md bg-[#00D4FF] text-[#0B0E14] font-semibold text-sm hover:bg-[#33DEFF] transition-colors min-h-[44px]"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>Add Complete Build to Cart</span>
            </button>
          </div>
        </aside>
      </div>

      {/* Part Picker Modal */}
      {pickerSlot && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs"
          role="dialog"
          aria-modal="true"
          aria-label={`Select ${pickerSlot}`}
        >
          <div className="w-full max-w-2xl rounded-lg border border-[#33415C] bg-[#111622] shadow-2xl flex flex-col max-h-[85vh]">
            <div className="p-5 border-b border-[#222B3E] flex items-center justify-between gap-4">
              <h3 className="font-display text-lg font-semibold text-[#F4F7FB]">
                Select {BUILD_SLOTS.find((s) => s.key === pickerSlot)?.label}
              </h3>
              <button
                type="button"
                onClick={() => setPickerSlot(null)}
                aria-label="Close part picker"
                className="p-1.5 rounded-md border border-[#222B3E] text-[#9CA8BE] hover:text-[#F4F7FB]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 border-b border-[#222B3E] flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-[#64728C] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="search"
                  value={pickerSearch}
                  onChange={(e) => setPickerSearch(e.target.value)}
                  placeholder="Filter parts..."
                  className="w-full pl-9 pr-3 py-2 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm text-[#F4F7FB]"
                />
              </div>
              <label className="inline-flex items-center gap-2 text-xs text-[#F4F7FB] cursor-pointer shrink-0">
                <input
                  type="checkbox"
                  checked={compatibleOnly}
                  onChange={(e) => setCompatibleOnly(e.target.checked)}
                  className="accent-[#00D4FF]"
                />
                <span>Compatible Only</span>
              </label>
            </div>

            <div className="p-4 overflow-y-auto space-y-2.5">
              {pickerCandidates.length === 0 ? (
                <p className="text-sm text-[#9CA8BE] text-center py-8">
                  No compatible parts match your search. Uncheck "Compatible Only" to inspect all.
                </p>
              ) : (
                pickerCandidates.map((cand) => (
                  <div
                    key={cand.id}
                    className="p-3.5 rounded-md border border-[#222B3E] bg-[#161D2C] flex items-center justify-between gap-4"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="w-14 h-11 rounded border border-[#222B3E] overflow-hidden shrink-0">
                        <ProductImage src={cand.images[0]} alt={cand.name} />
                      </div>
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-[#F4F7FB] truncate">{cand.name}</p>
                        <p className="text-xs text-[#9CA8BE] truncate">
                          {cand.shortSpecs.join(' · ')}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="font-mono tabular-nums text-sm font-bold text-[#F4F7FB]">
                        {formatPrice(cand.price)}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setBuildSlot(pickerSlot, cand.id);
                          setPickerSlot(null);
                        }}
                        className="px-3.5 py-2 rounded-md bg-[#00D4FF] text-[#0B0E14] text-xs font-semibold hover:bg-[#33DEFF]"
                      >
                        Select
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export const BenchmarkGuidePage: React.FC = () => {
  const { navigate } = useStore();
  const [resolution, setResolution] = useState<ResolutionKey>('1440p');
  const [tierFilter, setTierFilter] = useState<string>('all');

  const maxFpsForScale = resolution === '1080p' ? 700 : resolution === '1440p' ? 650 : 450;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#222B3E] pb-6">
        <div className="space-y-2">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F7FB]">
            Gaming Benchmark Guide
          </h1>
          <p className="text-sm text-[#9CA8BE]">
            Real-world Average FPS and 1% Low telemetry across popular competitive and AAA titles.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-md border border-[#222B3E] bg-[#111622] p-1">
            {(['1080p', '1440p', '4K'] as ResolutionKey[]).map((res) => (
              <button
                key={res}
                type="button"
                onClick={() => setResolution(res)}
                className={`px-3.5 py-1.5 rounded text-xs font-mono font-semibold transition-colors ${
                  resolution === res
                    ? 'bg-[#00D4FF] text-[#0B0E14]'
                    : 'text-[#9CA8BE] hover:text-[#F4F7FB]'
                }`}
              >
                {res}
              </button>
            ))}
          </div>

          <select
            aria-label="Filter hardware tier"
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value)}
            className="px-3 py-2 rounded-md bg-[#111622] border border-[#222B3E] text-xs font-medium text-[#F4F7FB]"
          >
            <option value="all">All Hardware Tiers</option>
            <option value="Mid-Range">Mid-Range</option>
            <option value="High-End">High-End</option>
            <option value="Flagship">Flagship</option>
          </select>
        </div>
      </div>

      {/* Legend */}
      <div className="flex flex-wrap items-center gap-6 text-xs text-[#9CA8BE]">
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-[#00D4FF] inline-block" />
          Average FPS
        </span>
        <span className="inline-flex items-center gap-2">
          <span className="w-3 h-3 rounded-xs bg-[#7C5CFF] inline-block" />
          1% Low FPS (Frame Pacing Stability)
        </span>
      </div>

      {/* Game Sections */}
      <div className="space-y-6">
        {GAME_BENCHMARKS.map((game) => {
          const filteredPairings = game.pairings.filter(
            (p) => tierFilter === 'all' || p.tier === tierFilter
          );

          return (
            <section
              key={game.id}
              className="rounded-lg border border-[#222B3E] bg-[#111622] p-6 space-y-5"
            >
              <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 pb-4 border-b border-[#222B3E]">
                <div>
                  <h2 className="font-display text-xl font-semibold text-[#F4F7FB]">
                    {game.title}
                  </h2>
                  <p className="text-xs text-[#9CA8BE] mt-0.5">
                    {game.preset} · Resolution: {resolution}
                  </p>
                </div>
                <p className="text-xs text-[#64728C] max-w-md">{game.engineNote}</p>
              </div>

              {filteredPairings.length === 0 ? (
                <p className="text-sm text-[#9CA8BE] py-4">
                  No pairings tested for this tier filter in {game.title}.
                </p>
              ) : (
                <div className="space-y-5">
                  {filteredPairings.map((pair) => {
                    const stats = pair.results[resolution];
                    const localScale =
                      game.id === 'valorant' ? maxFpsForScale : 260;
                    const avgPct = Math.min(100, Math.round((stats.avgFps / localScale) * 100));
                    const lowPct = Math.min(100, Math.round((stats.low1Fps / localScale) * 100));

                    return (
                      <div key={pair.label} className="space-y-2">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div>
                            <span className="text-sm font-semibold text-[#F4F7FB]">
                              {pair.label}
                            </span>
                            <span className="ml-2 text-xs text-[#64728C]">({pair.tier})</span>
                          </div>
                          <div className="flex items-center gap-4">
                            <span className="font-mono tabular-nums text-xs text-[#00D4FF]">
                              Avg {stats.avgFps} FPS
                            </span>
                            <span className="font-mono tabular-nums text-xs text-[#7C5CFF]">
                              1% Low {stats.low1Fps} FPS
                            </span>
                            <button
                              type="button"
                              onClick={() => navigate('part-details', { productId: pair.gpuId })}
                              className="text-xs text-[#9CA8BE] hover:text-[#00D4FF] underline"
                            >
                              View GPU
                            </button>
                          </div>
                        </div>

                        <div className="space-y-1.5">
                          <div className="h-2.5 w-full rounded-sm bg-[#161D2C] overflow-hidden">
                            <div
                              className="h-full bg-[#00D4FF] transition-all duration-300"
                              style={{ width: `${avgPct}%` }}
                            />
                          </div>
                          <div className="h-2 w-full rounded-sm bg-[#161D2C] overflow-hidden">
                            <div
                              className="h-full bg-[#7C5CFF] transition-all duration-300"
                              style={{ width: `${lowPct}%` }}
                            />
                          </div>
                        </div>
                        <p className="text-xs text-[#64728C]">{pair.note}</p>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          );
        })}
      </div>

      {/* Educational Explainers */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {[
          {
            title: 'Average FPS vs. 1% Lows',
            body: 'Average FPS shows overall smoothness, while 1% Lows expose sudden stutters during explosions or heavy smoke. Strong 3D V-Cache CPUs elevate 1% lows dramatically.',
          },
          {
            title: 'CPU vs. GPU Bottlenecks',
            body: 'At 1080p competitive settings, your CPU often caps frame rate. At 1440p Ultra and 4K, shader throughput and VRAM capacity on your GPU become the primary limiter.',
          },
          {
            title: 'DLSS & FSR Upscaling',
            body: 'Quality mode renders internally at ~67% resolution and reconstructs crisp edges, frequently boosting 4K frame rates by 35–50% with near-native image clarity.',
          },
        ].map((card) => (
          <div
            key={card.title}
            className="rounded-lg border border-[#222B3E] bg-[#111622] p-5 space-y-2"
          >
            <h3 className="font-display text-base font-semibold text-[#F4F7FB]">{card.title}</h3>
            <p className="text-xs sm:text-sm text-[#9CA8BE] leading-relaxed">{card.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
