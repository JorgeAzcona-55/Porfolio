"use client";
import Reveal from "@/components/Reveal";

// Agrupadas por área (sin porcentajes): cada grupo entra al hacer scroll y sus
// etiquetas aparecen una a una, de izquierda a derecha.
const GROUPS = [
  { title: "Frontend", items: ["HTML", "CSS", "JavaScript", "React", "Next.js", "Tailwind CSS"] },
  { title: "Backend", items: ["PHP", "Node.js", "Desarrollo de APIs"] },
  { title: "Bases de datos", items: ["MySQL", "Supabase"] },
  { title: "Herramientas", items: ["GitHub", "Docker"] },
];

export default function Skills() {
  return (
    <div className="skill-groups">
      {GROUPS.map((group, g) => (
        <Reveal key={group.title} delay={g * 110}>
          <div className="skill-group">
            <h3>{group.title}</h3>
            <ul>
              {group.items.map((item, i) => (
                <li className="skill-chip" key={item} style={{ "--i": i }}>{item}</li>
              ))}
            </ul>
          </div>
        </Reveal>
      ))}
    </div>
  );
}
