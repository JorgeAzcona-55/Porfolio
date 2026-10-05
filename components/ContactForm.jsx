"use client";
import { useRef, useState } from "react";

const TOPICS = ["Oferta de trabajo", "Prácticas", "Proyecto freelance", "Otro motivo"];
const MAX_MESSAGE = 2000;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validate(v) {
  const errors = {};
  if (v.name.trim().length < 2) errors.name = "Escribe tu nombre (mínimo 2 caracteres).";
  if (!EMAIL_RE.test(v.email.trim())) errors.email = "Introduce un correo válido, por ejemplo nombre@empresa.com.";
  if (!TOPICS.includes(v.topic)) errors.topic = "Selecciona el motivo del mensaje.";
  if (v.message.trim().length < 10) errors.message = "Cuéntame un poco más (mínimo 10 caracteres).";
  if (v.message.length > MAX_MESSAGE) errors.message = `El mensaje no puede superar ${MAX_MESSAGE} caracteres.`;
  return errors;
}

export default function ContactForm({ fallbackEmail }) {
  const formRef = useRef(null);
  const [values, setValues] = useState({ name: "", email: "", topic: "", message: "", website: "" });
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("idle"); // idle | sending | success | error
  const [serverError, setServerError] = useState("");
  const [sentName, setSentName] = useState("");

  const set = (field) => (e) => {
    const value = e.target.value;
    setValues((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  async function onSubmit(e) {
    e.preventDefault();
    if (status === "sending") return;

    const found = validate(values);
    setErrors(found);
    const firstInvalid = ["name", "email", "topic", "message"].find((f) => found[f]);
    if (firstInvalid) {
      formRef.current?.elements[firstInvalid]?.focus();
      return;
    }

    setStatus("sending");
    setServerError("");
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
        signal: controller.signal,
      });
      const data = await res.json().catch(() => ({}));

      if (res.ok && data.ok) {
        setSentName(values.name.trim().split(" ")[0]);
        setValues({ name: "", email: "", topic: "", message: "", website: "" });
        setStatus("success");
        return;
      }
      if (res.status === 422 && data.errors) {
        setErrors(data.errors);
        setStatus("idle");
        return;
      }
      if (res.status === 429) {
        setServerError("Has enviado varios mensajes seguidos. Espera unos minutos e inténtalo de nuevo.");
      } else if (res.status === 503) {
        setServerError("El formulario no está disponible ahora mismo.");
      } else {
        setServerError("No se pudo enviar el mensaje.");
      }
      setStatus("error");
    } catch {
      setServerError("No hay conexión con el servidor.");
      setStatus("error");
    } finally {
      clearTimeout(timeout);
    }
  }

  if (status === "success") {
    return (
      <div className="form-success" role="status">
        <span className="form-success-icon" aria-hidden="true">✓</span>
        <h3>Mensaje enviado{sentName ? `, gracias ${sentName}` : ""}.</h3>
        <p>Lo he recibido correctamente y te responderé al correo que has indicado lo antes posible.</p>
        <button type="button" className="button" onClick={() => setStatus("idle")} data-cursor="NUEVO">
          Enviar otro mensaje
        </button>
      </div>
    );
  }

  const sending = status === "sending";
  const field = (name) => ({
    id: `contact-${name}`,
    name,
    value: values[name],
    onChange: set(name),
    disabled: sending,
    "aria-invalid": errors[name] ? "true" : undefined,
    "aria-describedby": errors[name] ? `contact-${name}-error` : undefined,
  });
  const fieldError = (name) =>
    errors[name] ? (
      <p className="field-error" id={`contact-${name}-error`}>{errors[name]}</p>
    ) : null;

  return (
    <form className="contact-form" ref={formRef} onSubmit={onSubmit} noValidate>
      <div className="form-row">
        <div className="form-field">
          <label htmlFor="contact-name">Nombre</label>
          <input {...field("name")} type="text" autoComplete="name" maxLength={80} placeholder="Tu nombre" required />
          {fieldError("name")}
        </div>
        <div className="form-field">
          <label htmlFor="contact-email">Correo electrónico</label>
          <input {...field("email")} type="email" autoComplete="email" maxLength={120} placeholder="nombre@empresa.com" required />
          {fieldError("email")}
        </div>
      </div>

      <div className="form-field">
        <label htmlFor="contact-topic">Motivo</label>
        <select {...field("topic")} required>
          <option value="" disabled>Selecciona una opción</option>
          {TOPICS.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
        {fieldError("topic")}
      </div>

      <div className="form-field">
        <label htmlFor="contact-message">Mensaje</label>
        <textarea {...field("message")} rows={6} maxLength={MAX_MESSAGE} placeholder="Cuéntame qué necesitas, el contexto y los plazos si los hay." required />
        <div className="field-meta">
          {fieldError("message") || <span />}
          <small className={values.message.length > MAX_MESSAGE * 0.9 ? "near-limit" : ""}>
            {values.message.length}/{MAX_MESSAGE}
          </small>
        </div>
      </div>

      {/* Campo trampa anti-spam: invisible para personas, los bots suelen rellenarlo. */}
      <div className="hp" aria-hidden="true">
        <label htmlFor="contact-website">No rellenar este campo</label>
        <input id="contact-website" name="website" type="text" tabIndex={-1} autoComplete="off" value={values.website} onChange={set("website")} />
      </div>

      <div className="form-actions">
        <button type="submit" className="button main-button form-submit" disabled={sending} data-cursor="ENVIAR">
          {sending ? (<><i className="spinner" aria-hidden="true" /> Enviando…</>) : (<>Enviar mensaje <b>↗</b></>)}
        </button>
        <p className="form-privacy">Tus datos solo se usan para responder a este mensaje.</p>
      </div>

      <div aria-live="polite">
        {status === "error" && (
          <p className="form-error" role="alert">
            {serverError} Puedes escribirme directamente a{" "}
            <a href={`mailto:${fallbackEmail}`}>{fallbackEmail}</a>.
          </p>
        )}
      </div>
    </form>
  );
}
