"use client";

export default function Footer() {
  function toTop() {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    window.scrollTo({ top: 0, behavior: reduce ? "auto" : "smooth" });
  }

  return (
    <footer>
      <div className="wrap">
        <span>© 2026 Jorge Azcona Gómez</span>
        <button onClick={toTop} aria-label="Subir arriba">
          ↑ arriba
        </button>
      </div>
    </footer>
  );
}
