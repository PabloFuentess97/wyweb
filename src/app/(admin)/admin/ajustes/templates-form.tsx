'use client';

import { useActionState, useState, useTransition } from 'react';
import { RotateCcw, Sparkles } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  EMAIL_TEMPLATE_KEYS,
  EMAIL_TEMPLATE_LABELS,
  EMAIL_TEMPLATE_VARIABLES,
  type EmailTemplateKey,
  type EmailTemplatesMap,
} from '@/lib/validation/settings';
import {
  resetEmailTemplateAction,
  updateEmailTemplateAction,
  type ActionState,
} from './actions';
import { FormCard, FormFeedback, FormField, SaveButton } from './form-bits';

const initial: ActionState = { status: 'idle' };

export function TemplatesForm({
  defaults,
}: {
  defaults: EmailTemplatesMap;
}) {
  const [activeKey, setActiveKey] = useState<EmailTemplateKey>(EMAIL_TEMPLATE_KEYS[0]);
  const [state, formAction] = useActionState(updateEmailTemplateAction, initial);
  const fe = state.status === 'error' ? state.fieldErrors : undefined;

  const current = defaults[activeKey];
  const isCustom = !!current && (current.subject || current.body);
  const variables = EMAIL_TEMPLATE_VARIABLES[activeKey];

  return (
    <FormCard
      title="Plantillas de email"
      description="Personaliza el asunto y el cuerpo de cada email transaccional. Si dejas vacío, se usa la plantilla por defecto del sistema."
    >
      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr] gap-6">
        {/* Selector lateral */}
        <nav
          className="flex flex-col gap-1 border border-[var(--color-border)] rounded-[var(--radius-3)] p-1.5 bg-[var(--color-bg-subtle)] h-fit"
          aria-label="Plantillas disponibles"
        >
          {EMAIL_TEMPLATE_KEYS.map((key) => {
            const isActive = key === activeKey;
            const has = !!defaults[key] && (!!defaults[key]?.subject || !!defaults[key]?.body);
            return (
              <button
                key={key}
                type="button"
                onClick={() => setActiveKey(key)}
                className={`flex items-center justify-between gap-2 rounded-[var(--radius-2)] px-3 py-2 text-sm text-left transition-colors ${
                  isActive
                    ? 'bg-[var(--color-surface)] text-[var(--color-fg-strong)] border border-[var(--color-border)] shadow-sm'
                    : 'text-[var(--color-fg-muted)] hover:bg-[var(--color-surface)] hover:text-[var(--color-fg)]'
                }`}
                aria-current={isActive}
              >
                <span className="truncate">{EMAIL_TEMPLATE_LABELS[key]}</span>
                {has && (
                  <Sparkles
                    className="h-3 w-3 text-[var(--color-accent)] shrink-0"
                    strokeWidth={1.75}
                    aria-label="Personalizada"
                  />
                )}
              </button>
            );
          })}
        </nav>

        {/* Editor */}
        <div className="flex flex-col gap-4 min-w-0">
          <header className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold text-[var(--color-fg-strong)]">
                {EMAIL_TEMPLATE_LABELS[activeKey]}
              </h3>
              {isCustom ? (
                <Badge variant="accent" dot>
                  Personalizada
                </Badge>
              ) : (
                <Badge variant="outline">Por defecto</Badge>
              )}
            </div>
            {isCustom && <ResetTemplateButton templateKey={activeKey} />}
          </header>

          <div className="flex flex-col gap-1.5">
            <p className="font-mono text-[10px] uppercase tracking-[0.12em] font-semibold text-[var(--color-fg-muted)]">
              Variables disponibles
            </p>
            <div className="flex flex-wrap gap-1.5">
              {variables.map((v) => (
                <code
                  key={v}
                  className="font-mono text-[11px] px-1.5 py-0.5 rounded-[var(--radius-2)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] text-[var(--color-fg)]"
                >
                  {v}
                </code>
              ))}
            </div>
          </div>

          <form
            key={activeKey} /* reset state al cambiar de plantilla */
            action={formAction}
            className="flex flex-col gap-4"
            noValidate
          >
            <input type="hidden" name="key" value={activeKey} />
            <FormField
              id="template-subject"
              label="Asunto"
              hint="Soporta variables {{variable}}. Vacío = usa el asunto por defecto."
              error={fe?.subject}
            >
              <Input
                id="template-subject"
                name="subject"
                defaultValue={current?.subject ?? ''}
                maxLength={200}
                placeholder="Tu factura {{invoiceNumber}} está lista"
                invalid={!!fe?.subject}
              />
            </FormField>
            <FormField
              id="template-body"
              label="Cuerpo del email"
              hint="HTML simple permitido. Vacío = usa la plantilla React Email por defecto."
              error={fe?.body}
            >
              <Textarea
                id="template-body"
                name="body"
                defaultValue={current?.body ?? ''}
                maxLength={20_000}
                rows={14}
                className="font-mono text-xs"
                placeholder={defaultBodyPlaceholder(activeKey)}
                invalid={!!fe?.body}
              />
            </FormField>

            <FormFeedback state={state} />
            <SaveButton label="Guardar plantilla" />
          </form>
        </div>
      </div>
    </FormCard>
  );
}

function ResetTemplateButton({ templateKey }: { templateKey: EmailTemplateKey }) {
  const [pending, startTransition] = useTransition();
  return (
    <Button
      type="button"
      variant="ghost"
      size="sm"
      disabled={pending}
      onClick={() => {
        if (
          !confirm(
            '¿Restablecer al texto por defecto? Se eliminará tu personalización para esta plantilla.',
          )
        ) {
          return;
        }
        startTransition(async () => {
          await resetEmailTemplateAction(templateKey);
        });
      }}
    >
      <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />
      {pending ? 'Restableciendo…' : 'Restablecer'}
    </Button>
  );
}

function defaultBodyPlaceholder(key: EmailTemplateKey): string {
  switch (key) {
    case 'invoice_issued':
      return 'Hola {{customerName}},\n\nTu factura {{invoiceNumber}} por importe de {{totalAmount}} ya está disponible…';
    case 'invoice_overdue':
      return 'Hola {{customerName}},\n\nLa factura {{invoiceNumber}} lleva {{daysLate}} días vencida…';
    case 'ticket_created':
      return 'Hemos abierto el ticket {{ticketCode}}: «{{ticketSubject}}». Puedes seguirlo aquí: {{ticketUrl}}';
    case 'ticket_resolved':
      return 'El ticket {{ticketCode}} ha sido resuelto. {{resolutionNotes}}';
    case 'lead_received':
      return 'Nuevo lead: {{leadName}} ({{leadEmail}}) — {{leadCompany}}\n\n{{leadMessage}}';
    case 'welcome_client':
      return 'Bienvenido a Wyweb, {{userName}}.\n\nAccede al área de cliente: {{loginUrl}}';
  }
}
