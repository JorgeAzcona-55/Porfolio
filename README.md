# Portfolio de Jorge Azcona Gómez

Portfolio hecho con **Next.js 15.5.26** y React 18.

## Arrancar
```bash
npm install
npm run dev
```
Abrir http://localhost:3000

## Dónde tocar cada cosa
| Qué | Dónde |
| --- | --- |
| CV descargable | Guardar el PDF en `public/cv/Jorge-Azcona-Gomez-CV.pdf` (ruta configurable en `CV_PATH`, `app/page.js`) |
| Proyectos (texto, tecnologías, enlaces) | Array `projects` en `app/page.js` |
| Imágenes de proyectos | `public/proyectos/` (PNG) |
| Habilidades | Array `GROUPS` en `components/Skills.jsx` |
| Trayectoria | Array `items` en `components/JourneyTimeline.jsx` |
| Redes sociales | Array `LINKS` en `components/SocialLinks.jsx` |

## Formulario de contacto
El formulario envía el mensaje a `app/api/contact/route.js`, que lo valida y lo reenvía a tu correo con [Resend](https://resend.com).

1. Copia `.env.example` como `.env.local`.
2. Rellena `RESEND_API_KEY` y `CONTACT_TO_EMAIL`.
3. En Vercel/Netlify añade las mismas variables en el panel del proyecto.

Sin esas variables el formulario muestra un aviso y ofrece el correo directo como alternativa.
Necesita un hosting con servidor (Vercel, Netlify, un VPS…); no funciona en hosting puramente estático como GitHub Pages.

Protecciones incluidas: validación en cliente y servidor, campo trampa anti-spam, límite de envíos por IP y saneado del contenido.

## Incluye
- Fondo `#0E1014` y partículas animadas con Canvas.
- Movimiento del elemento del hero según el ratón.
- Animaciones de aparición al hacer scroll.
- Habilidades agrupadas por áreas con entrada progresiva.
- Cursor personalizado (punto + anillo con inercia) en escritorio.
- Barra de progreso de scroll.
- Rueda 3D de proyectos con descripción al lado.
- Trayectoria con scroll horizontal.
- Formulario de contacto con validación y envío por correo.
