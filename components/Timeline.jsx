"use client";
import { useEffect, useRef } from "react";
import Reveal from "./Reveal";

/**
 * items: [{ year: "02/2026 — 03/2026", title: "...", desc: "..." }]
 */
export default function Timeline({ items }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    function update() {
      const rect = el.getBoundingClientRect();
      const vh = window.innerHeight;
      const visible = Math.min(Math.max(vh * 0.6 - rect.top, 0), rect.height);
      const pct = rect.height > 0 ? (visible / rect.height) * 100 : 0;
      el.style.setProperty("--tl-p", pct + "%");
    }
    let ticking = false;
    function onScroll() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(() => {
          update();
          ticking = false;
        });
      }
    }
    document.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);
    update();
    return () => {
      document.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, []);

  return (
    <div className="timeline" ref={ref}>
      {items.map((item, i) => (
        <Reveal as="div" key={i} className="tl-item">
          <div className="tl-year">{item.year}</div>
          <h4>{item.title}</h4>
          <p>{item.desc}</p>
        </Reveal>
      ))}
    </div>
  );
}
