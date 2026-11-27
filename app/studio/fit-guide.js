"use client";

import { useState } from "react";
import { imagePath } from "../media";

const measurements = [
  ["S", 57, 66, 58],
  ["M", 60, 69, 60],
  ["L", 63, 72, 62],
  ["XL", 66, 75, 64],
];

export default function FitGuide() {
  const [inches, setInches] = useState(false);
  return <>
    <div className="fit-angles">
      <figure><img src={imagePath("orange-front")} alt="Signal Hoodie front silhouette" width="508" height="508" loading="lazy" decoding="async" /><figcaption>Front</figcaption></figure>
      <figure><img src={imagePath("orange-side")} alt="Signal Hoodie side silhouette" width="508" height="508" loading="lazy" decoding="async" /><figcaption>Side</figcaption></figure>
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
