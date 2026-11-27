"use client";

import { Check, ShoppingBag, X } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { hoodies, products, studioPath } from "../catalog";
import { imagePath } from "../media";
import useBag from "../use-bag";
import Logo from "../wordmark";
import "./shop.css";

const Bag = dynamic(() => import("../bag"), { ssr: false, loading: () => <p role="status">Loading bag…</p> });
const total = products.length;
const arc = 360 / total;
const halfway = Math.floor(total / 2);
const wrapIndex = index => ((index % total) + total) % total;
const shortestStep = (from, to) => wrapIndex(to - from + halfway) - halfway;

export default function Shop() {
  const [turn, setTurn] = useState(0);
  const active = wrapIndex(turn);
  const [size, setSize] = useState("M");
  const [added, setAdded] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const { bag, count, addItems, changeQuantity } = useBag();
  const drawer = useRef(null);
  const gesture = useRef(null);
  const gestureFrame = useRef(null);
  const ignoreClick = useRef(false);
  const product = products[active];

  useEffect(() => () => cancelAnimationFrame(gestureFrame.current), []);

  function select(index) {
    if (index === active) return;
    setTurn(current => current + shortestStep(active, index));
    setAdded(false);
    if (!products[index].sizes.includes(size)) setSize(products[index].sizes[0] === "One size" ? "One size" : "M");
  }

  function handleKey(event) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    const index = wrapIndex(active + (event.key === "ArrowLeft" ? -1 : 1));
    select(index);
    event.currentTarget.querySelectorAll(".wheel-piece")[index].focus({ preventScroll: true });
  }

  function startGesture(event) {
    if (!event.isPrimary || event.button !== 0) return;
    ignoreClick.current = false;
    gesture.current = { id: event.pointerId, x: event.clientX, y: event.clientY, distance: 0, moved: false };
  }

  function moveGesture(event) {
    const start = gesture.current;
    if (start?.id !== event.pointerId) return;
    const dx = event.clientX - start.x;
    const dy = event.clientY - start.y;
    const distance = event.pointerType === "mouse" && Math.abs(dy) > Math.abs(dx) ? dy : dx;
    const wheel = event.currentTarget;
    if (!start.moved && Math.abs(distance) < 8) return;
    if (!start.moved) {
      start.moved = true;
      ignoreClick.current = true;
      wheel.dataset.dragging = "true";
      wheel.setPointerCapture(event.pointerId);
    }
    start.distance = distance;
    if (gestureFrame.current !== null) return;
    gestureFrame.current = requestAnimationFrame(() => {
      gestureFrame.current = null;
      wheel.style.setProperty("--wheel-drag", `${Math.max(-arc, Math.min(arc, start.distance * 0.44))}deg`);
    });
  }

  function finishGesture(event, cancelled = false) {
    const start = gesture.current;
    if (start?.id !== event.pointerId) return;
    gesture.current = null;
    cancelAnimationFrame(gestureFrame.current);
    gestureFrame.current = null;
    const wheel = event.currentTarget;
    delete wheel.dataset.dragging;
    wheel.style.removeProperty("--wheel-drag");
    if (!cancelled && start.moved && Math.abs(start.distance) >= 38) {
      select(wrapIndex(active + (start.distance < 0 ? 1 : -1)));
    }
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
      <Link className="brand" href="/" aria-label="Tishok Hub home"><Logo /></Link>
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
          {active < hoodies.length && <Link className="shop-inspect" href={studioPath(active)} prefetch={false}>Inspect garment</Link>}
          <div className="wheel-controls" aria-label="Browse products">
            <button onClick={() => select(wrapIndex(active - 1))}>Prev</button>
            <div className="wheel-positions" aria-label="Jump to a product">
              {products.map((entry, index) => <button key={entry.id} type="button" aria-label={`Show ${entry.title}, ${entry.name}`} aria-pressed={index === active} onClick={() => select(index)} />)}
            </div>
            <button onClick={() => select(wrapIndex(active + 1))}>Next</button>
          </div>
        </div>
      </div>
      <div className="shop-wheel" role="region" aria-roledescription="carousel" aria-label="Collection products"
        style={{ "--wheel-turn": `${-turn * arc}deg` }}
        onKeyDown={handleKey} onPointerDown={startGesture} onPointerMove={moveGesture}
        onPointerUp={finishGesture} onPointerCancel={event => finishGesture(event, true)} onLostPointerCapture={event => { if (event.target === event.currentTarget) finishGesture(event, true); }}>
        <div className="wheel-ring" aria-hidden="true"><span className="wheel-axle" /></div>
        {products.map((entry, index) => {
          const relative = shortestStep(active, index);
          return <button key={entry.id} className="wheel-piece" data-position={relative}
            style={{ "--piece-angle": `${index * arc}deg`, "--piece-tilt": `${relative * 13}deg` }}
            aria-label={`${entry.title}, ${entry.name}`} aria-pressed={index === active} tabIndex={Math.abs(relative) === 2 ? -1 : 0}
            onClick={event => { if (event.detail === 0 || !ignoreClick.current) select(index); }}>
            <img src={imagePath(index < 3 ? `garment-${index}` : `${entry.file}-cutout`)} alt="" draggable={false} decoding="async" />
          </button>;
        })}
        <div className="wheel-caption">
          <span><b>{String(active + 1).padStart(2, "0")}</b> / {String(total).padStart(2, "0")}</span>
          <span className="wheel-hint">DRAG TO ROTATE</span>
        </div>
      </div>
    </section>

    <footer className="footer"><div className="wrap footer-inner"><Link href="/" aria-label="Tishok Hub home"><Logo /></Link><Link href="/#collection">Explore the rail</Link></div></footer>

    <dialog ref={drawer} className="dialog drawer" aria-labelledby="shop-bag-title" onClose={() => setBagOpen(false)} onClick={event => { if (event.target === drawer.current) closeBag(); }}>
      <div className="dialog-content"><div className="dialog-header"><h2 id="shop-bag-title">Your bag</h2><button className="icon-button" aria-label="Close bag" onClick={closeBag}><X size={22} /></button></div>
        {bagOpen && <Bag items={bag} onQuantity={changeQuantity} onClose={closeBag} />}
      </div>
    </dialog>
  </main>;
}
