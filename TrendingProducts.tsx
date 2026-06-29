"use client";

import Link from "next/link";
import { ArrowRight, TrendingUp } from "lucide-react";
import { ProductCard } from "@/components/home/ProductCard";
import { trendingProducts } from "@/data";
import { useCart, useWishlist } from "@/hooks";
import type { Product } from "@/types";

export function TrendingProducts() {
  const { addItem } = useCart();
  const { toggle, isWishlisted } = useWishlist();

  return (
    <section className="py-16 bg-white dark:bg-gray-950">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <div className="flex items-end justify-between mb-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp size={14} className="text-brand-600 dark:text-brand-400" />
              <p className="text-brand-600 dark:text-brand-400 text-xs font-bold uppercase tracking-widest">
                What's popular
              </p>
            </div>
            <h2 className="font-display text-3xl sm:text-4xl font-bold text-gray-900 dark:text-white">
              Trending Now
            </h2>
          </div>
          <Link
            href="/trending"
            className="hidden sm:flex items-center gap-1.5 text-sm font-semibold text-brand-600 dark:text-brand-400 hover:gap-2.5 transition-all"
          >
            View all <ArrowRight size={15} />
          </Link>
        </div>

        {/* Product grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {trendingProducts.map((product: Product) => (
            <ProductCard
              key={product.id}
              product={product}
              onAddToCart={addItem}
              onToggleWishlist={toggle}
              isWishlisted={isWishlisted(product.id)}
            />
          ))}
        </div>

        {/* Mobile view all */}
        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/trending"
            className="inline-flex items-center gap-2 text-brand-600 dark:text-brand-400 font-semibold text-sm"
          >
            View all trending products <ArrowRight size={15} />
          </Link>
        </div>
      </div>
    </section>
  );
}
