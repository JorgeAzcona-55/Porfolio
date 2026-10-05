"use client";

import { useEffect, useRef, useState } from "react";

// EDITA AQUÍ: añade, quita o reordena hitos. "side" alterna la tarjeta
// arriba/abajo de la línea; no hace falta tocar nada más, el ancho del
// scroll horizontal se recalcula solo según cuántos hitos haya.
const items = [
  {
    date: "09/2023 — 06/2025",
    title: "Grado Medio · Sistemas Microinformáticos y Redes",
    text: "Formación en el Colegio Montessori: montaje y mantenimiento de equipos, redes, y primeros contactos con la programación.",
    side: "top",
  },
  {
    date: "03/2025 — 06/2025",
    title: "Starglob · Técnico de soporte",
    text: "Atención y resolución de incidencias técnicas a usuarios.",
    side: "bottom",
  },
  {
    date: "09/2025 — ACTUALIDAD",
    title: "Grado Superior · Desarrollo de Aplicaciones Multiplataforma",
    text: "Formación en Salesianos: programación, bases de datos, desarrollo web y aplicaciones multiplataforma.",
    side: "top",
  },
  {
    date: "02/2026 — 03/2026",
    title: "Tull Arquitectura · Desarrollador Web",
    text: "Diseño y desarrollo de una web para un estudio de arquitectura, trabajando proyectos, galerías y formulario de contacto.",
    side: "bottom",
  },
];

export default function JourneyTimeline() {
  const sectionRef = useRef(null);
  const trackRef = useRef(null);
  const [maxScroll, setMaxScroll] = useState(0);
  const [progress, setProgress] = useState(0);
  const [active, setActive] = useState(0);
  const [reduced, setReduced] = useState(false);

  // How far (in px) the track needs to travel horizontally so every card
  // is reachable. Measured from the real rendered width, so this keeps
  // working correctly no matter how many items end up in the list above.
  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const read = () => setReduced(query.matches);
    read();
    query.addEventListener("change", read);

    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      setMaxScroll(Math.max(0, track.scrollWidth - window.innerWidth));
    };
    measure();
    window.addEventListener("resize", measure);
    return () => {
      query.removeEventListener("change", read);
      window.removeEventListener("resize", measure);
    };
  }, []);

  useEffect(() => {
    const update = () => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const distance = section.offsetHeight - window.innerHeight;
      const current = distance > 0 ? Math.min(1, Math.max(0, -rect.top / distance)) : 0;
      setProgress(current);
      setActive(Math.min(items.length - 1, Math.floor(current * items.length * 1.15)));
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, [maxScroll]);

  // The section is exactly "one screen + however far we need to travel"
  // tall, so scrolling through it maps 1:1 to the horizontal movement —
  // no guessed multipliers, so it can't run out of room with more items.
  const sectionStyle = { height: `calc(100vh + ${maxScroll}px)` };
  const translate = reduced ? 0 : -progress * maxScroll;

  return (
    <section className="journey" id="trayectoria" ref={sectionRef} style={sectionStyle}>
      <div className="journey-sticky">
        <div
          className="journey-track"
          ref={trackRef}
          style={{ transform: `translateX(${translate}px)` }}
        >
          <div className="journey-intro">
            <p className="eyebrow">TRAYECTORIA</p>
            <h2>
              Experiencia y <span>formación.</span>
            </h2>
            <p className="journey-period">2023 — 2026</p>
          </div>

          <div className="journey-events">
            <div className="journey-line-wrap">
              <span className="journey-dot first" />
              <span className="journey-line" style={{ width: `${Math.max(8, progress * 100)}%` }} />
              <span className="journey-dot last" />
            </div>

            {items.map((item, index) => (
              <article
                className={`journey-event ${item.side} ${index <= active ? "is-active" : ""}`}
                key={item.title}
              >
                <div className="journey-event-stem">
                  <span className="journey-event-dot" />
                  <span />
                </div>
                <div className="journey-card">
                  <time>{item.date}</time>
                  <h3>{item.title}</h3>
                  <p>{item.text}</p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
