import React, { useState } from 'react';
import { ArrowLeftRight, Cpu, Heart, ShoppingBag, Star } from 'lucide-react';
import { CATEGORY_LABELS } from '../data/products';
import { useStore } from '../context/StoreContext';
import { Product } from '../types';
import { formatPrice } from '../utils/storage';

export const ProductImage: React.FC<{
  src: string;
  alt: string;
  className?: string;
}> = ({ src, alt, className = '' }) => {
  const [failed, setFailed] = useState(false);

  if (failed || !src) {
    return (
      <div
        className={`w-full h-full flex flex-col items-center justify-center bg-[#161D2C] text-[#64728C] p-4 ${className}`}
      >
        <Cpu className="w-8 h-8 mb-2 opacity-60" />
        <span className="text-xs text-center line-clamp-2">{alt}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      referrerPolicy="no-referrer"
      onError={() => setFailed(true)}
      className={`w-full h-full object-cover ${className}`}
    />
  );
};

export const WishlistButton: React.FC<{
  productId: string;
  compact?: boolean;
}> = ({ productId, compact = false }) => {
  const { isWishlisted, toggleWishlist } = useStore();
  const saved = isWishlisted(productId);

  return (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        toggleWishlist(productId);
      }}
      aria-pressed={saved}
      aria-label={saved ? 'Remove from wishlist' : 'Save to wishlist'}
      className={`inline-flex items-center justify-center gap-1.5 rounded-md border transition-colors whitespace-nowrap shrink-0 ${
        compact ? 'w-10 h-10' : 'px-3.5 py-2.5 text-sm font-medium'
      } ${
        saved
          ? 'border-[#00D4FF] bg-[#0B2A38] text-[#00D4FF]'
          : 'border-[#222B3E] bg-[#161D2C] text-[#9CA8BE] hover:text-[#F4F7FB] hover:border-[#33415C]'
      }`}
    >
      <Heart className={`w-4 h-4 ${saved ? 'fill-[#00D4FF]' : ''}`} />
      {!compact && <span>{saved ? 'Saved' : 'Wishlist'}</span>}
    </button>
  );
};

export const ProductCard: React.FC<{
  product: Product;
  showCompare?: boolean;
}> = ({ product, showCompare = true }) => {
  const { navigate, addToCart, compareIds, toggleCompareId } = useStore();
  const isCompared = compareIds.includes(product.id);
  const discountPct =
    product.originalPrice && product.originalPrice > product.price
      ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
      : null;

  const stockLabel =
    product.stock <= 0
      ? 'Out of stock'
      : product.stock <= 5
        ? `Low stock (${product.stock})`
        : 'In stock';

  const stockColor =
    product.stock <= 0
      ? 'text-[#EF4444]'
      : product.stock <= 5
        ? 'text-[#F59E0B]'
        : 'text-[#10B981]';

  return (
    <article className="group rounded-lg border border-[#222B3E] bg-[#111622] hover:border-[#33415C] transition-all duration-200 hover:-translate-y-0.5 flex flex-col overflow-hidden">
      {/* Image Frame (4:3) */}
      <div className="relative aspect-[4/3] bg-[#0E131D] overflow-hidden border-b border-[#222B3E]">
        <button
          type="button"
          onClick={() => navigate('part-details', { productId: product.id })}
          className="w-full h-full block text-left"
          aria-label={`View details for ${product.name}`}
        >
          <ProductImage
            src={product.images[0]}
            alt={product.name}
            className="transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </button>

        <div className="absolute top-2.5 right-2.5 flex items-center gap-1.5">
          {showCompare && (
            <button
              type="button"
              onClick={() => toggleCompareId(product.id)}
              aria-pressed={isCompared}
              aria-label={isCompared ? 'Remove from comparison' : 'Add to comparison'}
              title={isCompared ? 'In comparison' : 'Compare'}
              className={`w-9 h-9 inline-flex items-center justify-center rounded-md border backdrop-blur-sm transition-colors ${
                isCompared
                  ? 'border-[#7C5CFF] bg-[#1E1838]/90 text-[#F4F7FB]'
                  : 'border-[#222B3E] bg-[#0B0E14]/80 text-[#9CA8BE] hover:text-[#F4F7FB]'
              }`}
            >
              <ArrowLeftRight className="w-3.5 h-3.5" />
            </button>
          )}
          <WishlistButton productId={product.id} compact />
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-2">
          {/* Unboxed inline metadata with typographic separators */}
          <div className="flex items-center justify-between gap-2 text-xs text-[#9CA8BE]">
            <span className="truncate">
              {product.brand} · {CATEGORY_LABELS[product.category] || product.category}
            </span>
            <span className={`font-medium shrink-0 ${stockColor}`}>{stockLabel}</span>
          </div>

          <button
            type="button"
            onClick={() => navigate('part-details', { productId: product.id })}
            className="text-left block w-full"
          >
            <h3 className="font-display text-base font-semibold text-[#F4F7FB] group-hover:text-[#00D4FF] transition-colors line-clamp-2 leading-snug">
              {product.name}
            </h3>
          </button>

          {/* Clean unboxed spec summary */}
          <p className="text-xs text-[#64728C] truncate">
            {product.shortSpecs.join(' · ')}
          </p>
        </div>

        <div className="space-y-3 pt-2 border-t border-[#222B3E]">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="font-mono tabular-nums text-lg font-bold text-[#F4F7FB]">
                {formatPrice(product.price)}
              </span>
              {product.originalPrice && (
                <span className="font-mono tabular-nums text-xs text-[#64728C] line-through">
                  {formatPrice(product.originalPrice)}
                </span>
              )}
              {discountPct && (
                <span className="font-mono tabular-nums text-xs font-semibold text-[#FF3B5C]">
                  Save {discountPct}%
                </span>
              )}
            </div>

            <div className="inline-flex items-center gap-1 text-xs text-[#9CA8BE] font-mono tabular-nums shrink-0">
              <Star className="w-3.5 h-3.5 text-[#F59E0B] fill-[#F59E0B]" />
              <span>{product.rating.toFixed(1)}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={product.stock <= 0}
            onClick={() => addToCart(product.id, 1)}
            className={`w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-semibold transition-colors min-h-[40px] ${
              product.stock <= 0
                ? 'bg-[#161D2C] text-[#64728C] cursor-not-allowed border border-[#222B3E]'
                : 'bg-[#00D4FF] text-[#0B0E14] hover:bg-[#33DEFF]'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{product.stock <= 0 ? 'Out of Stock' : 'Add to Cart'}</span>
          </button>
        </div>
      </div>
    </article>
  );
};
