'use client';

import { useActionState } from 'react';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { updateEmailSettingsAction, type ActionState } from './actions';
import { FormCard, FormFeedback, FormField, SaveButton } from './form-bits';

const initial: ActionState = { status: 'idle' };

export type EmailDefaults = {
  emailFromName: string;
  emailFromAddress: string;
  emailReplyTo: string | null;
  emailFooterHtml: string | null;
};

export function EmailForm({ defaults }: { defaults: EmailDefaults }) {
  const [state, formAction] = useActionState(updateEmailSettingsAction, initial);
  const fe = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <FormCard
      title="Remitente y firma de emails"
      description="Aplica a todos los correos transaccionales. El dominio del remitente debe estar verificado en Resend."
    >
      <form action={formAction} className="flex flex-col gap-5" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="emailFromName"
            label="Nombre del remitente"
            required
            error={fe?.emailFromName}
          >
            <Input
              id="emailFromName"
              name="emailFromName"
              defaultValue={defaults.emailFromName}
              required
              maxLength={100}
              invalid={!!fe?.emailFromName}
            />
          </FormField>
          <FormField
            id="emailFromAddress"
            label="Email remitente"
            required
            hint="Dominio verificado en Resend"
            error={fe?.emailFromAddress}
          >
            <Input
              id="emailFromAddress"
              name="emailFromAddress"
              type="email"
              defaultValue={defaults.emailFromAddress}
              required
              maxLength={200}
              placeholder="no-reply@wyweb.es"
              invalid={!!fe?.emailFromAddress}
            />
          </FormField>
        </div>

        <FormField
          id="emailReplyTo"
          label="Reply-To (opcional)"
          hint="Email al que llegan las respuestas. Si se deja en blanco, se usa el del remitente."
          error={fe?.emailReplyTo}
        >
          <Input
            id="emailReplyTo"
            name="emailReplyTo"
            type="email"
            defaultValue={defaults.emailReplyTo ?? ''}
            maxLength={200}
            placeholder="soporte@wyweb.es"
            invalid={!!fe?.emailReplyTo}
          />
        </FormField>

        <FormField
          id="emailFooterHtml"
          label="Pie de email (HTML)"
          hint="Aparece al final de todos los emails. Se permiten etiquetas básicas: <a>, <strong>, <em>, <br>."
          error={fe?.emailFooterHtml}
        >
          <Textarea
            id="emailFooterHtml"
            name="emailFooterHtml"
            defaultValue={defaults.emailFooterHtml ?? ''}
            maxLength={5000}
            rows={5}
            className="font-mono text-xs"
            placeholder="Wyweb · <a href='https://wyweb.es'>wyweb.es</a>"
            invalid={!!fe?.emailFooterHtml}
          />
        </FormField>

        <FormFeedback state={state} />
        <SaveButton />
      </form>
    </FormCard>
  );
}
