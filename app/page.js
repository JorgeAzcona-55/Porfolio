 "use client";
import { useEffect, useState } from "react";
import Reveal from "@/components/Reveal";
import Skills from "@/components/Skills";
import ProjectsShowcase from "@/components/ProjectsShowcase";
import ContactForm from "@/components/ContactForm";
import SocialLinks from "@/components/SocialLinks";
import JourneyTimeline from "@/components/JourneyTimeline";

// Ruta del CV descargable. Guarda el PDF en public/cv/ con este nombre
// (o cambia aquí la ruta si usas otro).
const CV_PATH = "/cv/Jorge-Azcona-Gomez-CV.pdf";
const CV_FILENAME = "Jorge-Azcona-Gomez-CV.pdf";
const EMAIL = "Azconaj705@gmail.com";

const projects = [
  {
    title: "Tull Arquitectura",
    kind: "Proyecto para cliente · En producción",
    text: "Web corporativa para un estudio de arquitectura real. Reúne sus obras en galerías de imágenes y permite a los visitantes contactar con el estudio directamente desde la propia web.",
    points: [
      "Gestión de proyectos y galerías de imágenes",
      "Formulario de contacto para nuevos clientes",
      "Diseño y desarrollo de la web completa",
    ],
    tech: ["PHP", "MySQL"],
    link: "https://tullarquitectura.com/",
    linkLabel: "Visitar la web",
    image: "/proyectos/tull-arquitectura.png",
  },
  {
    title: "GameHub",
    kind: "Proyecto propio · Código en GitHub",
    text: "Red social para jugadores donde se comparte contenido sobre videojuegos. Cada usuario tiene su perfil, puede seguir a otros y interactuar con sus publicaciones.",
    points: [
      "Publicaciones, comentarios y favoritos",
      "Perfiles de usuario y sistema de seguidores",
      "Backend y base de datos con Supabase",
    ],
    tech: ["Next.js", "Supabase", "Tailwind CSS"],
    link: "https://github.com/JorgeAzcona-55/GameHub",
    linkLabel: "Ver el código",
    image: "/proyectos/gamehub.png",
  },
];

export default function Home() {
  const [mouse, setMouse] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const move = (e) => setMouse({
      x: (e.clientX / window.innerWidth - .5) * 18,
      y: (e.clientY / window.innerHeight - .5) * 18
    });
    window.addEventListener("mousemove", move);
    return () => window.removeEventListener("mousemove", move);
  }, []);

  return (
    <main>
      <section className="hero">
        <div className="hero-shape" style={{ translate: `${mouse.x}px ${mouse.y}px` }} />
        <div className="hero-grid">
          <div className="hero-copy">
            <Reveal>
              <p className="eyebrow">01 / DESARROLLO WEB</p>
            </Reveal>
            <Reveal delay={100}>
              <h1>Hola, soy <span>Jorge<br />Azcona.</span></h1>
            </Reveal>
            <Reveal delay={220}>
              <p className="hero-description">
                Desarrollador web interesado en crear interfaces cuidadas,
                aplicaciones completas y soluciones que funcionen de verdad.
              </p>
            </Reveal>
            <Reveal delay={340}>
              <div className="hero-buttons">
                <a href="#proyectos" className="button main-button" data-cursor="VER">Ver proyectos <b>↘</b></a>
                <a href="#contacto" className="button" data-cursor="IR">Contactar</a>
                <a href={CV_PATH} download={CV_FILENAME} className="button" data-cursor="CV">Descargar CV <b>↓</b></a>
              </div>
            </Reveal>
          </div>
          <Reveal className="hero-side" delay={450}>
            <div className="side-line" />
            <p>Actualmente terminando el grado superior y buscando seguir creciendo como programador.</p>
          </Reveal>
        </div>
      </section>

      <section className="section" id="sobre-mi">
        <div className="section-number">01</div>
        <div className="section-content two-columns">
          <div>
            <p className="eyebrow">SOBRE MÍ</p>
            <h2>Desarrollo web<br /><span>de principio a fin.</span></h2>
          </div>
          <div className="about-text">
            <Reveal>
              <p>Soy desarrollador web y estoy terminando el Grado Superior en Desarrollo de Aplicaciones Multiplataforma. Trabajo tanto en la interfaz como en el backend y la base de datos, y he llevado proyectos reales desde el diseño hasta su publicación, como la web de un estudio de arquitectura.</p>
            </Reveal>
            <Reveal delay={120}>
              <p>Me interesa especialmente el backend y el desarrollo con inteligencia artificial. Busco incorporarme a un equipo donde pueda aportar, aprender de compañeros con más experiencia y seguir creciendo como desarrollador.</p>
            </Reveal>
            <dl className="facts">
              <div><dt>Formación</dt><dd>Grado Superior en Desarrollo de Aplicaciones Multiplataforma (en curso)</dd></div>
              <div><dt>Experiencia</dt><dd>Desarrollo web para cliente real y soporte técnico a usuarios</dd></div>
              <div><dt>Tecnologías</dt><dd>PHP, Node.js, React, Next.js, MySQL, Docker</dd></div>
              <div><dt>Busco</dt><dd>Mi primer puesto como desarrollador, con foco en backend o full stack</dd></div>
            </dl>
          </div>
        </div>
      </section>

      <section className="section skills-section" id="habilidades">
        <div className="section-number">02</div>
        <div className="section-content">
          <p className="eyebrow">HABILIDADES</p>
          <h2>Mi stack <span>técnico.</span></h2>
          <Skills />
        </div>
      </section>

      <section className="section projects-section" id="proyectos">
        <div className="section-number">03</div>
        <div className="section-content">
          <p className="eyebrow">PROYECTOS</p>
          <div className="projects-heading">
            <h2>Cosas que he<br /><span>construido.</span></h2>
            <p>Gira la rueda para explorar mis proyectos.</p>
          </div>
          <Reveal>
            <ProjectsShowcase projects={projects} />
          </Reveal>
        </div>
      </section>

      <JourneyTimeline />

      <section className="contact" id="contacto">
        <div className="contact-sticky">
          <div className="contact-orb" />
          <div className="contact-inner contact-layout">
            <div className="contact-info">
              <p className="eyebrow">05 / CONTACTO</p>
              <h2>¿Hacemos algo<br /><span>juntos?</span></h2>
              <p>Si tienes una oferta, un proyecto o simplemente quieres hablar de desarrollo, escríbeme. Respondo personalmente a cada mensaje.</p>
              <a className="email" href={`mailto:${EMAIL}`} data-cursor="MAIL">{EMAIL} ↗</a>
              <div className="contact-extra">
                <a href={CV_PATH} download={CV_FILENAME} className="button" data-cursor="CV">Descargar CV <b>↓</b></a>
              </div>
              <SocialLinks />
            </div>
            <div className="contact-form-wrap">
              <ContactForm fallbackEmail={EMAIL} />
            </div>
          </div>
        </div>
      </section>

      <footer><span>© 2026 Jorge Azcona Gómez</span><a href="#top" onClick={(e) => { e.preventDefault(); window.scrollTo({ top: 0, behavior: "smooth" }); }}>↑ Arriba</a></footer>
    </main>
  );
}