"use client";

import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useWishlist, useCart } from "@/hooks";
import { formatCurrency } from "@/lib/utils";
import type { Product } from "@/types";

export default function WishlistPage() {
  const { items, toggle } = useWishlist();
  const { addItem } = useCart();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="font-display text-2xl font-bold text-gray-900 dark:text-white">My Wishlist</h1>
        <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{items.length} saved items</p>
      </div>

      {items.length === 0 ? (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-16 text-center">
          <Heart size={40} className="mx-auto mb-4 text-gray-200 dark:text-gray-700" />
          <p className="font-semibold text-gray-500 dark:text-gray-400 mb-2">Your wishlist is empty</p>
          <p className="text-sm text-gray-400 mb-5">Save products you love to buy them later</p>
          <a href="/" className="inline-flex items-center gap-2 bg-brand-600 hover:bg-brand-700 text-white font-semibold px-5 py-2.5 rounded-xl transition-all text-sm shadow-lg shadow-brand-600/30">
            Browse Products
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {items.map(({ product }) => (
            <WishlistCard
              key={product.id}
              product={product}
              onRemove={() => toggle(product)}
              onAddToCart={() => { addItem(product); toggle(product); }}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function WishlistCard({ product, onRemove, onAddToCart }: { product: Product; onRemove: () => void; onAddToCart: () => void }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 p-4 flex items-start gap-4">
            // eslint-disable-next-line @next/next/no-img-element
      <img src={product.image} alt={product.name} className="w-20 h-20 rounded-xl object-cover bg-gray-100 shrink-0" />
      <div className="flex-1 min-w-0">
        <p className="text-xs text-brand-500 font-semibold uppercase tracking-wide mb-0.5">{product.category}</p>
        <p className="font-semibold text-gray-900 dark:text-white text-sm line-clamp-2 mb-2">{product.name}</p>
        <p className="text-base font-bold text-gray-900 dark:text-white">{formatCurrency(product.price)}</p>
      </div>
      <div className="flex flex-col gap-2 shrink-0">
        <button onClick={onAddToCart} className="w-8 h-8 flex items-center justify-center rounded-xl bg-brand-600 hover:bg-brand-700 text-white transition-colors shadow-md shadow-brand-600/30" title="Add to cart">
          <ShoppingCart size={14} />
        </button>
        <button onClick={onRemove} className="w-8 h-8 flex items-center justify-center rounded-xl text-gray-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30 transition-colors" title="Remove">
          <Trash2 size={14} />
        </button>
      </div>
    </div>
  );
}
