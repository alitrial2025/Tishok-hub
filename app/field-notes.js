"use client";

import { Check, Focus, Ruler, ShoppingBag } from "lucide-react";
import { useState } from "react";
import { campaigns, hoodies, products, sizes } from "./catalog";
import { imagePath } from "./media";

const measurements = [
  ["S", 57, 66, 58],
  ["M", 60, 69, 60],
  ["L", 63, 72, 62],
  ["XL", 66, 75, 64],
];

function FitGuide() {
  const [inches, setInches] = useState(false);
  return <>
    <div className="fit-angles">
      <figure><img src={imagePath("orange-front")} alt="Signal Hoodie front silhouette" width="508" height="508" /><figcaption>Front</figcaption></figure>
      <figure><img src={imagePath("orange-side")} alt="Signal Hoodie side silhouette" width="508" height="508" /><figcaption>Side</figcaption></figure>
    </div>
    <div className="measurement-heading"><h3>Garment measurements</h3><div className="studio-switch" aria-label="Units">
      <button onClick={() => setInches(false)} aria-pressed={!inches}>CM</button><button onClick={() => setInches(true)} aria-pressed={inches}>IN</button>
    </div></div>
    <p>Relaxed through the chest with a dropped shoulder. Measure your favorite hoodie flat across the chest for comparison.</p>
    <table className="measurements">
      <caption className="sr-only">Reference garment measurements in {inches ? "inches" : "centimeters"}</caption>
      <thead><tr><th scope="col">Size</th><th scope="col">Chest laid flat</th><th scope="col">Body length</th><th scope="col">Sleeve</th></tr></thead>
      <tbody>{measurements.map(([size, ...values]) => <tr key={size}><th scope="row">{size}</th>{values.map((value, index) => <td key={index}>{inches ? (value / 2.54).toFixed(1) : value}</td>)}</tr>)}</tbody>
    </table>
    <p className="fit-footnote">Reference measurements for the Signal Hoodie. Styling reference: size L on a 183 cm frame.</p>
  </>;
}

export function GarmentPanel({ index, initialSize, initialView, onAdd, onTry }) {
  const [view, setView] = useState(initialView);
  const [detail, setDetail] = useState(false);
  const [size, setSize] = useState(initialSize);
  const [added, setAdded] = useState(false);
  const item = hoodies[index];
  const image = detail ? "orange-detail" : item.file;

  return <div className="garment-content">
    <div className="studio-switch garment-switch" aria-label="Garment information">
      <button aria-pressed={view === "inspect"} onClick={() => setView("inspect")}><Focus size={15} /> Inspect</button>
      <button aria-pressed={view === "fit"} onClick={() => setView("fit")}><Ruler size={15} /> Fit guide</button>
    </div>
    {view === "fit" ? <FitGuide /> : <>
      <div className="garment-grid">
        <div className="garment-visual" style={{ "--inspection-placeholder": `url("${imagePath(`thumb-${image}`)}")` }}>
          <img key={image} className="studio-reveal" src={imagePath(image)} alt={detail ? "Signal Orange cotton stitching and distressed print" : `${item.name} hoodie from the back`} width="508" height="508" />
          <button className="garment-zoom" onClick={() => setDetail(current => !current)} aria-pressed={detail}><Focus size={16} /> {detail ? "Show garment" : "Fabric close-up"}</button>
        </div>
        <div className="garment-spec">
          <p className="studio-label">{item.name}</p>
          <h3>Signal Hoodie</h3>
          <p>Heavyweight cotton with a brushed interior, dropped shoulders, and a distressed back print.</p>
          <dl><div><dt>Weight</dt><dd>480 GSM</dd></div><div><dt>Fit</dt><dd>Relaxed</dd></div><div><dt>Material</dt><dd>Cotton</dd></div></dl>
          {detail && index !== 0 && <p className="fit-footnote">Fabric close-up shown in Signal Orange.</p>}
        </div>
      </div>
      <div className="garment-actions">
        <div className="studio-switch" aria-label="Choose size">{sizes.map(option => <button key={option} aria-pressed={option === size} onClick={() => { setSize(option); setAdded(false); }}>{option}</button>)}</div>
        <button className="studio-secondary" onClick={() => onTry(index, size)}>Show on model</button>
        <button className="primary" onClick={() => { onAdd([{ product: index, size, quantity: 1 }]); setAdded(true); }}>{added ? <Check size={16} /> : <ShoppingBag size={16} />} {added ? "Added" : `Add to bag · $${item.price}`}</button>
        <span className="sr-only" role="status">{added ? `${item.name} in size ${size} added to your bag.` : ""}</span>
      </div>
    </>}
  </div>;
}

