'use client';

import { useState } from 'react';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import Link from 'next/link';
import { ArrowRight, CheckCircle2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { contactSchema, type ContactInput } from '@/lib/validation/contact';
import { cn } from '@/lib/utils';

type Status = 'idle' | 'submitting' | 'success' | 'error';

type Props = {
  source?: string;
};

export function ContactForm({ source = 'web-contact' }: Props) {
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<ContactInput>({
    resolver: zodResolver(contactSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      company: '',
      message: '',
      source,
      website: '',
      consent: false,
    },
  });

  const consent = watch('consent');

  const onSubmit: SubmitHandler<ContactInput> = async (values) => {
    setStatus('submitting');
    setServerError(null);
    try {
      const res = await fetch('/api/contacto', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(values),
      });
      const json = (await res.json()) as
        | { data: { id: string } }
        | { error: { code: string; message: string; fields?: Record<string, string> } };

      if (!res.ok) {
        if ('error' in json) {
          if (json.error.fields) {
            for (const [field, message] of Object.entries(json.error.fields)) {
              setError(field as keyof ContactInput, { message });
            }
          }
          setServerError(json.error.message);
        } else {
          setServerError('Error inesperado.');
        }
        setStatus('error');
        return;
      }

      setStatus('success');
      reset();
    } catch (err) {
      console.error(err);
      setServerError('No se pudo conectar. Comprueba tu conexión.');
      setStatus('error');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex flex-col gap-4 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--color-success)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-success)_8%,var(--color-surface))] p-8">
        <div className="flex items-center gap-3">
          <CheckCircle2
            className="h-6 w-6 text-[var(--color-success)]"
            strokeWidth={1.5}
          />
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--color-success)] font-semibold">
            MENSAJE ENVIADO
          </p>
        </div>
        <h2 className="text-2xl font-semibold tracking-[-0.02em] text-[var(--color-fg-strong)] leading-tight">
          Lo tenemos. Te respondemos en menos de 24h hábiles.
        </h2>
        <p className="text-base text-[var(--color-fg)] leading-relaxed">
          Revisa tu correo — te hemos enviado una confirmación. Si no aparece en unos
          minutos, revisa la carpeta de spam.
        </p>
        <div className="flex gap-3 mt-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => setStatus('idle')}
          >
            Enviar otro mensaje
          </Button>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/">
              Volver al inicio
              <ArrowRight className="h-3.5 w-3.5" strokeWidth={1.5} />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      noValidate
      className="flex flex-col gap-5"
      aria-busy={status === 'submitting'}
    >
      {/* Honeypot — oculto a humanos vía CSS, accesible aria-hidden */}
      <div
        aria-hidden="true"
        className="absolute -left-[9999px] -top-[9999px] h-0 w-0 overflow-hidden"
      >
        <label>
          Sitio web
          <input
            type="text"
            tabIndex={-1}
            autoComplete="off"
            {...register('website')}
          />
        </label>
      </div>

      <input type="hidden" {...register('source')} />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Nombre" error={errors.name?.message} required htmlFor="name">
          <Input
            id="name"
            type="text"
            autoComplete="name"
            placeholder="Tu nombre"
            invalid={!!errors.name}
            disabled={status === 'submitting'}
            {...register('name')}
          />
        </FormField>

        <FormField label="Email" error={errors.email?.message} required htmlFor="email">
          <Input
            id="email"
            type="email"
            autoComplete="email"
            inputMode="email"
            placeholder="tu@email.com"
            invalid={!!errors.email}
            disabled={status === 'submitting'}
            {...register('email')}
          />
        </FormField>

        <FormField label="Teléfono" error={errors.phone?.message} htmlFor="phone">
          <Input
            id="phone"
            type="tel"
            autoComplete="tel"
            inputMode="tel"
            placeholder="+34 …"
            invalid={!!errors.phone}
            disabled={status === 'submitting'}
            {...register('phone')}
          />
        </FormField>

        <FormField label="Empresa" error={errors.company?.message} htmlFor="company">
          <Input
            id="company"
            type="text"
            autoComplete="organization"
            placeholder="Razón social"
            invalid={!!errors.company}
            disabled={status === 'submitting'}
            {...register('company')}
          />
        </FormField>
      </div>

      <FormField label="Mensaje" error={errors.message?.message} required htmlFor="message">
        <Textarea
          id="message"
          rows={6}
          placeholder="Cuéntanos en qué podemos ayudarte. ¿Qué tienes ahora? ¿Qué buscas? Plazos y volumen aproximados."
          invalid={!!errors.message}
          disabled={status === 'submitting'}
          {...register('message')}
        />
      </FormField>

      <div className="flex items-start gap-3">
        <Checkbox
          id="consent"
          checked={consent === true}
          onCheckedChange={(v) => setValue('consent', v === true, { shouldValidate: true })}
          disabled={status === 'submitting'}
        />
        <div className="flex flex-col gap-1">
          <label
            htmlFor="consent"
            className="text-sm text-[var(--color-fg)] leading-snug cursor-pointer select-none"
          >
            He leído y acepto la{' '}
            <Link
              href="/legal/privacidad"
              className="text-[var(--color-accent)] underline-offset-4 hover:underline"
            >
              política de privacidad
            </Link>
            . Trataremos tus datos para responderte y ofrecerte presupuesto.
          </label>
          {errors.consent?.message && (
            <p className="text-xs text-[var(--color-danger)] font-medium">
              {errors.consent.message}
            </p>
          )}
        </div>
      </div>

      {serverError && status === 'error' && (
        <div
          className="flex items-start gap-3 rounded-[var(--radius-3)] border border-[color-mix(in_oklab,var(--color-danger)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-danger)_6%,var(--color-surface))] p-3 text-sm text-[var(--color-danger)]"
          role="alert"
        >
          <AlertCircle
            className="h-4 w-4 shrink-0 mt-0.5"
            strokeWidth={1.5}
            aria-hidden
          />
          <p>{serverError}</p>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-4 mt-2">
        <Button
          type="submit"
          variant="accent"
          size="lg"
          loading={status === 'submitting'}
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? 'Enviando…' : 'Enviar mensaje'}
          {status !== 'submitting' && (
            <ArrowRight className="h-4 w-4" strokeWidth={1.5} />
          )}
        </Button>
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-subtle)] font-semibold">
          RESPONDEMOS EN &lt;24H HÁBILES
        </p>
      </div>
    </form>
  );
}

function FormField({
  label,
  error,
  required,
  htmlFor,
  children,
}: {
  label: string;
  error?: string;
  required?: boolean;
  htmlFor: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={htmlFor}
        className={cn(
          'font-mono text-[11px] uppercase tracking-[0.08em] font-medium leading-none',
          error ? 'text-[var(--color-danger)]' : 'text-[var(--color-fg-muted)]',
        )}
      >
        {label}
        {required && (
          <span className="text-[var(--color-danger)] ml-1" aria-hidden>
            *
          </span>
        )}
      </label>
      {children}
      {error && (
        <p className="text-xs text-[var(--color-danger)] font-medium" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
