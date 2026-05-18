'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import { useTheme } from '@/components/providers/theme-provider';
import { AlertCircle, CheckCircle2, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Radio, RadioGroup } from '@/components/ui/radio';
import { updateProfileAction, type ActionState } from './actions';

const initial: ActionState = { status: 'idle' };

type Props = {
  defaults: {
    name: string;
    email: string;
    themePreference: 'light' | 'dark' | 'system';
    densityPreference: 'comfortable' | 'compact';
    language: string;
  };
};

export function ProfileForm({ defaults }: Props) {
  const [state, formAction] = useActionState(updateProfileAction, initial);
  const { setTheme } = useTheme();
  const fieldErrors = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <form action={formAction} className="flex flex-col gap-5" noValidate>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="name"
            className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)]"
          >
            Nombre completo<span className="text-[var(--color-danger)] ml-1">*</span>
          </label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            minLength={2}
            maxLength={100}
            defaultValue={defaults.name}
            invalid={!!fieldErrors?.name}
          />
          {fieldErrors?.name && (
            <p className="text-xs text-[var(--color-danger)] font-medium">
              {fieldErrors.name}
            </p>
          )}
        </div>

        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)]"
          >
            Email
          </label>
          <Input
            id="email"
            type="email"
            disabled
            defaultValue={defaults.email}
          />
          <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)]">
            CONTACTA CON SOPORTE PARA CAMBIAR EL EMAIL
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="theme"
          className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)]"
        >
          Tema visual
        </label>
        <Select
          name="themePreference"
          defaultValue={defaults.themePreference}
          onValueChange={(v) => setTheme(v as 'light' | 'dark' | 'system')}
        >
          <SelectTrigger id="theme" className="w-full sm:w-72">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="system">Sistema · sigue el SO</SelectItem>
            <SelectItem value="light">Claro</SelectItem>
            <SelectItem value="dark">Oscuro</SelectItem>
          </SelectContent>
        </Select>
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)]">
          EL CAMBIO ES INSTANTÁNEO · SE PERSISTE EN TU CUENTA AL GUARDAR
        </p>
      </div>

      <div className="flex flex-col gap-2">
        <p className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)]">
          Densidad
        </p>
        <RadioGroup
          name="densityPreference"
          defaultValue={defaults.densityPreference}
          className="flex gap-4"
        >
          <label className="flex items-center gap-2 cursor-pointer">
            <Radio value="comfortable" />
            <span className="text-sm">
              Cómoda <span className="text-[var(--color-fg-muted)]">· por defecto</span>
            </span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <Radio value="compact" />
            <span className="text-sm">
              Compacta{' '}
              <span className="text-[var(--color-fg-muted)]">· más datos por pantalla</span>
            </span>
          </label>
        </RadioGroup>
      </div>

      <div className="flex flex-col gap-1.5">
        <label
          htmlFor="language"
          className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)]"
        >
          Idioma
        </label>
        <Select name="language" defaultValue={defaults.language}>
          <SelectTrigger id="language" className="w-full sm:w-72" disabled>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="es-ES">Español · España</SelectItem>
          </SelectContent>
        </Select>
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)]">
          ÚNICO IDIOMA SOPORTADO ACTUALMENTE
        </p>
      </div>

      <Feedback state={state} />

      <SubmitButton />
    </form>
  );
}

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <div className="flex items-center justify-end">
      <Button type="submit" variant="accent" size="md" loading={pending} disabled={pending}>
        {!pending && <Save className="h-3.5 w-3.5" strokeWidth={1.5} />}
        {pending ? 'Guardando…' : 'Guardar cambios'}
      </Button>
    </div>
  );
}

function Feedback({ state }: { state: ActionState }) {
  if (state.status === 'success') {
    return (
      <div
        className="flex items-start gap-3 rounded-[var(--radius-3)] border border-[color-mix(in_oklab,var(--color-success)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-success)_6%,var(--color-surface))] p-3 text-sm text-[var(--color-fg)]"
        role="status"
      >
        <CheckCircle2
          className="h-4 w-4 shrink-0 mt-0.5 text-[var(--color-success)]"
          strokeWidth={1.5}
        />
        <p>{state.message ?? 'Guardado.'}</p>
      </div>
    );
  }
  if (state.status === 'error' && !state.fieldErrors) {
    return (
      <div
        className="flex items-start gap-3 rounded-[var(--radius-3)] border border-[color-mix(in_oklab,var(--color-danger)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-danger)_6%,var(--color-surface))] p-3 text-sm text-[var(--color-danger)]"
        role="alert"
      >
        <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.5} aria-hidden />
        <p>{state.message}</p>
      </div>
    );
  }
  return null;
}
