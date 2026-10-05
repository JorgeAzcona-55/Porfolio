"use client";
import { useEffect, useRef } from "react";

// Cursor: punto exacto + anillo con inercia.
// - El punto sigue al ratón sin retraso (precisión).
// - El anillo lo persigue con suavizado y reacciona al contexto:
//     · sobre [data-cursor] se expande y muestra una etiqueta ("VER", "IR"...)
//     · sobre enlaces/botones normales crece un poco
//     · al hacer clic se contrae
//     · sobre [data-cursor-quiet] el anillo se oculta y queda solo el punto,
//       para no tapar animaciones (p. ej. las redes sociales)
//     · sobre campos de texto desaparece y deja el cursor nativo (I-beam)
// El cursor nativo solo se oculta cuando este componente está activo
// (clase "has-custom-cursor" en <html>), así nunca te quedas sin cursor.
export default function Cursor() {
  const dotRef = useRef(null);
  const ringRef = useRef(null);
  const labelRef = useRef(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer:fine)").matches) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const dot = dotRef.current;
    const ring = ringRef.current;
    const label = labelRef.current;
    const root = document.documentElement;

    const pos = { x: -100, y: -100 };
    const ringPos = { x: -100, y: -100 };
    let seen = false;
    let raf;

    const setState = (cls, on) => ring.classList.toggle(cls, on);

    const onMove = (e) => {
      pos.x = e.clientX;
      pos.y = e.clientY;
      dot.style.transform = `translate(${pos.x}px, ${pos.y}px) translate(-50%, -50%)`;
      if (!seen) {
        seen = true;
        ringPos.x = pos.x;
        ringPos.y = pos.y;
        root.classList.add("has-custom-cursor");
        dot.classList.add("visible");
        ring.classList.add("visible");
      }
    };

    const onOver = (e) => {
      const el = e.target;
      if (!(el instanceof Element)) return;
      const text = el.closest("input, textarea, select, [contenteditable='true']");
      const tagged = el.closest("[data-cursor]");
      const interactive = el.closest("a, button, summary, [role='button']");
      const quiet = el.closest("[data-cursor-quiet]");
      setState("is-quiet", !!quiet);
      setState("is-text", !!text);
      setState("is-tagged", !!tagged && !text && !quiet);
      setState("is-link", !!interactive && !tagged && !text && !quiet);
      dot.classList.toggle("is-hidden", (!!tagged && !quiet) || !!text);
      dot.classList.toggle("is-quiet", !!quiet);
      label.textContent = tagged && !text && !quiet ? tagged.dataset.cursor || "" : "";
    };

    const onDown = () => setState("is-down", true);
    const onUp = () => setState("is-down", false);
    const onLeave = () => { dot.classList.remove("visible"); ring.classList.remove("visible"); };
    const onEnter = () => { if (seen) { dot.classList.add("visible"); ring.classList.add("visible"); } };

    const tick = () => {
      const k = reduce ? 1 : 0.18;
      ringPos.x += (pos.x - ringPos.x) * k;
      ringPos.y += (pos.y - ringPos.y) * k;
      ring.style.transform = `translate(${ringPos.x}px, ${ringPos.y}px) translate(-50%, -50%)`;
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    window.addEventListener("mousemove", onMove);
    document.addEventListener("mouseover", onOver);
    window.addEventListener("mousedown", onDown);
    window.addEventListener("mouseup", onUp);
    document.documentElement.addEventListener("mouseleave", onLeave);
    document.documentElement.addEventListener("mouseenter", onEnter);

    return () => {
      cancelAnimationFrame(raf);
      root.classList.remove("has-custom-cursor");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      window.removeEventListener("mousedown", onDown);
      window.removeEventListener("mouseup", onUp);
      document.documentElement.removeEventListener("mouseleave", onLeave);
      document.documentElement.removeEventListener("mouseenter", onEnter);
    };
  }, []);

  // Magnetic pull: any .button or .works-wheel-index button nudges toward
  // the cursor while hovered, and springs back on leave. Delegated in one
  // place so every current and future button gets it for free.
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce || !window.matchMedia("(pointer:fine)").matches) return;

    const selector = ".button, .email, .works-wheel-index button";
    let current = null;

    const onMove = (e) => {
      const target = e.target.closest(selector);
      if (!target) return;
      if (current && current !== target) current.style.transform = "";
      current = target;
      const r = target.getBoundingClientRect();
      const x = (e.clientX - (r.left + r.width / 2)) * 0.25;
      const y = (e.clientY - (r.top + r.height / 2)) * 0.25;
      target.style.transform = `translate(${x}px, ${y}px)`;
    };
    const onLeave = (e) => {
      const target = e.target.closest(selector);
      if (target) target.style.transform = "";
    };

    document.addEventListener("mousemove", onMove);
    document.addEventListener("mouseout", onLeave);
    return () => {
      document.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseout", onLeave);
    };
  }, []);

  return (
    <>
      <div ref={ringRef} className="cursor-ring" aria-hidden="true">
        <span ref={labelRef} className="cursor-label" />
      </div>
      <div ref={dotRef} className="cursor-dot" aria-hidden="true" />
    </>
  );
}
