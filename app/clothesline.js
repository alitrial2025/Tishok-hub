"use client";

import { Focus, Hand } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { imagePath } from "./media";

const homePositions = [21, 50, 79];
const clamp = (number, min, max) => Math.min(max, Math.max(min, number));

export function garmentImage(index) {
  return imagePath(`garment-${index}`);
}

export default function Clothesline({ products, onInspect }) {
  const rail = useRef(null);
  const action = useRef(null);
  const ignoreClick = useRef(false);
  const frame = useRef(null);
  const [positions, setPositions] = useState(homePositions);
  const [selected, setSelected] = useState(0);
  const [dragging, setDragging] = useState(null);
  const [tilt, setTilt] = useState(0);
  const [released, setReleased] = useState(null);
  const [entered, setEntered] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setEntered(true);
        observer.disconnect();
      }
    }, { threshold: 0.22 });
    observer.observe(rail.current);
    return () => { observer.disconnect(); cancelAnimationFrame(frame.current); };
  }, []);

  function move(index, value) {
    const railWidth = rail.current.clientWidth;
    const garmentWidth = rail.current.querySelector(".hanging-piece").offsetWidth;
    const margin = garmentWidth / railWidth * 50;
    setPositions(current => current.map((position, item) => item === index ? clamp(value, margin, 100 - margin) : position));
  }

  function start(event, index) {
    if (!event.isPrimary || event.button !== 0) return;
    ignoreClick.current = false;
    const width = rail.current.clientWidth;
    const element = event.currentTarget;
    action.current = {
      index, element, width, margin: element.offsetWidth / width * 50, pointer: event.pointerId,
      start: event.clientX, last: event.clientX, position: positions[index], moved: false, tilt: 0,
    };
    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function slide(event) {
    const drag = action.current;
    if (!drag || event.pointerId !== drag.pointer) return;
    const distance = event.clientX - drag.start;
    if (!drag.moved && Math.abs(distance) < 5) return;
    if (!drag.moved) {
      drag.moved = true;
      ignoreClick.current = true;
      setSelected(drag.index);
      setDragging(drag.index);
      setReleased(null);
    }
    drag.nextPosition = clamp(drag.position + distance / drag.width * 100, drag.margin, 100 - drag.margin);
    const delta = event.clientX - drag.last;
    if (Math.abs(delta) >= 1) drag.tilt = clamp(drag.tilt * 0.55 - delta * 0.65, -15, 15);
    drag.last = event.clientX;
    if (frame.current === null) {
      frame.current = requestAnimationFrame(() => {
        frame.current = null;
        drag.element.style.setProperty("--position", `${drag.nextPosition}%`);
        drag.element.style.setProperty("--tilt", `${drag.tilt}deg`);
      });
    }
  }

  function finish(event) {
    const drag = action.current;
    if (!drag || event.pointerId !== drag.pointer) return;
    action.current = null;
    if (drag.moved) {
      cancelAnimationFrame(frame.current);
      frame.current = null;
      setPositions(current => current.map((position, index) => index === drag.index ? drag.nextPosition : position));
      setTilt(drag.tilt);
      setDragging(null);
      setReleased(drag.index);
    }
  }

  function useKeys(event, index) {
    if (event.key !== "ArrowLeft" && event.key !== "ArrowRight") return;
    event.preventDefault();
    setSelected(index);
    setReleased(null);
    move(index, positions[index] + (event.key === "ArrowLeft" ? -4 : 4));
  }

  const product = products[selected];

  return (
    <div className="rack">
      <div className="rack-head">
        <span><Hand size={16} /> Drag the hoodies along the rail</span>
        <button onClick={() => { setPositions(homePositions); setReleased(null); }} disabled={positions.every((position, index) => position === homePositions[index])}>Reset rail</button>
      </div>
      <p className="sr-only" id="rack-instructions">Use the left and right arrow keys to slide a hoodie. Press Enter to inspect it.</p>
      <div ref={rail} className="rack-stage" data-entered={entered} aria-label="Clothes rail">
        <div className="rack-bar" aria-hidden="true" />
        {products.map((item, index) => (
          <button className="hanging-piece" key={item.name} type="button" aria-label={`Select ${item.name} hoodie`} aria-pressed={selected === index} aria-describedby="rack-instructions"
            style={{ "--position": `${positions[index]}%`, "--tilt": `${index === dragging || index === released ? tilt : 0}deg`, "--delay": `${index * 95}ms` }}
            data-dragging={dragging === index} data-released={released === index}
            onPointerDown={event => start(event, index)} onPointerMove={slide} onPointerUp={finish} onPointerCancel={finish} onLostPointerCapture={finish}
            onKeyDown={event => useKeys(event, index)} onClick={event => { if (event.detail === 0 || !ignoreClick.current) { setSelected(index); onInspect(index); } }}>
            {entered && <img src={garmentImage(index)} alt="" loading="lazy" decoding="async" width="520" height="606" draggable={false} />}
          </button>
        ))}
      </div>
      <div className="rack-detail">
        <div>
          <span className="rack-color" style={{ "--swatch": product.color }} />
          <div><h3>{product.name}</h3><p>{product.description} · 480 GSM</p></div>
        </div>
        <div><strong>${product.price}</strong><button className="primary" onClick={() => onInspect(selected)}><Focus size={16} /> Inspect hoodie</button></div>
      </div>
    </div>
  );
}
