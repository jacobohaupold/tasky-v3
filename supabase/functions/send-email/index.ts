/**
 * send-email Edge Function
 *
 * Sends transactional emails via Resend API.
 * Requires RESEND_API_KEY secret set in Supabase Dashboard.
 *
 * POST body: { type, to, data? }
 * Types: verify_email | reset_password | workspace_invite | security_alert | test
 */

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") ?? "";
// Use verified domain in production; onboarding@resend.dev works only for account owner
const FROM_ADDRESS = "Tasky <onboarding@resend.dev>";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

function baseTemplate(title: string, body: string): string {
  return `<!DOCTYPE html><html lang="es"><head><meta charset="UTF-8"/><title>${title}</title>
  <style>body{margin:0;padding:0;background:#f4f4f8;font-family:Inter,sans-serif}
  .w{max-width:560px;margin:40px auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 24px rgba(0,0,0,.08)}
  .h{background:linear-gradient(135deg,#4f46e5,#7c3aed);padding:32px 40px;text-align:center}
  .logo{color:#fff;font-size:24px;font-weight:800}.c{padding:40px}
  h1{color:#111827;font-size:22px;font-weight:700;margin:0 0 12px}
  p{color:#6b7280;font-size:15px;line-height:1.6;margin:0 0 16px}
  .btn{display:inline-block;background:#4f46e5;color:#fff!important;text-decoration:none;padding:14px 28px;border-radius:8px;font-size:15px;font-weight:600;margin:20px 0}
  .f{background:#f9fafb;border-top:1px solid #e5e7eb;padding:20px 40px;text-align:center}
  .f p{color:#9ca3af;font-size:13px;margin:0}</style></head>
  <body><div class="w"><div class="h"><div class="logo">Tasky</div></div>
  <div class="c">${body}</div>
  <div class="f"><p>© ${new Date().getFullYear()} Tasky. Si no solicitaste este email, ignóralo.</p></div>
  </div></body></html>`;
}

type EmailData = Record<string, string>;

function buildEmail(
  type: string,
  data: EmailData
): { subject: string; html: string } {
  switch (type) {
    case "verify_email":
      return {
        subject: "Verifica tu email — Tasky",
        html: baseTemplate(
          "Verifica tu email",
          `<h1>Verifica tu email</h1>
          <p>Haz clic para verificar tu cuenta de Tasky:</p>
          <p style="text-align:center"><a href="${data.link ?? "#"}" class="btn">Verificar email</a></p>
          <p style="font-size:13px;color:#9ca3af">Este enlace caduca en 24 horas.</p>`
        ),
      };

    case "reset_password":
      return {
        subject: "Restablecer contraseña — Tasky",
        html: baseTemplate(
          "Restablecer contraseña",
          `<h1>Restablecer contraseña</h1>
          <p>Haz clic para restablecer tu contraseña:</p>
          <p style="text-align:center"><a href="${data.link ?? "#"}" class="btn">Restablecer contraseña</a></p>
          <p style="font-size:13px;color:#9ca3af">Este enlace caduca en 1 hora. Si no lo pediste, ignora este email.</p>`
        ),
      };

    case "workspace_invite":
      return {
        subject: `${data.inviter ?? "Alguien"} te invita — Tasky`,
        html: baseTemplate(
          "Invitación a workspace",
          `<h1>¡Tienes una invitación!</h1>
          <p><strong>${data.inviter ?? "Un usuario"}</strong> te invita a <strong>"${data.workspace ?? "Workspace"}"</strong></p>
          <p style="text-align:center"><a href="${data.link ?? "#"}" class="btn">Aceptar invitación</a></p>`
        ),
      };

    case "security_alert":
      return {
        subject: "Alerta de seguridad — Tasky",
        html: baseTemplate(
          "Seguridad",
          `<h1>Nuevo inicio de sesión</h1>
          <p>Detectamos un inicio de sesión desde <strong>${data.device ?? "dispositivo desconocido"}</strong> (IP: ${data.ip ?? "N/A"}).</p>
          <p>Si no fuiste tú, <a href="${data.securityLink ?? "#"}" style="color:#dc2626">protege tu cuenta</a>.</p>`
        ),
      };

    case "test":
      return {
        subject: "Test — Tasky Edge Function ✓",
        html: baseTemplate(
          "Test",
          `<h1>¡Funciona!</h1><p>La Edge Function send-email está operativa.</p><p>Timestamp: ${new Date().toISOString()}</p>`
        ),
      };

    default:
      throw new Error(`Unknown email type: ${type}`);
  }
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }

  try {
    const { type, to, data = {} } = await req.json();

    if (!to || !type) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: to, type" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const { subject, html } = buildEmail(type, data);

    const resendRes = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${RESEND_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from: FROM_ADDRESS, to: [to], subject, html }),
    });

    const resendData = await resendRes.json();

    if (!resendRes.ok) {
      console.error("Resend error:", resendData);
      return new Response(
        JSON.stringify({ error: "Email delivery failed", details: resendData }),
        {
          status: 502,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(JSON.stringify({ success: true, id: resendData.id }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-email error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error", message: String(err) }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
