"use client";

import { useEffect, useState } from "react";
import { validItem } from "./catalog";

export default function useBag() {
  const [bag, setBag] = useState(null);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem("offform-bag") || "[]");
      setBag(Array.isArray(stored) ? stored.filter(validItem).map(item => ({ ...item, quantity: Math.min(item.quantity, 20) })) : []);
    } catch {
      setBag([]);
    }
  }, []);

  useEffect(() => {
    if (bag === null) return;
    try { localStorage.setItem("offform-bag", JSON.stringify(bag)); } catch {}
  }, [bag]);

  function addItems(items) {
    setBag(current => {
      const updated = [...(current || [])];
      for (const item of items) {
        const index = updated.findIndex(entry => entry.product === item.product && entry.size === item.size);
        if (index === -1) updated.push(item);
        else updated[index] = { ...updated[index], quantity: Math.min(20, updated[index].quantity + item.quantity) };
      }
      return updated;
    });
  }

  function changeQuantity(product, size, delta) {
    if (delta > 0) {
      addItems([{ product, size, quantity: delta }]);
    } else {
      setBag(current => (current || []).map(item => item.product === product && item.size === size
        ? { ...item, quantity: item.quantity + delta } : item).filter(item => item.quantity > 0));
    }
  }

  return { bag: bag || [], count: bag?.reduce((sum, item) => sum + item.quantity, 0) || 0, addItems, changeQuantity };
}
