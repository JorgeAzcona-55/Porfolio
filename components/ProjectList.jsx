"use client";
import { useEffect, useRef } from "react";
import Reveal from "./Reveal";

/**
 * projects: [{
 *   index: "01",
 *   title: "Tull Arquitectura" (use "\n" for a line break inside the big title),
 *   tags: "PHP · MySQL",
 *   href: "https://...",          // omit for "not published yet"
 *   img: "/proyectos/tull.jpg",   // optional real screenshot, served from /public
 *   fallback: "linear-gradient(135deg,#2a4058,#12151a)", // used when no img
 * }]
 */
export default function ProjectList({ projects }) {
  const previewRef = useRef(null);
  const previewImgRef = useRef(null);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    if (!fine) return;
    const preview = previewRef.current;
    const previewImg = previewImgRef.current;

    function onMove(e) {
      preview.style.left = e.clientX + "px";
      preview.style.top = e.clientY + "px";
    }
    document.addEventListener("mousemove", onMove);
    return () => document.removeEventListener("mousemove", onMove);
  }, []);

  function showPreview(project) {
    const preview = previewRef.current;
    const previewImg = previewImgRef.current;
    if (!preview) return;
    preview.classList.add("show");
    previewImg.style.backgroundImage = project.img
      ? `url(${project.img})`
      : project.fallback || "linear-gradient(135deg,#25344a,#12151a)";
  }

  function hidePreview() {
    previewRef.current?.classList.remove("show");
  }

  return (
    <>
      <ul className="proj-list">
        {projects.map((p) => (
          <Reveal as="li" variant="fx-up" key={p.index} className="proj-row">
            <div
              className="proj-row-inner"
              data-cursor="VER"
              onMouseEnter={() => showPreview(p)}
              onMouseLeave={hidePreview}
            >
              <span className="proj-num">{p.index}</span>
              <h3 className="proj-big-title">
                {p.title.split("\n").map((line, i, arr) => (
                  <span key={i}>
                    {line}
                    {i < arr.length - 1 && <br />}
                  </span>
                ))}
              </h3>
            </div>
            <div className="proj-meta">
              <span className="proj-tags-inline">{p.tags}</span>
              {p.href ? (
                <a
                  className="proj-view"
                  href={p.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-cursor="IR"
                >
                  Ver ↗
                </a>
              ) : (
                <span className="proj-view proj-view--soon">Aún sin publicar</span>
              )}
            </div>
          </Reveal>
        ))}
      </ul>

      <div id="preview" ref={previewRef}>
        <div id="previewImg" ref={previewImgRef}></div>
      </div>
    </>
  );
}
