import 'server-only';

export type EmailMessage = {
  to: string | string[];
  subject: string;
  html?: string;
  text?: string;
  /** Email "Reply-To" opcional. */
  replyTo?: string;
};

export type EmailResult = { id: string };

export interface EmailProvider {
  send(message: EmailMessage): Promise<EmailResult>;
}
