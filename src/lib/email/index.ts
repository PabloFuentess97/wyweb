import 'server-only';
import { env } from '@/lib/env';
import { createResendProvider } from './resend';
import type { EmailMessage, EmailProvider, EmailResult } from './provider';

export type { EmailMessage, EmailProvider, EmailResult };

/**
 * Provider noop — sólo loggea el email a consola. Útil en local sin API key
 * o en tests. NUNCA debe alcanzar producción si NODE_ENV=production y no hay
 * RESEND_API_KEY configurado, en ese caso lanza error explícito.
 */
function createNoopProvider(): EmailProvider {
  return {
    async send(message: EmailMessage): Promise<EmailResult> {
      console.warn('[email:noop] Email NO enviado (sin RESEND_API_KEY):');
      console.warn(`  to: ${Array.isArray(message.to) ? message.to.join(', ') : message.to}`);
      console.warn(`  subject: ${message.subject}`);
      if (message.text) console.warn(`  text: ${message.text.slice(0, 200)}…`);
      return { id: `noop-${Date.now()}` };
    },
  };
}

let cached: EmailProvider | null = null;

export function getEmailProvider(): EmailProvider {
  if (cached) return cached;
  if (env.RESEND_API_KEY) {
    cached = createResendProvider(env.RESEND_API_KEY, env.EMAIL_FROM);
  } else {
    if (env.NODE_ENV === 'production') {
      throw new Error(
        'Email provider no configurado: define RESEND_API_KEY en producción.',
      );
    }
    cached = createNoopProvider();
  }
  return cached;
}

/** Helper de envío. */
export async function sendEmail(message: EmailMessage): Promise<EmailResult> {
  return getEmailProvider().send(message);
}
