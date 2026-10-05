"use client";
import { useEffect, useRef } from "react";

/**
 * Renders `parts` (an array of strings and {grad: true, text} / {br: true} markers)
 * as one <h1>, then animates every visible character dropping in on mount.
 * Kept deliberately simple: split into <span class="split-char"> nodes with an
 * inline transition, staggered with setTimeout, matching the original effect.
 */
export default function SplitTitle({ parts }) {
  const h1Ref = useRef(null);

  useEffect(() => {
    const h1 = h1Ref.current;
    if (!h1) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const chars = h1.querySelectorAll(".split-char");
    if (reduce) {
      chars.forEach((ch) => {
        ch.style.opacity = 1;
        ch.style.transform = "none";
      });
      return;
    }
    chars.forEach((ch, i) => {
      ch.style.opacity = 0;
      ch.style.transform = "translateY(.5em) rotate(5deg)";
      setTimeout(() => {
        ch.style.transition = "opacity .5s ease, transform .5s ease";
        ch.style.opacity = 1;
        ch.style.transform = "none";
      }, 300 + i * 16);
    });
  }, []);

  function renderText(text, keyPrefix) {
    return text.split("").map((ch, i) => (
      <span className="split-char" key={`${keyPrefix}-${i}`}>
        {ch === " " ? "\u00A0" : ch}
      </span>
    ));
  }

  return (
    <h1 ref={h1Ref}>
      {parts.map((part, i) => {
        if (part.br) return <br key={`br-${i}`} />;
        if (part.grad)
          return (
            <span className="grad" key={`grad-${i}`}>
              {renderText(part.text, `grad-${i}`)}
            </span>
          );
        return <span key={`plain-${i}`}>{renderText(part.text, `plain-${i}`)}</span>;
      })}
    </h1>
  );
}
