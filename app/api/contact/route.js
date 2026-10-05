import { NextResponse } from "next/server";

export const runtime = "nodejs";

// Variables de entorno (ver .env.example):
//   RESEND_API_KEY      clave de https://resend.com
//   CONTACT_TO_EMAIL    correo donde recibes los mensajes
//   CONTACT_FROM_EMAIL  (opcional) remitente; por defecto el de pruebas de Resend

const TOPICS = ["Oferta de trabajo", "Prácticas", "Proyecto freelance", "Otro motivo"];
const LIMITS = { name: 80, email: 120, message: 2000 };
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

// Límite simple por IP: 3 mensajes cada 10 minutos. Vive en memoria, así que
// en hosting serverless es una protección "de mejor esfuerzo", no absoluta.
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 3;
const hits = new Map();

function rateLimited(ip) {
  const now = Date.now();
  const recent = (hits.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  if (recent.length >= MAX_HITS) {
    hits.set(ip, recent);
    return true;
  }
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 500) {
    for (const [key, list] of hits) if (!list.some((t) => now - t < WINDOW_MS)) hits.delete(key);
  }
  return false;
}

// Una línea, sin saltos ni caracteres de control (evita inyección en cabeceras).
const oneLine = (value) => String(value ?? "").replace(/[\u0000-\u001f\u007f]+/g, " ").trim();
const multiLine = (value) =>
  String(value ?? "").replace(/\r\n/g, "\n").replace(/[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/g, "").trim();
const escapeHtml = (value) =>
  value.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  // Campo trampa: si viene relleno es un bot. Respondemos "ok" sin enviar nada.
  if (body && body.website) return NextResponse.json({ ok: true });

  const name = oneLine(body?.name);
  const email = oneLine(body?.email);
  const topic = oneLine(body?.topic);
  const message = multiLine(body?.message);

  const errors = {};
  if (name.length < 2 || name.length > LIMITS.name) errors.name = "Escribe tu nombre (entre 2 y 80 caracteres).";
  if (!EMAIL_RE.test(email) || email.length > LIMITS.email) errors.email = "Introduce un correo válido.";
  if (!TOPICS.includes(topic)) errors.topic = "Selecciona el motivo del mensaje.";
  if (message.length < 10 || message.length > LIMITS.message) errors.message = "El mensaje debe tener entre 10 y 2000 caracteres.";
  if (Object.keys(errors).length) return NextResponse.json({ errors }, { status: 422 });

  const ip = (request.headers.get("x-forwarded-for") || "").split(",")[0].trim() || "unknown";
  if (rateLimited(ip)) return NextResponse.json({ error: "rate_limited" }, { status: 429 });

  const apiKey = process.env.RESEND_API_KEY;
  const to = process.env.CONTACT_TO_EMAIL;
  const from = process.env.CONTACT_FROM_EMAIL || "Portfolio <onboarding@resend.dev>";
  if (!apiKey || !to) {
    console.error("[contact] Faltan RESEND_API_KEY o CONTACT_TO_EMAIL en las variables de entorno.");
    return NextResponse.json({ error: "not_configured" }, { status: 503 });
  }

  const text = `Nuevo mensaje desde el portfolio\n\nNombre: ${name}\nCorreo: ${email}\nMotivo: ${topic}\n\n${message}`;
  const html = `
    <div style="font-family:system-ui,Arial,sans-serif;max-width:560px;color:#14161b">
      <h2 style="margin:0 0 16px">Nuevo mensaje desde el portfolio</h2>
      <p style="margin:0 0 4px"><strong>Nombre:</strong> ${escapeHtml(name)}</p>
      <p style="margin:0 0 4px"><strong>Correo:</strong> ${escapeHtml(email)}</p>
      <p style="margin:0 0 16px"><strong>Motivo:</strong> ${escapeHtml(topic)}</p>
      <div style="white-space:pre-wrap;border-left:3px solid #E8A33D;padding:4px 0 4px 14px">${escapeHtml(message)}</div>
      <p style="margin:20px 0 0;color:#6b7080;font-size:13px">Puedes responder directamente a este correo.</p>
    </div>`;

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from,
        to: [to],
        reply_to: email,
        subject: `[Portfolio] ${topic} — ${name}`,
        text,
        html,
      }),
    });
    if (!res.ok) {
      console.error("[contact] Resend respondió", res.status, await res.text().catch(() => ""));
      return NextResponse.json({ error: "send_failed" }, { status: 502 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[contact] Error al contactar con Resend:", err);
    return NextResponse.json({ error: "send_failed" }, { status: 502 });
  }
}
