"use client";
import { useEffect, useRef } from "react";

export default function Particles() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    let w, h, dots, raf;

    function resize() {
      w = canvas.width = window.innerWidth;
      h = canvas.height = window.innerHeight;
      const count = Math.min(50, Math.floor((w * h) / 40000));
      dots = [];
      for (let i = 0; i < count; i++) {
        dots.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.15,
          vy: (Math.random() - 0.5) * 0.15,
        });
      }
    }

    function step() {
      ctx.clearRect(0, 0, w, h);
      dots.forEach((d) => {
        d.x += d.vx;
        d.y += d.vy;
        if (d.x < 0 || d.x > w) d.vx *= -1;
        if (d.y < 0 || d.y > h) d.vy *= -1;
      });
      ctx.fillStyle = "rgba(127,168,217,.4)";
      for (let a = 0; a < dots.length; a++) {
        ctx.beginPath();
        ctx.arc(dots[a].x, dots[a].y, 1.3, 0, 7);
        ctx.fill();
        for (let b = a + 1; b < dots.length; b++) {
          const dx = dots[a].x - dots[b].x;
          const dy = dots[a].y - dots[b].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.strokeStyle = `rgba(127,168,217,${0.1 * (1 - dist / 120)})`;
            ctx.beginPath();
            ctx.moveTo(dots[a].x, dots[a].y);
            ctx.lineTo(dots[b].x, dots[b].y);
            ctx.stroke();
          }
        }
      }
      raf = requestAnimationFrame(step);
    }

    resize();
    window.addEventListener("resize", resize);
    raf = requestAnimationFrame(step);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return <canvas id="fx" ref={canvasRef} aria-hidden="true"></canvas>;
}
