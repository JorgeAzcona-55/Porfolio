"use client";
import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";

export default function ProgressBar() {
  const barRef = useRef(null);
  const pathname = usePathname();

  useEffect(() => {
    const bar = barRef.current;
    function update() {
      const h = document.documentElement;
      const pct = (h.scrollTop / (h.scrollHeight - h.clientHeight || 1)) * 100;
      bar.style.width = pct + "%";
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
    // Reset and recompute whenever the route changes.
    bar.style.width = "0%";
    update();
    return () => {
      document.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", update);
    };
  }, [pathname]);

  return <div id="progress" ref={barRef}></div>;
}
