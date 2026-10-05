"use client";
import { useEffect, useRef, useState } from "react";

const LINKS = [
  { href: "#sobre-mi", label: "Sobre mí" },
  { href: "#habilidades", label: "Habilidades" },
  { href: "#proyectos", label: "Proyectos" },
  { href: "#trayectoria", label: "Trayectoria" },
  { href: "#contacto", label: "Contacto" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [active, setActive] = useState(LINKS[0].href);
  const navRef = useRef(null);
  const linkRefs = useRef([]);
  const [pill, setPill] = useState({ left: 0, width: 0, opacity: 0 });

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 40);
    window.addEventListener("scroll", update, { passive: true });
    update();
    return () => window.removeEventListener("scroll", update);
  }, []);

  // Scrollspy: whichever section covers the middle of the screen wins.
  useEffect(() => {
    const sections = LINKS.map((l) => document.getElementById(l.href.slice(1))).filter(Boolean);
    if (!sections.length || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive("#" + entry.target.id);
        });
      },
      { rootMargin: "-45% 0px -45% 0px" }
    );
    sections.forEach((s) => io.observe(s));
    return () => io.disconnect();
  }, []);

  // Slide the pill under the active link, measured from real layout so it
  // never drifts out of sync with the text.
  useEffect(() => {
    const nav = navRef.current;
    const index = LINKS.findIndex((l) => l.href === active);
    const el = linkRefs.current[index];
    if (!nav || !el) return;
    const navRect = nav.getBoundingClientRect();
    const elRect = el.getBoundingClientRect();
    setPill({ left: elRect.left - navRect.left, width: elRect.width, opacity: 1 });
  }, [active, scrolled]);

  return (
    <header className={scrolled ? "header scrolled" : "header"}>
      <div className="nav">
        <nav ref={navRef}>
          <span
            className="nav-pill"
            style={{ transform: `translateX(${pill.left}px)`, width: pill.width, opacity: pill.opacity }}
          />
          {LINKS.map((link, i) => (
            <a
              key={link.href}
              href={link.href}
              ref={(el) => (linkRefs.current[i] = el)}
              className={active === link.href ? "active" : ""}
              data-cursor="IR"
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>
    </header>
  );
}
