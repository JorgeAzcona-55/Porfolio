 "use client";
import { useEffect, useRef } from "react";

export default function Reveal({ children, className = "", delay = 0 }) {
  const ref = useRef(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      element.classList.add("visible");
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setTimeout(() => element.classList.add("visible"), delay);
        observer.disconnect();
      }
    }, { threshold: .16 });
    observer.observe(element);
    return () => observer.disconnect();
  }, [delay]);

  return <div ref={ref} className={"reveal " + className}>{children}</div>;
}