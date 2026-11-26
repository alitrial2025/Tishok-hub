"use client";

import { Check, ShoppingBag, X } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef, useState } from "react";
import { products } from "../catalog";
import { imagePath } from "../media";
import useBag from "../use-bag";
import Logo from "../wordmark";
import "./shop.css";

const Bag = dynamic(() => import("../bag"), { ssr: false, loading: () => <p role="status">Loading bag…</p> });
const total = products.length;
const wrapIndex = index => (index + total) % total;

export default function Shop() {
  const [active, setActive] = useState(0);
  const [size, setSize] = useState("M");
  const [added, setAdded] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const { bag, count, addItems, changeQuantity } = useBag();
  const drawer = useRef(null);
  const gesture = useRef(null);
  const ignoreClick = useRef(false);
  const product = products[active];

  function select(index) {
    if (index === active) return;
    setActive(index);
    setAdded(false);
    if (!products[index].sizes.includes(size)) setSize(products[index].sizes[0] === "One size" ? "One size" : "M");
  }

  function handleKey(event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    select(wrapIndex(active + (event.key === "ArrowLeft" ? -1 : 1)));
  }

  function startGesture(event) {
    if (!event.isPrimary || event.button !== 0) return;
    ignoreClick.current = false;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY };
  }

  function finishGesture(event) {
    const start = gesture.current;
    gesture.current = null;
    if (start?.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const distance = Math.abs(dx) > Math.abs(dy) ? dx : dy;
    if (Math.abs(distance) < 38) return;
    ignoreClick.current = true;
    select(wrapIndex(active + (distance < 0 ? 1 : -1)));
  }

  function openBag() {
    setBagOpen(true);
    drawer.current.showModal();
  }

  function closeBag() {
    drawer.current.close();
    setBagOpen(false);
  }

  return <main className="shop-page">
    <header className="header wrap shop-header">
      <Link className="brand" href="/" aria-label="OFF/FORM home"><Logo /></Link>
      <nav className="nav" aria-label="Main navigation"><Link href="/">Home</Link><Link href="/shop" className="current" aria-current="page">Shop</Link></nav>
      <div className="header-actions"><button className="bag-control" onClick={openBag}><ShoppingBag size={15} /> Bag <span className="bag-count">{count}</span></button></div>
    </header>

    <section className="shop-sheet wrap" aria-labelledby="shop-title">
      <div className="shop-paper">
        <div className="shop-paper-content">
          <p className="studio-label shop-label"><span /> COLLECTION / 01</p>
          <h1 id="shop-title">The<br />Drop<span>.</span></h1>
          <div className="shop-product" aria-live="polite">
            <div key={product.id} className="shop-product-copy"><h2>{product.title}</h2><p>{product.name} · ${product.price}</p></div>
          </div>
          <div className="shop-sizes" aria-label="Choose size">{product.sizes.map(option => <button key={option} aria-pressed={size === option} onClick={() => { setSize(option); setAdded(false); }}>{option}</button>)}</div>
          <button className="primary" onClick={() => { addItems([{ product: active, size, quantity: 1 }]); setAdded(true); }}>
            {added ? <Check size={16} /> : <ShoppingBag size={16} />} {added ? "Added to bag" : "Add to bag"}
          </button>
          <div className="wheel-controls" aria-label="Browse products">
            <button onClick={() => select(wrapIndex(active - 1))}>Prev</button>
            <span>{String(active + 1).padStart(2, "0")} / {String(total).padStart(2, "0")}</span>
            <button onClick={() => select(wrapIndex(active + 1))}>Next</button>
          </div>
        </div>
      </div>
      <div className="shop-wheel" role="region" aria-roledescription="carousel" aria-label="Collection products" onKeyDown={handleKey} onPointerDown={startGesture} onPointerUp={finishGesture} onPointerCancel={() => { gesture.current = null; }}>
        <div className="wheel-ring" aria-hidden="true" />
        {products.map((entry, index) => {
          const relative = ((index - active + total + 2) % total) - 2;
          const angle = relative * Math.PI / 4;
          return <button key={entry.id} className="wheel-piece" data-position={relative}
            style={{ "--wheel-x": `${19 + 49 * Math.cos(angle)}%`, "--wheel-y": `${50 + 43 * Math.sin(angle)}%`, "--wheel-angle": `${relative * 14}deg` }}
            aria-label={`${entry.title}, ${entry.name}`} aria-pressed={index === active} tabIndex={Math.abs(relative) === 2 ? -1 : 0}
            onClick={event => { if (event.detail === 0 || !ignoreClick.current) select(index); }}>
            <img src={imagePath(index < 3 ? `garment-${index}` : `${entry.file}-cutout`)} alt="" draggable={false} decoding="async" />
          </button>;
        })}
        <span className="wheel-hint">SWIPE OR SELECT A PIECE</span>
      </div>
    </section>

    <footer className="footer"><div className="wrap footer-inner"><Link href="/" aria-label="OFF/FORM home"><Logo /></Link><Link href="/#collection">Explore the rail</Link></div></footer>

    <dialog ref={drawer} className="dialog drawer" aria-labelledby="shop-bag-title" onClose={() => setBagOpen(false)} onClick={event => { if (event.target === drawer.current) closeBag(); }}>
      <div className="dialog-content"><div className="dialog-header"><h2 id="shop-bag-title">Your bag</h2><button className="icon-button" aria-label="Close bag" onClick={closeBag}><X size={22} /></button></div>
        {bagOpen && <Bag items={bag} onQuantity={changeQuantity} onClose={closeBag} />}
      </div>
    </dialog>
  </main>;
}
