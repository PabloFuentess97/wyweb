import 'server-only';
import { Resend } from 'resend';
import type { EmailMessage, EmailProvider, EmailResult } from './provider';

export function createResendProvider(apiKey: string, from: string): EmailProvider {
  const resend = new Resend(apiKey);
  return {
    async send(message: EmailMessage): Promise<EmailResult> {
      const to = Array.isArray(message.to) ? message.to : [message.to];
      const base = {
        from,
        to,
        subject: message.subject,
        ...(message.replyTo ? { replyTo: message.replyTo } : {}),
      };
      const payload = message.html
        ? { ...base, html: message.html }
        : { ...base, text: message.text ?? '' };
      const result = await resend.emails.send(payload);
      if (result.error) {
        throw new Error(`Resend: ${result.error.message}`);
      }
      return { id: result.data?.id ?? 'unknown' };
    },
  };
}
