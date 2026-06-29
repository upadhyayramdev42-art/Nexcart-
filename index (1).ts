"use client";

import { useState, useCallback } from "react";
import type { Product, CartItem, WishlistItem } from "@/types";

export function useCart() {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((product: Product, quantity = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.product.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.product.id === product.id
            ? { ...i, quantity: i.quantity + quantity }
            : i
        );
      }
      return [...prev, { product, quantity }];
    });
  }, []);

  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((i) => i.product.id !== productId));
  }, []);

  const totalCount = items.reduce((sum, i) => sum + i.quantity, 0);
  const totalPrice = items.reduce(
    (sum, i) => sum + i.product.price * i.quantity,
    0
  );

  return { items, addItem, removeItem, totalCount, totalPrice };
}

export function useWishlist() {
  const [items, setItems] = useState<WishlistItem[]>([]);

  const toggle = useCallback((product: Product) => {
    setItems((prev) => {
      const exists = prev.find((i) => i.product.id === product.id);
      if (exists) return prev.filter((i) => i.product.id !== product.id);
      return [...prev, { product, addedAt: new Date() }];
    });
  }, []);

  const isWishlisted = useCallback(
    (productId: string) => items.some((i) => i.product.id === productId),
    [items]
  );

  return { items, toggle, isWishlisted, count: items.length };
}
