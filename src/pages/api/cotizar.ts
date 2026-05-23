// src/pages/api/cotizar.ts
import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false;
export const runtime = "nodejs";

type CotizarPayload = {
  company?: string; // Honeypot
  nombre?: string;
  empresa?: string;
  email?: string;
  telefono?: string;
  tipo?: string;
  etapa?: string;
  tiempo?: string;
  prioridad?: string;
  presupuesto?: string;
  descripcion?: string;
  referencias?: string;
  privacidad?: string;
};

const asArray = (to?: string) =>
  (to ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);

const clean = (value: unknown) => {
  if (typeof value !== "string") return "";
  return value.trim();
};

const escapeHtml = (value: unknown) => {
  const text = clean(value);

  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
};

const nl2br = (value: unknown) => escapeHtml(value).replace(/\n/g, "<br />");

const valueOrDefault = (value: unknown, fallback = "No especificado") => {
  const text = clean(value);
  return text.length > 0 ? text : fallback;
};

const htmlValue = (value: unknown, fallback = "No especificado") => {
  const text = clean(value);
  return text.length > 0 ? escapeHtml(text) : fallback;
};

const isValidEmail = (email: string) => {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
};

export const GET: APIRoute = async () => {
  return new Response(
    JSON.stringify({
      ok: true,
      service: "cotizar",
    }),
    {
      status: 200,
      headers: {
        "content-type": "application/json",
      },
    }
  );
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const CONTACT_FROM = process.env.CONTACT_FROM;
    const CONTACT_TO = process.env.CONTACT_TO;

    if (!RESEND_API_KEY) throw new Error("Falta RESEND_API_KEY");
    if (!CONTACT_FROM) throw new Error("Falta CONTACT_FROM");
    if (!CONTACT_TO) throw new Error("Falta CONTACT_TO");

    const body = (await request.json().catch(() => ({}))) as CotizarPayload;

    const company = clean(body.company);

    // Honeypot anti-bots: si viene lleno, fingimos éxito.
    if (company.length > 0) {
      return new Response(JSON.stringify({ ok: true }), {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      });
    }

    const nombre = clean(body.nombre);
    const empresa = clean(body.empresa);
    const email = clean(body.email);
    const telefono = clean(body.telefono);
    const tipo = clean(body.tipo);
    const etapa = clean(body.etapa);
    const tiempo = clean(body.tiempo);
    const prioridad = clean(body.prioridad);
    const presupuesto = clean(body.presupuesto);
    const descripcion = clean(body.descripcion);
    const referencias = clean(body.referencias);
    const privacidad = clean(body.privacidad);

    const requiredFields = {
      nombre,
      email,
      telefono,
      tipo,
      etapa,
      descripcion,
    };

    const missingFields = Object.entries(requiredFields)
      .filter(([, value]) => !value)
      .map(([key]) => key);

    if (missingFields.length > 0) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: `Campos requeridos faltantes: ${missingFields.join(", ")}`,
        }),
        {
          status: 400,
          headers: {
            "content-type": "application/json",
          },
        }
      );
    }

    if (!isValidEmail(email)) {
      return new Response(
        JSON.stringify({
          ok: false,
          error: "El email no tiene un formato válido",
        }),
        {
          status: 400,
          headers: {
            "content-type": "application/json",
          },
        }
      );
    }

    const toList = asArray(CONTACT_TO);

    if (toList.length === 0) {
      throw new Error("CONTACT_TO no contiene destinatarios válidos");
    }

    const submittedAt = new Date().toLocaleString("es-MX", {
      timeZone: "America/Mexico_City",
      dateStyle: "full",
      timeStyle: "short",
    });

    const subject = `Nueva cotización — ${nombre} (${tipo})`;

    const text = `
Nueva solicitud de cotización — NeoTec Business Solutions

Fecha de recepción:
${submittedAt}

DATOS DE CONTACTO
Nombre: ${nombre}
Empresa / negocio: ${valueOrDefault(empresa)}
Email: ${email}
WhatsApp / teléfono: ${telefono}

PROYECTO
Tipo de proyecto: ${tipo}
Etapa del proyecto: ${etapa}
Horizonte de entrega: ${valueOrDefault(tiempo, "Flexible / no especificado")}
Prioridad: ${valueOrDefault(prioridad)}
Inversión estimada: ${valueOrDefault(presupuesto)}

DESCRIPCIÓN DEL PROYECTO
${descripcion}

REFERENCIAS O ENLACES ÚTILES
${valueOrDefault(referencias, "Sin referencias adicionales")}

PRIVACIDAD
Aceptó uso de datos: ${privacidad ? "Sí" : "No especificado"}

Acción sugerida:
Responder al cliente directamente a ${email} o contactarlo por WhatsApp/teléfono al ${telefono}.
`.trim();

    const html = `
<!doctype html>
<html lang="es">
  <head>
    <meta charset="utf-8" />
    <title>${escapeHtml(subject)}</title>
  </head>

  <body style="margin:0;padding:0;background:#020617;font-family:Arial,Helvetica,sans-serif;color:#e2e8f0;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background:#020617;padding:28px 14px;">
      <tr>
        <td align="center">
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width:720px;background:#0f172a;border:1px solid rgba(103,232,249,0.28);border-radius:18px;overflow:hidden;box-shadow:0 18px 48px rgba(0,0,0,0.35);">
            
            <tr>
              <td style="padding:26px 28px;background:linear-gradient(135deg,#0f172a,#020617);border-bottom:1px solid rgba(148,163,184,0.18);">
                <p style="margin:0 0 10px;font-size:12px;letter-spacing:0.12em;text-transform:uppercase;color:#67e8f9;font-weight:700;">
                  NeoTec Business Solutions
                </p>

                <h1 style="margin:0;font-size:26px;line-height:1.2;color:#f8fafc;">
                  Nueva solicitud de cotización
                </h1>

                <p style="margin:12px 0 0;font-size:14px;line-height:1.6;color:#cbd5e1;">
                  Se recibió un nuevo brief desde el formulario de cotización del sitio web.
                </p>
              </td>
            </tr>

            <tr>
              <td style="padding:22px 28px;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td style="padding:14px 16px;background:#111827;border:1px solid rgba(148,163,184,0.18);border-radius:14px;">
                      <p style="margin:0;font-size:12px;text-transform:uppercase;letter-spacing:0.08em;color:#94a3b8;font-weight:700;">
                        Fecha de recepción
                      </p>
                      <p style="margin:6px 0 0;font-size:15px;color:#f8fafc;">
                        ${escapeHtml(submittedAt)}
                      </p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 22px;">
                <h2 style="margin:0 0 12px;font-size:18px;color:#67e8f9;">
                  Datos de contacto
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 8px;">
                  ${rowHtml("Nombre completo", nombre)}
                  ${rowHtml("Empresa / negocio", empresa)}
                  ${rowHtml("Email", email)}
                  ${rowHtml("WhatsApp / teléfono", telefono)}
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 22px;">
                <h2 style="margin:0 0 12px;font-size:18px;color:#67e8f9;">
                  Proyecto
                </h2>

                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border-collapse:separate;border-spacing:0 8px;">
                  ${rowHtml("Tipo de proyecto", tipo)}
                  ${rowHtml("Etapa", etapa)}
                  ${rowHtml("Horizonte de entrega", tiempo || "Flexible / no especificado")}
                  ${rowHtml("Prioridad", prioridad)}
                  ${rowHtml("Inversión estimada", presupuesto)}
                </table>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 22px;">
                <h2 style="margin:0 0 12px;font-size:18px;color:#67e8f9;">
                  Descripción del proyecto
                </h2>

                <div style="padding:16px;background:#020617;border:1px solid rgba(148,163,184,0.18);border-radius:14px;color:#e2e8f0;font-size:15px;line-height:1.7;">
                  ${nl2br(descripcion)}
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 22px;">
                <h2 style="margin:0 0 12px;font-size:18px;color:#67e8f9;">
                  Referencias o enlaces útiles
                </h2>

                <div style="padding:16px;background:#020617;border:1px solid rgba(148,163,184,0.18);border-radius:14px;color:#e2e8f0;font-size:15px;line-height:1.7;">
                  ${referencias ? nl2br(referencias) : "Sin referencias adicionales"}
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:0 28px 26px;">
                <div style="padding:16px;background:rgba(34,211,238,0.08);border:1px solid rgba(103,232,249,0.26);border-radius:14px;">
                  <p style="margin:0 0 6px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#67e8f9;font-weight:700;">
                    Acción sugerida
                  </p>

                  <p style="margin:0;font-size:15px;line-height:1.7;color:#e2e8f0;">
                    Responder directamente a 
                    <a href="mailto:${escapeHtml(email)}" style="color:#67e8f9;text-decoration:none;font-weight:700;">${escapeHtml(email)}</a>
                    o contactar por WhatsApp/teléfono al 
                    <a href="tel:${escapeHtml(telefono)}" style="color:#67e8f9;text-decoration:none;font-weight:700;">${escapeHtml(telefono)}</a>.
                  </p>
                </div>
              </td>
            </tr>

            <tr>
              <td style="padding:18px 28px;background:#020617;border-top:1px solid rgba(148,163,184,0.18);">
                <p style="margin:0;font-size:12px;line-height:1.6;color:#94a3b8;">
                  Este correo fue generado automáticamente desde el formulario de cotización de NeoTec Business Solutions.
                  Aceptó uso de datos: <strong style="color:#cbd5e1;">${privacidad ? "Sí" : "No especificado"}</strong>.
                </p>
              </td>
            </tr>

          </table>
        </td>
      </tr>
    </table>
  </body>
</html>
`.trim();

    const resend = new Resend(RESEND_API_KEY);

    const res = await resend.emails.send({
      from: CONTACT_FROM,
      to: toList,
      replyTo: email,
      subject,
      text,
      html,
    });

    console.log("Resend send response:", JSON.stringify(res, null, 2));

    if (res.error) {
      throw new Error(res.error?.message || "Error desconocido en Resend");
    }

    return new Response(
      JSON.stringify({
        ok: true,
        id: res.data?.id,
      }),
      {
        status: 200,
        headers: {
          "content-type": "application/json",
        },
      }
    );
  } catch (err: any) {
    console.error("cotizar API error:", err);

    return new Response(
      JSON.stringify({
        ok: false,
        error: String(err?.message || err),
      }),
      {
        status: 500,
        headers: {
          "content-type": "application/json",
        },
      }
    );
  }
};

function rowHtml(label: string, value: unknown) {
  return `
    <tr>
      <td style="width:38%;padding:12px 14px;background:#020617;border:1px solid rgba(148,163,184,0.14);border-right:0;border-radius:12px 0 0 12px;color:#94a3b8;font-size:13px;font-weight:700;vertical-align:top;">
        ${escapeHtml(label)}
      </td>
      <td style="padding:12px 14px;background:#020617;border:1px solid rgba(148,163,184,0.14);border-left:0;border-radius:0 12px 12px 0;color:#f8fafc;font-size:14px;vertical-align:top;">
        ${htmlValue(value)}
      </td>
    </tr>
  `;
}