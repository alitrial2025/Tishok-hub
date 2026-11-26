"use client";

import { Minus, Plus, ShoppingBag } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { products } from "./catalog";
import { imagePath } from "./media";

const pagesPreview = process.env.NEXT_PUBLIC_PAGES_PREVIEW === "1";

export default function Bag({ items, onQuantity, onClose }) {
  const request = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => () => request.current?.abort(), []);

  async function checkout() {
    if (request.current) return;
    const controller = new AbortController();
    request.current = controller;
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ items }),
        signal: controller.signal,
      });
      const result = await response.json();
      if (controller.signal.aborted) return;
      if (!response.ok || !result.url) {
        setError(result.error || "Checkout couldn’t open. Try again.");
        return;
      }
      window.location.assign(result.url);
    } catch {
      if (!controller.signal.aborted) setError("Checkout couldn’t connect. Try again.");
    } finally {
      request.current = null;
      if (!controller.signal.aborted) setBusy(false);
    }
  }

  if (!items.length) {
    return <div className="empty"><ShoppingBag size={30} /><p>Your bag is empty.</p><a href="#collection" className="primary" onClick={onClose}>Explore the drop</a></div>;
  }

  return <>
    <div className="bag-items">
      {items.map(item => {
        const product = products[item.product];
        const label = `${product.name} ${product.title.toLowerCase()}, size ${item.size}`;
        return <div className="bag-item" key={`${item.product}-${item.size}`}>
          <img src={imagePath(product.file)} alt="" width="79" height="79" />
          <div><h3>{product.title}</h3><p>{product.name} / {item.size}</p><div className="quantity">
            <button disabled={busy} aria-label={`Remove one ${label}`} onClick={() => onQuantity(item.product, item.size, -1)}><Minus size={14} /></button>
            <span>{item.quantity}</span>
            <button disabled={busy || item.quantity >= 20} aria-label={`Add one ${label}`} onClick={() => onQuantity(item.product, item.size, 1)}><Plus size={14} /></button>
          </div></div>
          <strong>${product.price * item.quantity}</strong>
        </div>;
      })}
    </div>
    <div className="bag-total">
      <div><span>Estimated subtotal</span><strong>${items.reduce((total, item) => total + products[item.product].price * item.quantity, 0)}</strong></div>
      {pagesPreview ? <p>Checkout is unavailable in this storefront preview.</p> : <>
        <p>Final prices, shipping, taxes, and the store’s return policy are shown at checkout.</p>
        <button className="primary" onClick={checkout} disabled={busy}>{busy ? "Checking availability…" : "Continue to checkout"}</button>
      </>}
      {error && <p className="checkout-error" role="alert">{error}</p>}
    </div>
  </>;
}
