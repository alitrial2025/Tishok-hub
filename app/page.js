"use client";

import { Check, Crosshair, Menu, Shirt, ShoppingBag, X } from "lucide-react";
import dynamic from "next/dynamic";
import Link from "next/link";
import useBag from "./use-bag";
import Logo from "./wordmark";
import Signature from "./signature";
import { useEffect, useRef, useState } from "react";
import Clothesline, { garmentImage } from "./clothesline";
import { campaigns, hoodies, sizes } from "./catalog";
import { imagePath } from "./media";

const Workshop = dynamic(() => import("./field-notes").then(module => module.Workshop), { loading: StudioLoading, ssr: false });
const GarmentPanel = dynamic(() => import("./field-notes").then(module => module.GarmentPanel), { loading: StudioLoading, ssr: false });
const Lookbook = dynamic(() => import("./field-notes").then(module => module.Lookbook), { loading: StudioLoading, ssr: false });
const Bag = dynamic(() => import("./bag"), { loading: StudioLoading, ssr: false });

function StudioLoading() {
  return <p className="studio-loading" role="status">Loading…</p>;
}

const photos = [
  { alt: "Signal Orange hoodie, back view", file: "orange-back" },
  { alt: "Signal Orange hoodie, front view", file: "orange-front" },
  { alt: "Signal Orange hoodie, side view", file: "orange-side" },
  { alt: "Washed Coal hoodie, back view", file: "coal-back" },
  { alt: "Concrete hoodie, back view", file: "concrete-back" },
  { alt: "Signal Orange hoodie, fabric detail", file: "orange-detail" },
];

function ProductImage({ index, thumbnail = false, ...props }) {
  return <img src={imagePath(`${thumbnail ? "thumb-" : ""}${photos[index].file}`)} alt={photos[index].alt} width={thumbnail ? 96 : 508} height={thumbnail ? 96 : 508} decoding="async" {...props} />;
}

function outfitPoints(frame, campaign, mobile) {
  const card = frame.getBoundingClientRect();
  const stage = campaign.getBoundingClientRect();
  const scale = mobile ? stage.height / 1024 : Math.max(stage.width / 1536, stage.height / 1024);
  const model = {
    x: stage.left + (stage.width - 1536 * scale) * (mobile ? 0.52 : 0.5) + 792 * scale,
    y: stage.top + 505 * scale,
    width: 292 * scale,
  };
  const product = { x: card.left + card.width / 2, y: card.top + card.height / 2, width: card.width * 0.68 };
  return { model, product };
}

function centerOutfit(points, signal) {
  if (points.model.y >= 110 && points.product.y <= innerHeight - 110) {
    return Promise.resolve();
  }

  const midpoint = (points.model.y + points.product.y) / 2;
  const target = Math.max(0, scrollY + midpoint - innerHeight * 0.5);
  if (Math.abs(target - scrollY) < 1) return Promise.resolve();

  return new Promise(resolve => {
    const done = () => {
      clearTimeout(timeout);
      window.removeEventListener("scrollend", done);
      signal.removeEventListener("abort", done);
      resolve();
    };
    const timeout = setTimeout(done, 500);
    signal.addEventListener("abort", done, { once: true });
    window.addEventListener("scrollend", done, { once: true });
    window.scrollTo({ top: target, behavior: "smooth" });
  });
}

