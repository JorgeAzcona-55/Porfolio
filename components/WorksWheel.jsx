"use client";
import * as React from "react";

const clamp = (v, lo, hi) => Math.min(hi, Math.max(lo, v));
const lerp = (a, b, t) => a + (b - a) * t;
const rad = (deg) => (deg * Math.PI) / 180;

const CARD_H = 0.38;
const CARD_MAX_W = 0.34;
const CARD_RATIO = 1.45;
const STEP = 40;
const DRUM = 2.22;
const LENS = 2.7;
const RING_R = 1.14;
const BOW = 1.82;
const TITLE = 0.124;
const INDEX = 0.04;
const CULL = 1.6;
const WHEEL_UNITS = 900;
const DRAG_UNITS = 420;
const SETTLE = 140;
const EASE = 0.12;

const bowAt = (drumDeg, bow) => -bow * (1 - Math.cos(rad(drumDeg)));

function place(ringDeg, drumDeg, ringR, drumR, bow, m) {
  return (
    `translateX(${m * bowAt(drumDeg, bow)}px)` +
    ` rotateZ(${(1 - m) * ringDeg}deg) translateY(${-(1 - m) * ringR}px)` +
    ` rotateX(${m * drumDeg}deg) translateZ(${m * drumR}px)`
  );
}

