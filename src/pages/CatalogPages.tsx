import React, { useEffect, useMemo, useState } from 'react';
import {
  AlertCircle,
  ArrowLeft,
  ArrowLeftRight,
  Check,
  Search,
  ShoppingBag,
  SlidersHorizontal,
  Star,
} from 'lucide-react';
import { CATEGORY_LABELS, GAMEVAULT_PRODUCTS } from '../data/products';
import { useStore } from '../context/StoreContext';
import { ProductCard, ProductImage, WishlistButton } from '../components/ProductCard';
import { formatPrice, getProductById } from '../utils/storage';

const PC_PART_CATEGORIES = ['all', 'gpu', 'cpu', 'motherboard', 'ram', 'storage', 'psu', 'case'];

export const PcPartsPage: React.FC = () => {
  const { params } = useStore();
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<string>(params.category || 'all');
  const [brand, setBrand] = useState<string>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [minRating, setMinRating] = useState<number>(0);
  const [sortBy, setSortBy] = useState<string>('featured');

  useEffect(() => {
    if (params.category && PC_PART_CATEGORIES.includes(params.category)) {
      setCategory(params.category);
    }
  }, [params.category]);

  const allPcParts = useMemo(
    () =>
      GAMEVAULT_PRODUCTS.filter((p) =>
        ['gpu', 'cpu', 'motherboard', 'ram', 'storage', 'psu', 'case'].includes(p.category)
      ),
    []
  );

  const brands = useMemo(
    () => ['all', ...Array.from(new Set(allPcParts.map((p) => p.brand))).sort()],
    [allPcParts]
  );

  const minVal = minPrice !== '' ? Number(minPrice) : null;
  const maxVal = maxPrice !== '' ? Number(maxPrice) : null;
  const priceRangeInvalid = minVal !== null && maxVal !== null && minVal > maxVal;

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    const list = allPcParts.filter((p) => {
      if (category !== 'all' && p.category !== category) return false;
      if (brand !== 'all' && p.brand !== brand) return false;
      if (p.rating < minRating) return false;
      if (!priceRangeInvalid) {
        if (minVal !== null && !Number.isNaN(minVal) && p.price < minVal) return false;
        if (maxVal !== null && !Number.isNaN(maxVal) && p.price > maxVal) return false;
      }
      if (q) {
        const hay = `${p.name} ${p.brand} ${p.sku} ${p.shortSpecs.join(' ')}`.toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });

    return [...list].sort((a, b) => {
      switch (sortBy) {
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating':
          return b.rating - a.rating;
        case 'name':
          return a.name.localeCompare(b.name);
        default:
          return Number(b.isBestSeller) - Number(a.isBestSeller);
      }
    });
  }, [allPcParts, search, category, brand, minRating, minVal, maxVal, priceRangeInvalid, sortBy]);

  const resetFilters = () => {
    setSearch('');
    setCategory('all');
    setBrand('all');
    setMinPrice('');
    setMaxPrice('');
    setMinRating(0);
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2 border-b border-[#222B3E] pb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F7FB]">
          PC Parts Catalog
        </h1>
        <p className="text-sm text-[#9CA8BE]">
          GPUs, processors, motherboards, DDR5 kits, NVMe drives, PSUs, and airflow chassis.
        </p>
      </div>

      {/* Main Feature: Search and Filter Bar */}
      <div className="rounded-lg border border-[#222B3E] bg-[#111622] p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-[#64728C] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          <label htmlFor="pc-parts-search" className="sr-only">
            Search PC components
          </label>
          <input
            id="pc-parts-search"
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by GPU, CPU, AM5, DDR5, or brand..."
            className="w-full pl-10 pr-4 py-2.5 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm text-[#F4F7FB] placeholder:text-[#64728C] min-h-[42px]"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3">
          <select
            aria-label="Filter by brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="px-3 py-2.5 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm text-[#F4F7FB] min-h-[42px]"
          >
            {brands.map((b) => (
              <option key={b} value={b}>
                {b === 'all' ? 'All Brands' : b}
              </option>
            ))}
          </select>

          <select
            aria-label="Sort products"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2.5 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm text-[#F4F7FB] min-h-[42px]"
          >
            <option value="featured">Sort: Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Highest Rated</option>
            <option value="name">Name: A to Z</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar Filters */}
        <aside className="lg:col-span-3 rounded-lg border border-[#222B3E] bg-[#111622] p-5 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-sm font-semibold text-[#F4F7FB] flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-[#00D4FF]" />
              <span>Filter Components</span>
            </h2>
            <button
              type="button"
              onClick={resetFilters}
              className="text-xs text-[#00D4FF] hover:underline"
            >
              Reset
            </button>
          </div>

          <div className="space-y-2">
            <p className="text-xs font-medium text-[#9CA8BE]">Category</p>
            <div className="flex flex-col gap-1">
              {PC_PART_CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setCategory(cat)}
                  className={`text-left px-3 py-2 rounded-md text-sm transition-colors ${
                    category === cat
                      ? 'bg-[#0B2A38] text-[#00D4FF] font-medium'
                      : 'text-[#9CA8BE] hover:bg-[#161D2C] hover:text-[#F4F7FB]'
                  }`}
                >
                  {cat === 'all' ? 'All PC Parts' : CATEGORY_LABELS[cat]}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2 pt-4 border-t border-[#222B3E]">
            <p className="text-xs font-medium text-[#9CA8BE]">Price Range (USD)</p>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                min={0}
                aria-label="Minimum price"
                value={minPrice}
                onChange={(e) => setMinPrice(e.target.value)}
                placeholder="Min $"
                className="w-full px-3 py-2 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm font-mono tabular-nums text-[#F4F7FB]"
              />
              <input
                type="number"
                min={0}
                aria-label="Maximum price"
                value={maxPrice}
                onChange={(e) => setMaxPrice(e.target.value)}
                placeholder="Max $"
                className="w-full px-3 py-2 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm font-mono tabular-nums text-[#F4F7FB]"
              />
            </div>
            {priceRangeInvalid && (
              <p role="alert" className="text-xs text-[#EF4444]">
                Minimum price cannot exceed maximum price.
              </p>
            )}
          </div>

          <div className="space-y-2 pt-4 border-t border-[#222B3E]">
            <p className="text-xs font-medium text-[#9CA8BE]">Minimum Rating</p>
            <div className="flex flex-wrap gap-1.5">
              {[0, 4.5, 4.8].map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setMinRating(r)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium border ${
                    minRating === r
                      ? 'border-[#00D4FF] bg-[#0B2A38] text-[#00D4FF]'
                      : 'border-[#222B3E] bg-[#161D2C] text-[#9CA8BE]'
                  }`}
                >
                  {r === 0 ? 'Any' : `${r}★ & up`}
                </button>
              ))}
            </div>
          </div>
        </aside>

        {/* Results Grid */}
        <div className="lg:col-span-9 space-y-4">
          <div className="flex items-center justify-between text-xs text-[#9CA8BE]">
            <span className="font-mono tabular-nums">
              Showing {filtered.length} of {allPcParts.length} components
            </span>
          </div>

          {filtered.length === 0 ? (
            <div className="rounded-lg border border-[#222B3E] bg-[#111622] p-12 text-center space-y-3">
              <p className="font-display text-lg font-semibold text-[#F4F7FB]">
                No components match your search criteria
              </p>
              <p className="text-sm text-[#9CA8BE]">
                Try broadening your price filter, clearing the search term, or switching categories.
              </p>
              <button
                type="button"
                onClick={resetFilters}
                className="px-5 py-2.5 rounded-md bg-[#00D4FF] text-[#0B0E14] text-sm font-semibold"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const PartDetailsPage: React.FC = () => {
  const { params, navigate, addToCart, toggleCompareId, compareIds } = useStore();
  const product = getProductById(params.productId || 'gpu-rtx-4090-apex');
  const [selectedImgIdx, setSelectedImgIdx] = useState(0);
  const [qty, setQty] = useState(1);
  const [qtyError, setQtyError] = useState('');

  useEffect(() => {
    setSelectedImgIdx(0);
    setQty(1);
    setQtyError('');
  }, [params.productId]);

  if (!product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center space-y-4">
        <AlertCircle className="w-10 h-10 text-[#EF4444] mx-auto" />
        <h1 className="font-display text-2xl font-bold text-[#F4F7FB]">Product Not Found</h1>
        <p className="text-sm text-[#9CA8BE]">
          The requested hardware ID could not be located in the GameVault catalog.
        </p>
        <div className="flex justify-center gap-3">
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
            className="px-5 py-2.5 rounded-md border border-[#33415C] bg-[#111622] text-sm font-medium text-[#F4F7FB]"
          >
            Browse Gaming Gear
          </button>
        </div>
      </div>
    );
  }

  const related = GAMEVAULT_PRODUCTS.filter(
    (p) => p.category === product.category && p.id !== product.id
  ).slice(0, 4);

  const isCompared = compareIds.includes(product.id);

  const handleQtyChange = (next: number) => {
    if (next < 1) {
      setQty(1);
      setQtyError('Minimum order quantity is 1.');
      return;
    }
    if (next > product.stock) {
      setQty(product.stock);
      setQtyError(`Maximum available stock is ${product.stock} units.`);
      return;
    }
    setQtyError('');
    setQty(next);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-14">
      <div className="flex items-center gap-2 text-xs text-[#9CA8BE]">
        <button
          type="button"
          onClick={() =>
            navigate(
              ['mouse', 'keyboard'].includes(product.category)
                ? 'gaming-gear'
                : product.category === 'prebuilt'
                  ? 'pre-built-pcs'
                  : 'pc-parts'
            )
          }
          className="inline-flex items-center gap-1.5 hover:text-[#00D4FF] transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to {CATEGORY_LABELS[product.category] || 'Catalog'}</span>
        </button>
        <span>/</span>
        <span className="font-mono text-[#64728C]">{product.sku}</span>
      </div>

      {/* Main Split PDP Module */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left: Gallery */}
        <div className="lg:col-span-6 space-y-3">
          <div className="aspect-[4/3] rounded-lg border border-[#222B3E] bg-[#111622] overflow-hidden">
            <ProductImage
              src={product.images[selectedImgIdx] || product.images[0]}
              alt={product.name}
            />
          </div>
          {product.images.length > 1 && (
            <div className="grid grid-cols-4 gap-3">
              {product.images.map((img, idx) => (
                <button
                  key={`${img}-${idx}`}
                  type="button"
                  onClick={() => setSelectedImgIdx(idx)}
                  aria-label={`View gallery image ${idx + 1}`}
                  className={`aspect-[4/3] rounded-md border overflow-hidden transition-colors ${
                    selectedImgIdx === idx
                      ? 'border-[#00D4FF]'
                      : 'border-[#222B3E] opacity-70 hover:opacity-100'
                  }`}
                >
                  <ProductImage src={img} alt={`${product.name} angle ${idx + 1}`} />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right: Contiguous Purchase Module */}
        <div className="lg:col-span-6 space-y-6">
          <div className="space-y-2">
            <p className="text-xs text-[#9CA8BE]">
              {product.brand} · {CATEGORY_LABELS[product.category]} · SKU {product.sku}
            </p>
            <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#F4F7FB]">
              {product.name}
            </h1>
            <div className="flex items-center gap-4 text-sm">
              <span className="inline-flex items-center gap-1.5 font-mono tabular-nums text-[#F4F7FB]">
                <Star className="w-4 h-4 text-[#F59E0B] fill-[#F59E0B]" />
                {product.rating.toFixed(1)}
                <span className="text-[#64728C]">({product.reviewCount} reviews)</span>
              </span>
              <span
                className={`font-medium ${
                  product.stock <= 0
                    ? 'text-[#EF4444]'
                    : product.stock <= 5
                      ? 'text-[#F59E0B]'
                      : 'text-[#10B981]'
                }`}
              >
                {product.stock <= 0
                  ? 'Out of stock'
                  : product.stock <= 5
                    ? `Low stock (${product.stock} remaining)`
                    : `In stock (${product.stock} ready to ship)`}
              </span>
            </div>
          </div>

          <div className="flex items-baseline gap-3 pb-5 border-b border-[#222B3E]">
            <span className="font-mono tabular-nums text-3xl font-bold text-[#F4F7FB]">
              {formatPrice(product.price)}
            </span>
            {product.originalPrice && (
              <span className="font-mono tabular-nums text-base text-[#64728C] line-through">
                {formatPrice(product.originalPrice)}
              </span>
            )}
          </div>

          <p className="text-sm text-[#9CA8BE] leading-relaxed">{product.description}</p>

          {/* Compatibility Highlights */}
          {(product.compatibility.socket ||
            product.compatibility.memoryType ||
            product.compatibility.tdpWatts ||
            product.compatibility.lengthMm ||
            product.compatibility.psuWatts ||
            product.compatibility.targetFps) && (
            <div className="rounded-lg border border-[#222B3E] bg-[#111622] p-4 space-y-2">
              <p className="text-xs font-semibold text-[#00D4FF]">Compatibility & Power Profile</p>
              <div className="flex flex-wrap gap-x-5 gap-y-1.5 text-xs text-[#F4F7FB] font-mono tabular-nums">
                {product.compatibility.socket && <span>Socket: {product.compatibility.socket}</span>}
                {product.compatibility.memoryType && (
                  <span>Memory: {product.compatibility.memoryType}</span>
                )}
                {product.compatibility.formFactor && (
                  <span>Form Factor: {product.compatibility.formFactor}</span>
                )}
                {product.compatibility.tdpWatts && (
                  <span>Power Draw: {product.compatibility.tdpWatts}W TDP</span>
                )}
                {product.compatibility.lengthMm && (
                  <span>Length: {product.compatibility.lengthMm}mm</span>
                )}
                {product.compatibility.psuWatts && (
                  <span>Rated Output: {product.compatibility.psuWatts}W</span>
                )}
                {product.compatibility.targetFps && (
                  <span>Target: {product.compatibility.targetFps}</span>
                )}
              </div>
            </div>
          )}

          {/* Quantity + Buy Actions */}
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <div className="inline-flex items-center rounded-md border border-[#222B3E] bg-[#161D2C]">
                <button
                  type="button"
                  onClick={() => handleQtyChange(qty - 1)}
                  aria-label="Decrease quantity"
                  className="px-3.5 py-2.5 text-sm text-[#F4F7FB] hover:text-[#00D4FF]"
                >
                  −
                </button>
                <span className="px-3 font-mono tabular-nums text-sm text-[#F4F7FB]">{qty}</span>
                <button
                  type="button"
                  onClick={() => handleQtyChange(qty + 1)}
                  aria-label="Increase quantity"
                  className="px-3.5 py-2.5 text-sm text-[#F4F7FB] hover:text-[#00D4FF]"
                >
                  +
                </button>
              </div>

              <button
                type="button"
                disabled={product.stock <= 0}
                onClick={() => addToCart(product.id, qty)}
                className="flex-1 min-w-[180px] inline-flex items-center justify-center gap-2 px-6 py-3 rounded-md bg-[#00D4FF] text-[#0B0E14] font-semibold text-sm hover:bg-[#33DEFF] transition-colors min-h-[44px] disabled:opacity-50"
              >
                <ShoppingBag className="w-4 h-4" />
                <span>Add to Cart</span>
              </button>

              <WishlistButton productId={product.id} />

              <button
                type="button"
                onClick={() => toggleCompareId(product.id)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-md border text-sm font-medium transition-colors min-h-[44px] ${
                  isCompared
                    ? 'border-[#7C5CFF] bg-[#1E1838] text-[#F4F7FB]'
                    : 'border-[#222B3E] bg-[#161D2C] text-[#9CA8BE] hover:text-[#F4F7FB]'
                }`}
              >
                <ArrowLeftRight className="w-4 h-4" />
                <span>{isCompared ? 'Compared' : 'Compare'}</span>
              </button>
            </div>

            {qtyError && (
              <p role="alert" className="text-xs text-[#F59E0B]">
                {qtyError}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Full Spec Table */}
      <section className="space-y-4">
        <h2 className="font-display text-2xl font-semibold text-[#F4F7FB]">
          Technical Specifications
        </h2>
        <div className="rounded-lg border border-[#222B3E] bg-[#111622] overflow-hidden">
          <table className="w-full text-sm">
            <tbody>
              {Object.entries(product.specs).map(([key, val]) => (
                <tr key={key} className="border-b border-[#222B3E] last:border-b-0">
                  <th
                    scope="row"
                    className="text-left px-5 py-3.5 text-[#9CA8BE] font-medium w-1/3 bg-[#161D2C]/50"
                  >
                    {key.replace('_', ' / ')}
                  </th>
                  <td className="px-5 py-3.5 text-[#F4F7FB] font-mono tabular-nums">{val}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Related Products */}
      {related.length > 0 && (
        <section className="space-y-5">
          <h2 className="font-display text-2xl font-semibold text-[#F4F7FB]">
            Related Hardware
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {related.map((item) => (
              <ProductCard key={item.id} product={item} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export const GamingGearPage: React.FC = () => {
  const { params } = useStore();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState<string>(params.category || 'all');
  const [brand, setBrand] = useState('all');
  const [connectivity, setConnectivity] = useState('all');
  const [sortBy, setSortBy] = useState('featured');

  useEffect(() => {
    if (params.category === 'mouse' || params.category === 'keyboard') {
      setCat(params.category);
    }
  }, [params.category]);

  const gearItems = useMemo(
    () => GAMEVAULT_PRODUCTS.filter((p) => p.category === 'mouse' || p.category === 'keyboard'),
    []
  );

  const brands = useMemo(
    () => ['all', ...Array.from(new Set(gearItems.map((p) => p.brand))).sort()],
    [gearItems]
  );

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return gearItems
      .filter((p) => {
        if (cat !== 'all' && p.category !== cat) return false;
        if (brand !== 'all' && p.brand !== brand) return false;
        if (connectivity !== 'all') {
          const connSpec = (p.specs.Connectivity || '').toLowerCase();
          if (connectivity === 'wireless' && !connSpec.includes('wireless')) return false;
          if (connectivity === 'wired' && connSpec.includes('wireless')) return false;
        }
        if (q) {
          const hay = `${p.name} ${p.brand} ${p.shortSpecs.join(' ')}`.toLowerCase();
          if (!hay.includes(q)) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'price-asc') return a.price - b.price;
        if (sortBy === 'price-desc') return b.price - a.price;
        if (sortBy === 'rating') return b.rating - a.rating;
        return Number(b.isBestSeller) - Number(a.isBestSeller);
      });
  }, [gearItems, search, cat, brand, connectivity, sortBy]);

  const resetAll = () => {
    setSearch('');
    setCat('all');
    setBrand('all');
    setConnectivity('all');
    setSortBy('featured');
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="space-y-2 border-b border-[#222B3E] pb-6">
        <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F7FB]">
          Gaming Gear — Mice & Keyboards
        </h1>
        <p className="text-sm text-[#9CA8BE]">
          Ultralight 8000Hz wireless esports mice and Hall-Effect rapid-trigger mechanical keyboards.
        </p>
      </div>

      {/* Filter Bar */}
      <div className="rounded-lg border border-[#222B3E] bg-[#111622] p-4 flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
        <div className="flex flex-wrap items-center gap-2">
          {[
            { id: 'all', label: 'All Gear' },
            { id: 'mouse', label: 'Gaming Mice' },
            { id: 'keyboard', label: 'Keyboards' },
          ].map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setCat(t.id)}
              className={`px-3.5 py-2 rounded-md text-sm font-medium border transition-colors ${
                cat === t.id
                  ? 'border-[#00D4FF] bg-[#0B2A38] text-[#00D4FF]'
                  : 'border-[#222B3E] bg-[#161D2C] text-[#9CA8BE] hover:text-[#F4F7FB]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 flex-1 lg:max-w-2xl justify-end">
          <div className="relative flex-1 min-w-[180px]">
            <Search className="w-4 h-4 text-[#64728C] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="search"
              aria-label="Search gaming gear"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search sensors, switches, brands..."
              className="w-full pl-9 pr-3 py-2 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm text-[#F4F7FB] min-h-[40px]"
            />
          </div>

          <select
            aria-label="Filter by brand"
            value={brand}
            onChange={(e) => setBrand(e.target.value)}
            className="px-3 py-2 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm text-[#F4F7FB] min-h-[40px]"
          >
            {brands.map((b) => (
              <option key={b} value={b}>
                {b === 'all' ? 'All Brands' : b}
              </option>
            ))}
          </select>

          <select
            aria-label="Filter by connectivity"
            value={connectivity}
            onChange={(e) => setConnectivity(e.target.value)}
            className="px-3 py-2 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm text-[#F4F7FB] min-h-[40px]"
          >
            <option value="all">All Connections</option>
            <option value="wireless">Wireless 2.4GHz</option>
            <option value="wired">Wired Only</option>
          </select>

          <select
            aria-label="Sort gaming gear"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 rounded-md bg-[#161D2C] border border-[#222B3E] text-sm text-[#F4F7FB] min-h-[40px]"
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="rating">Top Rated</option>
          </select>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-lg border border-[#222B3E] bg-[#111622] p-12 text-center space-y-3">
          <p className="font-display text-lg font-semibold text-[#F4F7FB]">
            No gaming gear matches your filters
          </p>
          <button
            type="button"
            onClick={resetAll}
            className="px-5 py-2.5 rounded-md bg-[#00D4FF] text-[#0B0E14] text-sm font-semibold"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      )}
    </div>
  );
};

export const PreBuiltPcsPage: React.FC = () => {
  const { navigate, addToCart } = useStore();
  const [tier, setTier] = useState<string>('all');

  const systems = useMemo(
    () =>
      GAMEVAULT_PRODUCTS.filter((p) => p.category === 'prebuilt').filter(
        (p) => tier === 'all' || p.compatibility.performanceTier === tier
      ),
    [tier]
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4 border-b border-[#222B3E] pb-6">
        <div className="space-y-2">
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-[#F4F7FB]">
            Pre-Built Gaming PCs
          </h1>
          <p className="text-sm text-[#9CA8BE]">
            Hand-assembled with standard retail parts, 24-hour thermal stress-tested, zero bloatware.
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {['all', '1080p', '1440p', '4K', 'Workstation'].map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => setTier(t)}
              className={`px-3.5 py-2 rounded-md text-sm font-medium border transition-colors ${
                tier === t
                  ? 'border-[#00D4FF] bg-[#0B2A38] text-[#00D4FF]'
                  : 'border-[#222B3E] bg-[#111622] text-[#9CA8BE] hover:text-[#F4F7FB]'
              }`}
            >
              {t === 'all' ? 'All Tiers' : `${t} Tier`}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {systems.map((rig) => (
          <article
            key={rig.id}
            className="rounded-lg border border-[#222B3E] bg-[#111622] overflow-hidden flex flex-col"
          >
            <div className="aspect-[16/9] bg-[#0E131D] border-b border-[#222B3E]">
              <ProductImage src={rig.images[0]} alt={rig.name} />
            </div>
            <div className="p-6 flex-1 flex flex-col justify-between gap-5">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-[#00D4FF] font-semibold">
                    {rig.compatibility.performanceTier} Tier · {rig.compatibility.targetFps}
                  </span>
                  <span className="text-[#9CA8BE] font-mono tabular-nums">
                    {rig.stock > 0 ? `${rig.stock} ready` : 'Out of stock'}
                  </span>
                </div>

                <h2 className="font-display text-xl font-bold text-[#F4F7FB]">{rig.name}</h2>
                <p className="text-sm text-[#9CA8BE]">{rig.description}</p>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 pt-3 border-t border-[#222B3E] text-xs">
                  {Object.entries(rig.specs).map(([k, v]) => (
                    <div key={k}>
                      <span className="text-[#64728C] block">{k}</span>
                      <span className="text-[#F4F7FB] font-medium">{v}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="pt-4 border-t border-[#222B3E] flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono tabular-nums text-2xl font-bold text-[#F4F7FB]">
                    {formatPrice(rig.price)}
                  </span>
                  {rig.originalPrice && (
                    <span className="font-mono tabular-nums text-sm text-[#64728C] line-through">
                      {formatPrice(rig.originalPrice)}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => navigate('part-details', { productId: rig.id })}
                    className="px-4 py-2.5 rounded-md border border-[#33415C] bg-[#161D2C] text-sm font-medium text-[#F4F7FB] hover:border-[#00D4FF]"
                  >
                    Full Specs
                  </button>
                  <button
                    type="button"
                    onClick={() => addToCart(rig.id, 1)}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-[#00D4FF] text-[#0B0E14] font-semibold text-sm hover:bg-[#33DEFF]"
                  >
                    <Check className="w-4 h-4" />
                    <span>Add to Cart</span>
                  </button>
                </div>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
};
