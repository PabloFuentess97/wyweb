import { NextRequest, NextResponse } from 'next/server';
import { render } from '@react-email/render';
import { createLead } from '@/lib/db/queries/leads';
import { sendEmail } from '@/lib/email';
import { LeadNotificationEmail } from '@/lib/email/templates/lead-notification';
import { LeadConfirmationEmail } from '@/lib/email/templates/lead-confirmation';
import { contactSchema } from '@/lib/validation/contact';
import { createRateLimiter } from '@/lib/rate-limit';
import { env } from '@/lib/env';

export const runtime = 'nodejs';

const limiter = createRateLimiter({ window: 60 * 60_000, limit: 5 });

function getClientIp(req: NextRequest): string {
  const xff = req.headers.get('x-forwarded-for');
  if (xff) return xff.split(',')[0]!.trim();
  const real = req.headers.get('x-real-ip');
  if (real) return real.trim();
  return 'unknown';
}

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return errorResponse(400, 'INVALID_JSON', 'Cuerpo no es JSON válido.');
  }

  const parsed = contactSchema.safeParse(body);
  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.');
      if (path) fields[path] = issue.message;
    }
    return errorResponse(422, 'VALIDATION', 'Revisa los campos del formulario.', fields);
  }

  const data = parsed.data;
  const ip = getClientIp(req);
  const userAgent = req.headers.get('user-agent') ?? undefined;

  // Honeypot — fail silently con 200 (no informamos al bot).
  if (data.website && data.website.length > 0) {
    return NextResponse.json({ data: { id: 'silent-discard' } }, { status: 200 });
  }

  // Rate limit por IP — 5 envíos / hora.
  const rl = limiter.check(`contact:${ip}`);
  if (!rl.ok) {
    return errorResponse(
      429,
      'RATE_LIMITED',
      'Has enviado demasiados mensajes. Inténtalo en una hora.',
    );
  }

  // Insert lead.
  let lead;
  try {
    lead = await createLead({
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      message: data.message,
      source: data.source,
      ip: ip !== 'unknown' ? ip : undefined,
      userAgent,
    });
  } catch (err) {
    console.error('[contacto] DB error:', err);
    return errorResponse(500, 'DB_ERROR', 'No se pudo guardar el mensaje.');
  }

  // Emails — fallo de email NO bloquea el lead.
  const emailErrors: string[] = [];
  try {
    const html = await render(
      LeadNotificationEmail({
        name: data.name,
        email: data.email,
        phone: data.phone,
        company: data.company,
        message: data.message,
        source: data.source,
        leadId: lead.id,
        appUrl: env.NEXT_PUBLIC_APP_URL,
      }),
    );
    await sendEmail({
      to: env.EMAIL_TO_LEADS,
      subject: `[Wyweb] Nuevo lead web · ${data.name}${data.company ? ` (${data.company})` : ''}`,
      html,
      replyTo: data.email,
    });
  } catch (err) {
    console.error('[contacto] notification email error:', err);
    emailErrors.push('notification');
  }

  try {
    const html = await render(
      LeadConfirmationEmail({
        name: data.name,
        appUrl: env.NEXT_PUBLIC_APP_URL,
      }),
    );
    await sendEmail({
      to: data.email,
      subject: 'Hemos recibido tu mensaje · Wyweb',
      html,
    });
  } catch (err) {
    console.error('[contacto] confirmation email error:', err);
    emailErrors.push('confirmation');
  }

  return NextResponse.json(
    {
      data: { id: lead.id, emailWarnings: emailErrors.length ? emailErrors : undefined },
    },
    { status: 200 },
  );
}

function errorResponse(
  status: number,
  code: string,
  message: string,
  fields?: Record<string, string>,
) {
  return NextResponse.json(
    { error: { code, message, fields } },
    { status },
  );
}
