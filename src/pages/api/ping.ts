import type { APIRoute } from 'astro';
export const prerender = false;
export const runtime = 'nodejs';
export const GET: APIRoute = async () => {
  const hasKey = !!process.env.RESEND_API_KEY;
  return new Response(JSON.stringify({ ok:true, env:{ hasKey } }), {
    status: 200, headers: { 'content-type': 'application/json' }
  });
};
