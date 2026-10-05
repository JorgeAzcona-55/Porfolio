import "./globals.css";
import Header from "@/components/Header";
import Cursor from "@/components/Cursor";
import Progress from "@/components/Progress";
import Background from "@/components/Background";

export const metadata = {
  title: "Jorge Azcona Gómez | Desarrollador Web Full Stack",
  description: "Portfolio de Jorge Azcona Gómez, desarrollador web full stack: proyectos con PHP, Node.js, React y Next.js, experiencia y contacto."
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>
        <Background />
        <Cursor />
        <Progress />
        <Header />
        {children}
      </body>
    </html>
  );
}