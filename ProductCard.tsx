"use client";

import Image from "next/image";
import Link from "next/link";
import { ShoppingCart, Heart } from "lucide-react";
import { Badge } from "@/components/ui/Badge";
import { StarRating } from "@/components/ui/StarRating";
import { cn, formatCurrency, calculateDiscount } from "@/lib/utils";
import type { Product } from "@/types";

interface ProductCardProps {
  product: Product;
  onAddToCart?: (product: Product) => void;
  onToggleWishlist?: (product: Product) => void;
  isWishlisted?: boolean;
}

export function ProductCard({
  product,
  onAddToCart,
  onToggleWishlist,
  isWishlisted = false,
}: ProductCardProps) {
  return (
    <div className="group relative bg-white dark:bg-gray-900 rounded-2xl overflow-hidden border border-gray-100 dark:border-gray-800 hover:border-brand-200 dark:hover:border-brand-800 hover:shadow-xl hover:shadow-brand-500/10 transition-all duration-300">
      {/* Image */}
      <Link href={`/product/${product.id}`} className="block relative aspect-[4/3] overflow-hidden bg-gray-50 dark:bg-gray-800">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-700 group-hover:scale-105"
          sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
        />

        {/* Badge */}
        {product.badge && (
          <div className="absolute top-3 left-3">
            <Badge variant={product.badge} />
          </div>
        )}

        {/* Discount */}
        {product.originalPrice && (
          <div className="absolute top-3 right-3">
            <span className="bg-rose-500 text-white text-xs font-bold px-2 py-0.5 rounded-lg">
              -{calculateDiscount(product.originalPrice, product.price)}%
            </span>
          </div>
        )}

        {/* Wishlist */}
        <button
          onClick={(e) => {
            e.preventDefault();
            onToggleWishlist?.(product);
          }}
          className={cn(
            "absolute bottom-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200",
            "opacity-0 group-hover:opacity-100 translate-y-2 group-hover:translate-y-0",
            isWishlisted
              ? "bg-rose-500 text-white"
              : "bg-white/90 dark:bg-gray-800/90 text-gray-600 dark:text-gray-300 hover:bg-rose-500 hover:text-white"
          )}
          aria-label="Add to wishlist"
        >
          <Heart size={14} className={isWishlisted ? "fill-current" : ""} />
        </button>
      </Link>

      {/* Info */}
      <div className="p-4">
        <p className="text-[11px] font-semibold uppercase tracking-widest text-brand-500 dark:text-brand-400 mb-1">
          {product.category}
        </p>
        <Link href={`/product/${product.id}`}>
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white leading-snug mb-2 line-clamp-2 hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
            {product.name}
          </h3>
        </Link>

        <StarRating rating={product.rating} reviewCount={product.reviewCount} className="mb-3" />

        <div className="flex items-center justify-between gap-2">
          <div>
            <span className="text-base font-bold text-gray-900 dark:text-white">
              {formatCurrency(product.price)}
            </span>
            {product.originalPrice && (
              <span className="ml-2 text-xs text-gray-400 line-through">
                {formatCurrency(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            onClick={() => onAddToCart?.(product)}
            className="flex items-center gap-1.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-1.5 rounded-xl transition-all active:scale-95 shadow-md shadow-brand-600/30"
            aria-label="Add to cart"
          >
            <ShoppingCart size={13} />
            Add
          </button>
        </div>
      </div>
    </div>
  );
}
