// src/pages/api/cotizar.ts
import type { APIRoute } from "astro";
import { Resend } from "resend";

export const prerender = false;
export const runtime = "nodejs";

const asArray = (to?: string) =>
  (to ?? "")
    .split(",")
    .map(s => s.trim())
    .filter(Boolean);

export const GET: APIRoute = async () => {
  const hasKey = !!process.env.RESEND_API_KEY;
  const from = process.env.CONTACT_FROM || "";
  const to = asArray(process.env.CONTACT_TO);
  return new Response(JSON.stringify({ ok: true, env: { hasKey, from, toCount: to.length } }), {
    status: 200,
    headers: { "content-type": "application/json" },
  });
};

export const POST: APIRoute = async ({ request }) => {
  try {
    const RESEND_API_KEY = process.env.RESEND_API_KEY;
    const CONTACT_FROM   = process.env.CONTACT_FROM;
    const CONTACT_TO     = process.env.CONTACT_TO;

    if (!RESEND_API_KEY) throw new Error("Falta RESEND_API_KEY");
    if (!CONTACT_FROM) throw new Error("Falta CONTACT_FROM");
    if (!CONTACT_TO) throw new Error("Falta CONTACT_TO");

    const resend = new Resend(RESEND_API_KEY);

    const body = await request.json().catch(() => ({}));
    const { nombre, email, tipo, descripcion } = body ?? {};
    if (!nombre || !email || !tipo || !descripcion) {
      return new Response(JSON.stringify({ ok: false, error: "Campos requeridos faltantes" }), { status: 400 });
    }

    const text =
      `Nombre: ${nombre}\n` +
      `Email: ${email}\n` +
      `Tipo: ${tipo}\n` +
      `Descripción:\n${descripcion}`;

    const toList = asArray(CONTACT_TO);
    const res = await resend.emails.send({
      from: CONTACT_FROM,        // Debe ser dominio verificado o onboarding@resend.dev
      to: toList.length ? toList : [CONTACT_TO],
      replyTo: email,
      subject: `Nueva cotización — ${nombre} (${tipo})`,
      text,
      html: text.replace(/\n/g, "<br/>"),
    });

    // Log útil en producción (ver Vercel → Logs)
    console.log("Resend send response:", JSON.stringify(res, null, 2));

    if (res.error) {
      throw new Error(res.error?.message || "Error desconocido en Resend");
    }

    return new Response(JSON.stringify({ ok: true, id: res.data?.id }), {
      status: 200,
      headers: { "content-type": "application/json" },
    });
  } catch (err: any) {
    console.error("cotizar API error:", err);
    return new Response(JSON.stringify({ ok: false, error: String(err?.message || err) }), {
      status: 500,
      headers: { "content-type": "application/json" },
    });
  }
};