async function flyHoodie(index, frame, campaign, reverse, signal) {
  if (signal.aborted || matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const mobile = matchMedia("(max-width: 760px)").matches;
  if (mobile) await centerOutfit(outfitPoints(frame, campaign, mobile), signal);
  if (signal.aborted) return;
  const { model, product } = outfitPoints(frame, campaign, mobile);
  const [from, to] = reverse ? [model, product] : [product, model];
  const sprite = document.createElement("img");
  sprite.src = garmentImage(index);
  sprite.alt = "";
  sprite.className = "flying-hoodie";
  sprite.style.left = `${from.x}px`;
  sprite.style.top = `${from.y}px`;
  sprite.style.width = `${from.width}px`;
  document.body.append(sprite);

  const dx = to.x - from.x;
  const dy = to.y - from.y;
  const size = to.width / from.width;
  const rotation = reverse ? 17 : -17;
  const animation = sprite.animate([
    { transform: "translate(-50%, -50%) scale(.94)", opacity: 0 },
    { transform: "translate(-50%, -50%) scale(1)", opacity: 1, offset: 0.12 },
    { transform: `translate(calc(-50% + ${dx * 0.54}px), calc(-50% + ${dy * 0.54 - (mobile ? 44 : 125)}px)) rotate(${rotation}deg) scale(${(1 + size) * 0.55})`, opacity: 1, offset: 0.55 },
    { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(0) scale(${size})`, opacity: 1, offset: 0.88 },
    { transform: `translate(calc(-50% + ${dx}px), calc(-50% + ${dy}px)) rotate(0) scale(${size * 0.96})`, opacity: 0 },
  ], { duration: 780, easing: "cubic-bezier(.24,.64,.32,1)" });

  const cancel = () => animation.cancel();
  signal.addEventListener("abort", cancel, { once: true });
  try {
    await animation.finished;
  } catch (error) {
    if (!signal.aborted) throw error;
  } finally {
    signal.removeEventListener("abort", cancel);
    sprite.remove();
  }
}

export default function Storefront() {
  const [product, setProduct] = useState(2);
  const [photo, setPhoto] = useState(hoodies[2].image);
  const [worn, setWorn] = useState(0);
  const [outgoingWorn, setOutgoingWorn] = useState(null);
  const [previousFit, setPreviousFit] = useState(null);
  const [swapping, setSwapping] = useState(false);
  const [arrival, setArrival] = useState(0);
  const [fitMessage, setFitMessage] = useState("");
  const swap = useRef(null);
  const campaign = useRef(null);
  const productFrame = useRef(null);
  const fitButton = useRef(null);
  const [size, setSize] = useState("M");
  const { bag, count, addItems, changeQuantity } = useBag();
  const [added, setAdded] = useState(false);
  const [panel, setPanel] = useState(null);
  const [inspection, setInspection] = useState({ index: 0, view: "inspect" });
  const [workshopVisible, setWorkshopVisible] = useState(false);
  const workshop = useRef(null);
  const pendingTry = useRef(null);
  const dialog = useRef(null);
  const addTimer = useRef(null);

  useEffect(() => () => {
    clearTimeout(addTimer.current);
    swap.current?.abort();
  }, []);

  useEffect(() => {
    const element = dialog.current;
    if (panel && !element.open) element.showModal();
    if (!panel && element.open) element.close();
  }, [panel]);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setWorkshopVisible(true);
        observer.disconnect();
      }
    }, { rootMargin: "180px" });
    observer.observe(workshop.current);
    return () => observer.disconnect();
  }, []);

  function selectProduct(index) {
    if (swap.current) return;
    setProduct(index);
    setPhoto(hoodies[index].image);
    setAdded(false);
  }

  function selectPhoto(index) {
    if (swap.current) return;
    const variant = index === 3 ? 1 : index === 4 ? 2 : 0;
    if (variant !== product) setAdded(false);
    setProduct(variant);
    setPhoto(index);
  }

  function openInspection(index, view = "inspect") {
    setInspection({ index, view });
    setPanel("inspect");
  }

  function showOnModel(index, newSize) {
    pendingTry.current = { index, size: newSize };
    setPanel(null);
  }

  function closeDialog() {
    const request = pendingTry.current;
    pendingTry.current = null;
    setPanel(null);
    if (!request || swap.current) return;
    selectProduct(request.index);
    setSize(request.size);
    productFrame.current.scrollIntoView({ block: "center", behavior: "instant" });
    fitButton.current.focus({ preventScroll: true });
    changeOutfit(false, request.index, hoodies[request.index].image);
  }

  async function changeOutfit(reverse = false, selected = product, selectedPhoto = photo) {
    if (swap.current || (reverse ? !previousFit : selected === worn)) return;
    const controller = new AbortController();
    swap.current = controller;
    setSwapping(true);
    const nextCard = hoodies.findIndex((_, index) => index !== selected && index !== worn);
    const next = reverse ? previousFit : { worn: selected, product: nextCard, photo: hoodies[nextCard].image };
    const incoming = new Image();
    incoming.src = imagePath(campaigns[next.worn]);
    const ready = incoming.decode().then(() => true, () => false);
    const cancelLoad = () => incoming.removeAttribute("src");
    controller.signal.addEventListener("abort", cancelLoad, { once: true });

    try {
      const [, loaded] = await Promise.all([
        flyHoodie(reverse ? worn : selected, productFrame.current, campaign.current, reverse, controller.signal),
        ready,
      ]);
      if (controller.signal.aborted) return;
      if (!loaded) {
        setFitMessage("The outfit preview couldn’t load. Try again.");
        return;
      }
      setPreviousFit(reverse ? null : { worn, product: selected, photo: selectedPhoto });
      setOutgoingWorn(matchMedia("(prefers-reduced-motion: reduce)").matches ? null : worn);
      setWorn(next.worn);
      setProduct(next.product);
      setPhoto(next.photo);
      setAdded(false);
      setArrival(current => current + 1);
      setFitMessage(`Model wearing ${hoodies[next.worn].name}. ${hoodies[next.product].name} is now in the product card.`);
      if (reverse) fitButton.current.focus({ preventScroll: true });
    } catch {
      if (!controller.signal.aborted) setFitMessage("The outfit preview couldn’t load. Try again.");
    } finally {
      controller.signal.removeEventListener("abort", cancelLoad);
      swap.current = null;
      if (!controller.signal.aborted) setSwapping(false);
    }
  }

  function addToBag() {
    changeQuantity(product, size, 1);
    setAdded(true);
    clearTimeout(addTimer.current);
    addTimer.current = setTimeout(() => setAdded(false), 1600);
  }

  return (
    <main>
      <section className="hero" id="top">
        <div className="campaign-art" ref={campaign} aria-hidden="true">
          {outgoingWorn !== null && <img key={`outgoing-${outgoingWorn}`} src={imagePath(campaigns[outgoingWorn])} alt="" width="1536" height="1024" className="outgoing-campaign" />}
          <img key={worn} src={imagePath(campaigns[worn])} alt="" data-active="true" width="1536" height="1024" className={outgoingWorn !== null ? "incoming-campaign" : undefined} onAnimationEnd={() => setOutgoingWorn(null)} fetchPriority="high" />
        </div>
        <header className="header wrap">
          <a className="brand" href="#top" aria-label="Tishok Hub home"><Logo /></a>
          <nav className="nav" aria-label="Main navigation">
            <a className="current" href="#top">Home</a>
            <Link href="/shop" prefetch={false}>Shop</Link>
            <a href="#workshop">Build a fit</a>
            <button onClick={() => setPanel("lookbook")}>Lookbook</button>
            <button onClick={() => setPanel("about")}>About</button>
          </nav>
          <div className="header-actions">
            <button className="bag-control" onClick={() => setPanel("bag")}><ShoppingBag size={15} /> <span>Bag</span> <span className="bag-count">{count}</span></button>
            <button className="menu-control" aria-label="Open navigation" onClick={() => setPanel("menu")}><Menu size={21} /></button>
          </div>
        </header>

        <div className="hero-inner wrap">
          <div className="hero-copy">
            <h1>Uniform for<br />the <em>unruly.</em></h1>
            <p>Heavyweight streetwear for life outside the lines. Cut with intent. Worn your way.</p>
            <div className="hero-actions">
              <Link className="primary" href="/shop" prefetch={false}>Shop the drop</Link>
              <button className="lookbook-link" onClick={() => setPanel("lookbook")}>View lookbook</button>
            </div>
            <Signature caption />
          </div>

          <div className="feature" id="featured">
            <article className="product-card" aria-label="Featured hoodie">
              <div className="card-kicker"><span><i /> FEATURED PIECE</span><span>{String(product + 1).padStart(2, "0")} / 03</span></div>
              <div className="product-frame" ref={productFrame} data-swapping={swapping}>
                <ProductImage key={arrival} index={photo} fetchPriority="high" className={arrival ? "card-arrival" : undefined} />
                <div className="outfit-controls">
                  <button className="fit-button" ref={fitButton} aria-disabled={swapping || product === worn} onClick={() => changeOutfit()}><Shirt size={15} /> {product === worn ? "On model" : "Try on model"}</button>
                  {previousFit && <button className="fit-undo" aria-disabled={swapping} onClick={() => changeOutfit(true)}>Undo</button>}
                </div>
                <span className="photo-number">{String(photo + 1).padStart(2, "0")} / 06</span>
              </div>
              <span className="sr-only" role="status">{fitMessage}</span>
              <div className="product-info">
                <div className="product-title"><h2>Signal Hoodie</h2><strong>${hoodies[product].price}</strong></div>
                <div className="product-variant"><span>{hoodies[product].name}</span><div className="swatches" aria-label="Color">
                  {hoodies.map((entry, index) => <button key={entry.name} aria-label={entry.name} aria-pressed={product === index} disabled={swapping} style={{ "--swatch": entry.color }} onClick={() => selectProduct(index)} />)}
                </div></div>
                <button className="fit-guide-link" onClick={() => openInspection(product, "fit")}>Fit guide</button>
                <div className="sizes" aria-label="Size">
                  {sizes.map(option => <button key={option} aria-pressed={size === option} onClick={() => { setSize(option); setAdded(false); }}>{option}</button>)}
                </div>
                <button className="add" onClick={addToBag} disabled={swapping}>{added ? "Added to bag" : "Add to bag"} {added ? <Check size={16} /> : <ShoppingBag size={15} />}</button>
                <span className="sr-only" role="status">{added ? `${hoodies[product].name} hoodie in size ${size} added to your bag` : ""}</span>
              </div>
            </article>
            <div className="thumbnail-rail" aria-label="Product gallery">
              {photos.map((entry, index) => <button key={entry.file} aria-label={entry.alt} aria-pressed={photo === index} disabled={swapping} onClick={() => selectPhoto(index)}><ProductImage index={index} alt="" thumbnail /></button>)}
            </div>
          </div>
        </div>

        <div className="hero-footer wrap">
          <div className="campaign"><Crosshair size={16} /><span>Tishok Hub STUDIOS<small> VOL. 01 — FIELD NOTES</small></span></div>
        </div>
      </section>

      <div className="drop-strip">
        <div className="wrap drop-strip-inner">
          <span className="drop-label">DROP <b>01</b></span>
          <strong>Uniform for the Unruly</strong>
          <a href="#collection">Explore the rail</a>
        </div>
      </div>

      <section className="collection rail-campaign" id="collection">
        <div className="rail-heading wrap">
          <div className="rail-edition"><span>Tishok Hub STUDIOS</span><span>SIGNAL SERIES / 01</span></div>
          <h2>The Signal Series<span>.</span></h2>
          <p>Three heavyweight hoodies. One relaxed silhouette.</p>
        </div>
        <Clothesline products={hoodies} onInspect={openInspection} />
      </section>

      <section className="workshop" id="workshop">
        <div className="wrap">
          <div className="workshop-heading"><div><p className="studio-label">Tishok Hub FIT STUDIO</p><h2>Build a fit<span>.</span></h2></div><p>Start with the Signal Hoodie. Add cargos and a cap to see the full look on the campaign model.</p></div>
          <div ref={workshop} className="workshop-slot">{workshopVisible && <Workshop onAdd={addItems} onInspect={openInspection} />}</div>
        </div>
      </section>

      <footer className="footer">
        <div className="wrap footer-inner">
          <a href="#top" aria-label="Tishok Hub home"><Logo /></a><span>INDEPENDENT STREETWEAR</span><a href="#top">Back to top</a>
        </div>
      </footer>

      <dialog ref={dialog} className={panel === "lookbook" || panel === "inspect" ? "dialog studio-dialog" : "dialog drawer"} aria-labelledby="panel-title" onCancel={event => { event.preventDefault(); setPanel(null); }} onClose={closeDialog} onClick={event => { if (event.target === event.currentTarget) setPanel(null); }}>
        <div className="dialog-content">
          <div className="dialog-header">
            <h2 id="panel-title">{panel === "bag" ? "Your bag" : panel === "lookbook" ? "Field Notes / 01" : panel === "inspect" ? "Garment studio" : panel === "menu" ? "Menu" : "About Tishok Hub"}</h2>
            <button className="icon-button" aria-label="Close panel" onClick={() => setPanel(null)}><X size={22} /></button>
          </div>
          {panel === "bag" && <Bag items={bag} onQuantity={changeQuantity} onClose={() => setPanel(null)} />}
          {panel === "lookbook" && <Lookbook onInspect={openInspection} />}
          {panel === "inspect" && <GarmentPanel key={`${inspection.index}-${inspection.view}`} index={inspection.index} initialView={inspection.view} initialSize={size} onAdd={addItems} onTry={showOnModel} />}
          {panel === "about" && <div className="about-copy"><div className="section-label"><span /> Tishok Hub STUDIOS</div><p>Tishok Hub is an independent streetwear label focused on heavyweight fabrics, relaxed silhouettes, and industrial graphics.</p><p>Drop 01 starts with a single piece in three colors. The Signal Hoodie is cut from 480 GSM cotton.</p><Link className="primary" href="/shop" onClick={() => setPanel(null)}>Shop the drop</Link></div>}
          {panel === "menu" && <nav className="mobile-nav" aria-label="Mobile navigation"><a href="#top" onClick={() => setPanel(null)}>Home</a><Link href="/shop" onClick={() => setPanel(null)}>Shop</Link><a href="#workshop" onClick={() => setPanel(null)}>Build a fit</a><button onClick={() => setPanel("lookbook")}>Lookbook</button><button onClick={() => setPanel("about")}>About</button></nav>}
        </div>
      </dialog>
    </main>
  );
}
