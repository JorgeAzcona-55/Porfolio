"use client";
import { useEffect, useRef, useState } from "react";

const GROW_END = 0.72;
const POP_AT = 0.76;
const EXTRA_SCROLL_VH = 115;
const BUBBLE_BASE = 88;
const PARTICLES = 18;

export default function ContactBubble({ children }) {
  const sectionRef = useRef(null);
  const poppedRef = useRef(false);
  const [scale, setScale] = useState(1);
  const [popping, setPopping] = useState(false);
  const [popped, setPopped] = useState(false);
  const [reduced, setReduced] = useState(false);

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduced(query.matches);
    read();
    query.addEventListener("change", read);
    return () => query.removeEventListener("change", read);
  }, []);

  useEffect(() => {
    if (reduced) {
      poppedRef.current = true;
      setPopped(true);
      return;
    }

    let ticking = false;

    const update = () => {
      ticking = false;
      if (poppedRef.current) return;

      const section = sectionRef.current;
      if (!section) return;

      const rect = section.getBoundingClientRect();
      const distance = Math.max(1, section.offsetHeight - window.innerHeight);
      const progress = Math.min(1, Math.max(0, -rect.top / distance));

      if (progress >= POP_AT) {
        poppedRef.current = true;
        setScale((Math.max(window.innerWidth, window.innerHeight) * 1.55) / BUBBLE_BASE);
        setPopping(true);
        window.setTimeout(() => setPopped(true), 620);
        return;
      }

      const growProgress = Math.min(1, progress / GROW_END);
      const eased = 1 - Math.pow(1 - growProgress, 3);
      const maxScale = (Math.max(window.innerWidth, window.innerHeight) * 1.55) / BUBBLE_BASE;
      setScale(1 + eased * (maxScale - 1));
    };

    const onScroll = () => {
      if (!ticking) {
        ticking = true;
        window.requestAnimationFrame(update);
      }
    };

    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", update);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, [reduced]);

  const particles = Array.from({ length: PARTICLES });

  return (
    <section
      className="contact"
      id="contacto"
      ref={sectionRef}
      style={reduced ? undefined : { height: `calc(100vh + ${EXTRA_SCROLL_VH}vh)` }}
    >
      <div className="contact-sticky">
        <div className="contact-orb" />

        {!popped && !reduced && (
          <div
            className={`bubble-stage${popping ? " is-popping" : ""}`}
            style={{ transform: `translate(-50%, -50%) scale(${scale})` }}
          >
            <div className="bubble-aura" />
            <div className="bubble">
              <span className="bubble-highlight" />
              <span className="bubble-inner-glow" />
            </div>

            {popping && (
              <div className="bubble-burst" aria-hidden="true">
                {particles.map((_, i) => (
                  <span
                    key={i}
                    className="burst-particle"
                    style={{ "--burst-angle": `${i * (360 / PARTICLES)}deg` }}
                  />
                ))}
              </div>
            )}
          </div>
        )}

        <div className={`contact-inner${popped ? " is-visible" : ""}`}>
          <div className="contact-reveal">
            {children}
          </div>
        </div>
      </div>
    </section>
  );
}