const chapters = [
  { title: "The silhouette", line: "A dropped shoulder and a wide body leave room to move.", image: campaigns[0], alt: "Model in the Signal Orange hoodie against concrete", product: 0 },
  { title: "The surface", line: "A distressed print breaks over heavyweight cotton and exposed stitching.", image: "orange-detail", alt: "Close-up of stitching and distressed print on orange cotton", product: 0 },
  { title: "After hours", line: "Washed coal and bone ink change how the same cut reads in the studio.", image: campaigns[1], alt: "Model wearing the Washed Coal hoodie in profile", product: 1 },
];

export function Lookbook({ onInspect }) {
  const [chapter, setChapter] = useState(0);
  const entry = chapters[chapter];
  return <div className="editorial-look">
    <div className="lookbook-tabs" aria-label="Lookbook chapters">
      {chapters.map((item, index) => <button key={item.title} aria-pressed={chapter === index} onClick={() => setChapter(index)}>{item.title}</button>)}
    </div>
    <div className="lookbook-spread">
      <img key={entry.image} className="studio-reveal" src={imagePath(entry.image)} alt={entry.alt} />
      <div className="lookbook-copy">
        <p className="studio-label">Field Notes / 01</p>
        <h3>{entry.title}</h3><p>{entry.line}</p>
        <button className="studio-secondary" onClick={() => onInspect(entry.product)}>Inspect the hoodie</button>
        {chapter === chapters.length - 1 && <div className="signature">Ari Mercer</div>}
      </div>
    </div>
  </div>;
}

export function Workshop({ onAdd, onInspect }) {
  const [selected, setSelected] = useState([true, true]);
  const [hoodieSize, setHoodieSize] = useState("M");
  const [cargoSize, setCargoSize] = useState("M");
  const [message, setMessage] = useState("");
  const look = Number(selected[0]) * 2 + Number(selected[1]);
  const items = [{ product: 0, size: hoodieSize, quantity: 1 }];
  if (selected[0]) items.push({ product: 3, size: cargoSize, quantity: 1 });
  if (selected[1]) items.push({ product: 4, size: "One size", quantity: 1 });
  const total = items.reduce((sum, item) => sum + products[item.product].price, 0);

  function add(lines) {
    onAdd(lines);
    setMessage(lines.length > 1 ? "Look added to your bag." : `${products[lines[0].product].title} added to your bag.`);
  }

  return <div className="workshop-grid">
    <div className="workshop-preview">
      <img key={look} className="studio-reveal" src={imagePath(`look-${look}`)} alt={`Model in a Signal Orange hoodie, ${selected[0] ? "Field Cargo trousers" : "plain black trousers"}${selected[1] ? ", and the Slash Cap" : ""}`} width="590" height="510" />
      <span className="studio-label">LOOK PREVIEW · SIGNAL ORANGE</span>
    </div>
    <div className="workshop-controls">
      <div className="workshop-base">
        <div><h3>Signal Hoodie</h3><p>Signal Orange · $128</p></div>
        <div><label htmlFor="look-hoodie-size">Hoodie size</label><select id="look-hoodie-size" value={hoodieSize} onChange={event => setHoodieSize(event.target.value)}>{sizes.map(size => <option key={size}>{size}</option>)}</select></div>
        <button className="studio-secondary" onClick={() => onInspect(0)}>Inspect</button>
      </div>
      {[products[3], products[4]].map((product, index) => (
        <div className="workshop-piece" key={product.id}>
          <img src={imagePath(product.file)} alt="" width="84" height="84" loading="lazy" />
          <div><label className="piece-toggle"><input type="checkbox" checked={selected[index]} onChange={() => { setSelected(current => current.map((enabled, i) => i === index ? !enabled : enabled)); setMessage(""); }} /> {product.title}</label><p>{product.description} · ${product.price}</p>
            {index === 0 && <label className="piece-size">Cargo size <select value={cargoSize} onChange={event => setCargoSize(event.target.value)}>{sizes.map(size => <option key={size}>{size}</option>)}</select></label>}
          </div>
          <button className="studio-secondary" onClick={() => add([{ product: index + 3, size: index === 0 ? cargoSize : "One size", quantity: 1 }])}>Add piece</button>
        </div>
      ))}
      <div className="workshop-add"><button className="primary" onClick={() => add(items)}><ShoppingBag size={16} /> Add {items.length > 1 ? "the look" : "hoodie"} · ${total}</button><p role="status">{message}</p></div>
    </div>
  </div>;
}