export default function WorksWheel({ items, label = "Mis proyectos", action = "Abrir", cardMaxW = CARD_MAX_W, onActiveChange }) {
  const stageRef = React.useRef(null);
  const wheelRef = React.useRef(null);
  const cardRefs = React.useRef([]);
  const labelRef = React.useRef(null);
  const titleRef = React.useRef(null);
  const turn = React.useRef(0);
  const target = React.useRef(0);
  const settling = React.useRef(0);
  const drag = React.useRef(null);
  const [active, setActive] = React.useState(0);
  const [stage, setStage] = React.useState({ w: 0, h: 0 });
  const [reduced, setReduced] = React.useState(false);
  const count = items.length;
  const last = Math.max(count - 1, 0);

  React.useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduced(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);

  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const read = () => setStage({ w: el.clientWidth, h: el.clientHeight });
    read();
    const ro = new ResizeObserver(read);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const metrics = React.useMemo(() => {
    const { w, h } = stage;
    const cardW = Math.min(h * CARD_H * CARD_RATIO, w * cardMaxW);
    const cardH = cardW / CARD_RATIO;
    const drumR = cardH * DRUM;
    const ringR = cardH * RING_R;
    const ringScale = count ? clamp((((2 * Math.PI * ringR) / count) * 0.82) / (cardW || 1), 0.16, 1) : 1;
    return { cardW, cardH, ringR, ringScale, drumR, bow: cardH * BOW, depth: cardH * LENS, title: cardH * TITLE, index: cardH * INDEX };
  }, [stage, count, cardMaxW]);

  // El título activo vive en el hueco a la izquierda de la tarjeta, para no
  // taparla: se ajusta su ancho y tamaño a ese hueco y se parte en líneas.
  const gutter = Math.max((stage.w - metrics.cardW) / 2, 0);
  const gutterX = gutter * 0.08;
  const gutterW = Math.max(gutter * 0.84, 60);

  React.useEffect(() => {
    if (!stage.h) return;
    let frame = 0;
    const { ringR, ringScale, drumR, bow } = metrics;
    const draw = () => {
      frame = requestAnimationFrame(draw);
      const gap = target.current - turn.current;
      if (Math.abs(gap) < 0.0005) turn.current = target.current;
      else turn.current += gap * (reduced ? 1 : EASE);
      const t = turn.current;
      const m = clamp(t, 0, 1);
      const pos = Math.max(0, t - 1);
      if (wheelRef.current) wheelRef.current.style.transform = `translateZ(${-m * drumR}px)`;
      for (let i = 0; i < count; i++) {
        const d = i - pos;
        const card = cardRefs.current[i];
        if (!card) continue;
        card.style.transform = place(d * (360 / count), d * STEP, ringR, drumR, bow, m);
        card.style.opacity = m > 0.5 && Math.abs(d) > CULL ? "0" : "1";
        card.style.zIndex = String(Math.round(100 - Math.abs(d) * 2));
        const face = card.firstElementChild;
        if (face) face.style.transform = `scale(${lerp(ringScale, 1, m)})`;
      }
      if (labelRef.current) labelRef.current.style.opacity = String(1 - m);
      if (titleRef.current) titleRef.current.style.opacity = String(m);
      const near = clamp(Math.round(pos), 0, last);
      setActive((prev) => (prev === near ? prev : near));
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [metrics, stage.h, count, last, reduced]);

  React.useEffect(() => {
    if (onActiveChange) onActiveChange(active);
  }, [active, onActiveChange]);

  const to = React.useCallback((next) => {
    target.current = clamp(next, 0, last + 1);
  }, [last]);

  React.useEffect(() => {
    const el = stageRef.current;
    if (!el) return;
    const onWheel = (event) => {
      const next = target.current + event.deltaY / WHEEL_UNITS;
      if (next > 0 && next < last + 1) event.preventDefault();
      to(next);
      window.clearTimeout(settling.current);
      settling.current = window.setTimeout(() => to(Math.round(target.current)), SETTLE);
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => {
      el.removeEventListener("wheel", onWheel);
      window.clearTimeout(settling.current);
    };
  }, [to, last]);

  return (
    <div className="works-wheel" ref={stageRef} tabIndex={0} role="listbox" aria-label={label}
      style={{ perspective: `${metrics.depth}px` }}
      onPointerDown={(event) => {
        // En táctil el gesto es horizontal (deslizar) para no bloquear el scroll
        // vertical de la página; con ratón se arrastra en vertical.
        const touch = event.pointerType === "touch";
        const at = touch ? event.clientX : event.clientY;
        drag.current = { touch, start: at, last: at, moved: false, id: event.pointerId };
      }}
      onPointerMove={(event) => {
        if (!drag.current) return;
        const at = drag.current.touch ? event.clientX : event.clientY;
        if (!drag.current.moved) {
          // Ignore tiny jitters: a plain click/tap must never trigger the
          // wheel's drag mode, or it would swallow the click meant for the
          // project link underneath.
          if (Math.abs(at - drag.current.start) < 4) return;
          drag.current.moved = true;
          event.currentTarget.setPointerCapture(drag.current.id);
        }
        to(target.current + (drag.current.last - at) / DRAG_UNITS);
        drag.current.last = at;
      }}
      onPointerUp={() => {
        if (drag.current?.moved && target.current > 1) to(Math.round(target.current));
        drag.current = null;
      }}
      onPointerCancel={() => { drag.current = null; }}
      onKeyDown={(event) => {
        if (event.key === "ArrowDown" || event.key === "ArrowRight") to(Math.round(target.current) + 1);
        else if (event.key === "ArrowUp" || event.key === "ArrowLeft") to(Math.round(target.current) - 1);
        else return;
        event.preventDefault();
      }}
    >
      <div ref={wheelRef} className="works-wheel-stage">
        {items.map((item, i) => (
          <a key={item.title} id={`works-wheel-${i}`} role="option" aria-selected={i === active}
            href={item.href} target="_blank" rel="noreferrer" ref={(node) => { cardRefs.current[i] = node; }}
            className="works-wheel-card" style={{ width: metrics.cardW, height: metrics.cardH, marginLeft: -metrics.cardW / 2, marginTop: -metrics.cardH / 2 }}>
            <span className="works-wheel-face">
              <img src={item.image} alt={item.title} draggable={false} />
              <span className="works-wheel-overlay" />
              <span className="works-wheel-project">PROJECT / {String(i + 1).padStart(2, "0")}</span>
              <span className="works-wheel-open">↗ {action}</span>
            </span>
          </a>
        ))}
      </div>
      <div ref={labelRef} className="works-wheel-label" style={{ fontSize: metrics.title }}>{label}</div>
      <div ref={titleRef} className="works-wheel-active-title" style={{ fontSize: Math.min(metrics.title, gutterW / 6.8), "--title-w": `${gutterW}px`, "--title-x": `${gutterX}px` }}>{items[active]?.title}</div>
      <ol className="works-wheel-index" style={{ fontSize: metrics.index }}>
        {items.map((item, i) => <li key={item.title}><button type="button" onClick={() => to(i)} className={i === active ? "active" : ""}>{String(i + 1).padStart(2, "0")} · {item.title}</button></li>)}
      </ol>
    </div>
  );
}
