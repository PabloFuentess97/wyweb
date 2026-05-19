'use client';

import { useActionState, useState } from 'react';
import { useFormStatus } from 'react-dom';
import { AlertCircle, Upload } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { uploadDocumentAction, type ActionState } from '../actions';

const initial: ActionState = { status: 'idle' };
const MAX_BYTES = 25 * 1024 * 1024;

function formatBytes(b: number): string {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

export function UploadDocumentForm({
  customers,
}: {
  customers: ReadonlyArray<{ id: string; legalName: string; cif: string }>;
}) {
  const [state, formAction] = useActionState(uploadDocumentAction, initial);
  const fe = state.status === 'error' ? state.fieldErrors : undefined;

  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState('');
  const [visibleToClient, setVisibleToClient] = useState(true);

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    if (f && !name) setName(f.name);
  }

  return (
    <form
      action={formAction}
      className="flex flex-col gap-5 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] p-6"
      noValidate
    >
      {/* Cliente */}
      <Field
        id="customerId"
        label="Cliente"
        required
        error={fe?.customerId}
        hint={
          customers.length === 0
            ? 'No hay clientes activos. Crea uno primero.'
            : undefined
        }
      >
        <Select name="customerId">
          <SelectTrigger id="customerId">
            <SelectValue placeholder="Selecciona un cliente" />
          </SelectTrigger>
          <SelectContent>
            {customers.map((c) => (
              <SelectItem key={c.id} value={c.id}>
                {c.legalName}
                <span className="font-mono text-[10px] text-[var(--color-fg-subtle)] ml-2">
                  {c.cif}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Field>

      {/* Archivo */}
      <Field
        id="file"
        label="Archivo"
        required
        error={fe?.file}
        hint={
          file
            ? `${file.name} · ${formatBytes(file.size)} · ${file.type || 'tipo desconocido'}`
            : 'Máx 25 MB. PDF, imágenes, documentos office, etc.'
        }
      >
        <Input
          id="file"
          name="file"
          type="file"
          required
          onChange={onFileChange}
          className="cursor-pointer file:mr-3 file:rounded-[var(--radius-2)] file:border-0 file:bg-[var(--color-bg-subtle)] file:px-3 file:py-1.5 file:text-sm file:font-medium hover:file:bg-[var(--color-fg-subtle)]/20"
        />
        {file && file.size > MAX_BYTES && (
          <p className="text-xs text-[var(--color-danger)] font-medium">
            Archivo demasiado grande ({formatBytes(file.size)}). Máx 25 MB.
          </p>
        )}
      </Field>

      {/* Nombre visible */}
      <Field
        id="name"
        label="Nombre visible"
        required
        error={fe?.name}
        hint="Es el nombre que verá el cliente. Por defecto usa el del archivo."
      >
        <Input
          id="name"
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={255}
          required
          placeholder="Contrato 2026.pdf"
          invalid={!!fe?.name}
        />
      </Field>

      {/* Categoría */}
      <Field id="category" label="Categoría" required error={fe?.category}>
        <Select name="category" defaultValue="other">
          <SelectTrigger id="category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="contract">Contrato</SelectItem>
            <SelectItem value="certificate">Certificado</SelectItem>
            <SelectItem value="report">Informe</SelectItem>
            <SelectItem value="other">Otro</SelectItem>
          </SelectContent>
        </Select>
      </Field>

      {/* Visibilidad */}
      <label className="flex items-start gap-3 rounded-[var(--radius-3)] border border-[var(--color-border)] bg-[var(--color-bg-subtle)] p-3 cursor-pointer">
        <Checkbox
          name="visibleToClient"
          checked={visibleToClient}
          onCheckedChange={(v) => setVisibleToClient(v === true)}
          className="mt-0.5"
        />
        <div className="flex flex-col gap-0.5">
          <span className="text-sm font-medium text-[var(--color-fg-strong)]">
            Visible para el cliente
          </span>
          <span className="text-xs text-[var(--color-fg-muted)] leading-relaxed">
            Si está activado, aparece en su área cliente con descarga vía URL
            firmada. Si lo desactivas, queda solo para uso interno.
          </span>
        </div>
      </label>

      {state.status === 'error' && !state.fieldErrors && (
        <div
          className="flex items-start gap-3 rounded-[var(--radius-3)] border border-[color-mix(in_oklab,var(--color-danger)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-danger)_6%,var(--color-surface))] p-3 text-sm text-[var(--color-danger)]"
          role="alert"
        >
          <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" strokeWidth={1.5} />
          <p>{state.message}</p>
        </div>
      )}

      <footer className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--color-border)]">
        <Button asChild variant="ghost" size="md">
          <a href="/admin/documentos">Cancelar</a>
        </Button>
        <SubmitButton disabled={customers.length === 0} />
      </footer>
    </form>
  );
}

function SubmitButton({ disabled }: { disabled?: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="accent"
      size="md"
      loading={pending}
      disabled={pending || disabled}
    >
      {!pending && <Upload className="h-4 w-4" strokeWidth={1.5} />}
      {pending ? 'Subiendo…' : 'Subir documento'}
    </Button>
  );
}

function Field({
  id,
  label,
  required,
  error,
  hint,
  children,
}: {
  id: string;
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="font-mono text-[11px] uppercase tracking-[0.08em] font-medium text-[var(--color-fg-muted)] leading-none"
      >
        {label}
        {required && <span className="text-[var(--color-danger)] ml-1">*</span>}
      </label>
      {children}
      {error && (
        <p className="text-xs text-[var(--color-danger)] font-medium" role="alert">
          {error}
        </p>
      )}
      {hint && !error && (
        <p className="text-xs text-[var(--color-fg-muted)] leading-snug">{hint}</p>
      )}
    </div>
  );
}
