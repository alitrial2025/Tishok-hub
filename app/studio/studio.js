"use client";

import "@fontsource/barlow-condensed/latin-800.css";
import { Check, Focus, ShoppingBag, X } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import { useRef, useState } from "react";
import { hoodies, studioPath } from "../catalog";
import { imagePath } from "../media";
import Logo from "../wordmark";
import Signature from "../signature";
import useBag from "../use-bag";
import FitGuide from "./fit-guide";
import "./studio.css";

const Bag = dynamic(() => import("../bag"), { ssr: false, loading: () => <p role="status">Loading bag…</p> });

export default function Studio({ index }) {
  const product = hoodies[index];
  const [size, setSize] = useState("M");
  const [detail, setDetail] = useState(false);
  const [added, setAdded] = useState(false);
  const [bagOpen, setBagOpen] = useState(false);
  const drawer = useRef(null);
  const { bag, count, addItems, changeQuantity } = useBag();

  function closeBag() {
    drawer.current.close();
    setBagOpen(false);
  }

  return <main className="garment-page">
    <header className="header wrap garment-header">
      <Link className="brand" href="/" aria-label="Tishok Hub home"><Logo /></Link>
      <nav className="nav" aria-label="Main navigation"><Link href="/shop">Shop</Link><Link href={studioPath(index)} className="current" aria-current="page">Studio</Link></nav>
      <div className="header-actions">
        <button className="bag-control" onClick={() => { drawer.current.showModal(); setBagOpen(true); }}><ShoppingBag size={15} /> Bag <span className="bag-count">{count}</span></button>
      </div>
    </header>

    <article className="garment-poster wrap" aria-labelledby="signal-heading">
      <div className="poster-topline">
        <span> TISHOK HUB<br />GARMENT STUDIO</span>
        <span>COLLECTION<br /><b>DROP 01</b></span>
        <span>SIGNAL HOODIE<br />{product.name.toUpperCase()}</span>
      </div>
      <h1 className="poster-heading" id="signal-heading">SIGNAL<span className="sr-only"> Hoodie in {product.name}</span></h1>
      <div className="poster-signature"><Signature /></div>
      <div className="poster-stage">
        <div className="poster-spec">
          <div><strong>480</strong><span>GSM COTTON</span></div>
          <div><span>RELAXED CUT</span><span>DROPPED SHOULDER</span></div>
          <a href="#fit-guide">Fit guide</a>
        </div>
        <div className="poster-art">
          {detail
            ? <img key="detail" className="poster-detail studio-reveal" src={imagePath("orange-detail")} alt="Close-up of stitching and print on the Signal Orange hoodie" width="508" height="508" />
            : <img key="garment" className="poster-piece studio-reveal" src={imagePath(`feature-${index}`)}
                srcSet={`${imagePath(`feature-${index}`)} 360w, ${imagePath(`studio-${index}`)} 640w`}
                sizes="(max-width: 620px) 86vw, 520px" alt={`${product.name} Signal Hoodie, back view`} width="640" height="640" fetchPriority="high" />}
        </div>
        <div className="poster-spec poster-color">
          <span>COLORWAY</span>
          <strong>{product.name}</strong>
          <div className="poster-swatches" aria-label="Hoodie colors">{hoodies.map((item, colorIndex) => <Link key={item.id} href={studioPath(colorIndex)} prefetch={false} aria-label={item.name} aria-current={index === colorIndex ? "page" : undefined} style={{ "--swatch": item.color }} />)}</div>
          <button onClick={() => setDetail(current => !current)} aria-pressed={detail}><Focus size={15} /> {detail ? "Full garment" : "Fabric close-up"}</button>
          {detail && index !== 0 && <span className="poster-detail-note">Detail shown in Signal Orange</span>}
        </div>
      </div>
      <div className="poster-checkout">
        <div className="poster-size"><span>SIZE</span><div className="studio-switch" aria-label="Choose size">{product.sizes.map(option => <button key={option} aria-pressed={option === size} onClick={() => { setSize(option); setAdded(false); }}>{option}</button>)}</div></div>
        <div className="poster-actions">
          <Link className="studio-secondary" href={`/?try=${product.id}&size=${size}#featured`} prefetch={false}>Show on model</Link>
          <button className="primary" onClick={() => { addItems([{ product: index, size, quantity: 1 }]); setAdded(true); }}>
            {added ? <Check size={16} /> : <ShoppingBag size={16} />} {added ? "Added to bag" : `Add to bag · $${product.price}`}
          </button>
          <span className="sr-only" role="status">{added ? `${product.name} in size ${size} added to your bag.` : ""}</span>
        </div>
      </div>
    </article>

    <section className="studio-measurements wrap" id="fit-guide">
      <h2>Find your fit<span>.</span></h2>
      <FitGuide />
    </section>

    <footer className="footer"><div className="wrap footer-inner"><Link href="/" aria-label="Tishok Hub home"><Logo /></Link><Link href="/shop">Back to shop</Link></div></footer>

    <dialog ref={drawer} className="dialog drawer" aria-labelledby="studio-bag-title" onClose={() => setBagOpen(false)} onClick={event => { if (event.target === drawer.current) closeBag(); }}>
      <div className="dialog-content"><div className="dialog-header"><h2 id="studio-bag-title">Your bag</h2><button className="icon-button" aria-label="Close bag" onClick={closeBag}><X size={22} /></button></div>
        {bagOpen && <Bag items={bag} onQuantity={changeQuantity} onClose={closeBag} />}
      </div>
    </dialog>
  </main>;
}
