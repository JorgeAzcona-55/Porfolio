"use client";
import { useCallback, useState } from "react";
import WorksWheel from "@/components/WorksWheel";

// La rueda se queda igual; al lado se muestra la explicación del proyecto
// que esté seleccionado en ese momento.
export default function ProjectsShowcase({ projects }) {
  const [active, setActive] = useState(0);
  const onActiveChange = useCallback((i) => setActive(i), []);
  const project = projects[active] ?? projects[0];
  const pad = (n) => String(n + 1).padStart(2, "0");

  return (
    <div className="showcase">
      <WorksWheel
        items={projects.map(({ title, link, image }) => ({ title, href: link, image }))}
        label="Mis proyectos"
        action="Abrir"
        cardMaxW={0.5}
        onActiveChange={onActiveChange}
      />

      <aside className="project-panel" aria-live="polite" aria-label="Detalle del proyecto">
        <div className="project-panel-body" key={project.title}>
          <p className="project-panel-count">
            {pad(active)} <span>/ {pad(projects.length - 1)}</span>
          </p>
          <h3>{project.title}</h3>
          <p className="project-panel-kind">{project.kind}</p>
          <p className="project-panel-text">{project.text}</p>

          <ul className="project-panel-points">
            {project.points.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>

          <ul className="project-panel-tech" aria-label="Tecnologías">
            {project.tech.map((t) => (
              <li key={t}>{t}</li>
            ))}
          </ul>

          <a className="button main-button" href={project.link} target="_blank" rel="noreferrer" data-cursor="IR">
            {project.linkLabel} <b>↗</b>
          </a>
        </div>
      </aside>
    </div>
  );
}
