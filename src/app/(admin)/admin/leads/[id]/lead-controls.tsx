'use client';

import { useActionState, useEffect } from 'react';
import { useFormStatus } from 'react-dom';
import { Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  assignLeadAction,
  changeLeadStatusAction,
  updateLeadNotesAction,
  type ActionState,
} from '../actions';
import { toast } from '@/components/ui/toaster';

const initial: ActionState = { status: 'idle' };

type StaffAgent = { id: string; name: string; role: string };

type Props = {
  leadId: string;
  currentStatus:
    | 'new'
    | 'contacted'
    | 'qualified'
    | 'converted'
    | 'discarded';
  currentAssignedToUserId: string | null;
  currentNotes: string;
  hasConvertedCustomer: boolean;
  staffAgents: ReadonlyArray<StaffAgent>;
};

export function LeadControls({
  leadId,
  currentStatus,
  currentAssignedToUserId,
  currentNotes,
  hasConvertedCustomer,
  staffAgents,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <AssignForm
        leadId={leadId}
        currentValue={currentAssignedToUserId}
        agents={staffAgents}
      />
      <StatusForm
        leadId={leadId}
        currentValue={currentStatus}
        canMarkConverted={hasConvertedCustomer}
      />
      <NotesForm leadId={leadId} currentNotes={currentNotes} />
    </div>
  );
}

function AssignForm({
  leadId,
  currentValue,
  agents,
}: {
  leadId: string;
  currentValue: string | null;
  agents: ReadonlyArray<StaffAgent>;
}) {
  const [state, formAction] = useActionState(
    assignLeadAction.bind(null, leadId),
    initial,
  );
  useToastEffect(state);

  return (
    <form action={formAction} className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold">
        Asignado a
      </label>
      <div className="flex gap-2">
        <Select name="userId" defaultValue={currentValue ?? '__none__'}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="__none__">Sin asignar</SelectItem>
            {agents.map((a) => (
              <SelectItem key={a.id} value={a.id}>
                <span className="text-sm">{a.name}</span>
                <span className="font-mono text-[10px] text-[var(--color-fg-subtle)] ml-2">
                  {a.role.replace('staff_', '').toUpperCase()}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <SubmitMicro label="OK" />
      </div>
    </form>
  );
}

function StatusForm({
  leadId,
  currentValue,
  canMarkConverted,
}: {
  leadId: string;
  currentValue: string;
  canMarkConverted: boolean;
}) {
  const [state, formAction] = useActionState(
    changeLeadStatusAction.bind(null, leadId),
    initial,
  );
  useToastEffect(state);

  return (
    <form action={formAction} className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold">
        Estado
      </label>
      <div className="flex gap-2">
        <Select name="status" defaultValue={currentValue}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="new">Nuevo</SelectItem>
            <SelectItem value="contacted">Contactado</SelectItem>
            <SelectItem value="qualified">Cualificado</SelectItem>
            {canMarkConverted && (
              <SelectItem value="converted">Convertido</SelectItem>
            )}
            <SelectItem value="discarded">Descartado</SelectItem>
          </SelectContent>
        </Select>
        <SubmitMicro label="OK" />
      </div>
      {!canMarkConverted && currentValue !== 'converted' && (
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)]">
          USA &laquo;CONVERTIR A CLIENTE&raquo; PARA MARCAR COMO CONVERTIDO
        </p>
      )}
    </form>
  );
}

function NotesForm({
  leadId,
  currentNotes,
}: {
  leadId: string;
  currentNotes: string;
}) {
  const [state, formAction] = useActionState(
    updateLeadNotesAction.bind(null, leadId),
    initial,
  );
  useToastEffect(state);

  return (
    <form action={formAction} className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold">
        Notas internas
      </label>
      <Textarea
        name="notes"
        rows={5}
        maxLength={5000}
        defaultValue={currentNotes}
        placeholder="Conversaciones, decisiones, contexto interno…"
        className="text-sm"
      />
      <div className="flex justify-end">
        <SubmitNotes />
      </div>
    </form>
  );
}

function SubmitMicro({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" size="sm" loading={pending} disabled={pending}>
      {pending ? '…' : label}
    </Button>
  );
}

function SubmitNotes() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" variant="secondary" size="sm" loading={pending} disabled={pending}>
      {!pending && <Save className="h-3.5 w-3.5" strokeWidth={1.5} />}
      {pending ? 'Guardando…' : 'Guardar notas'}
    </Button>
  );
}

function useToastEffect(state: ActionState) {
  useEffect(() => {
    if (state.status === 'success' && state.message && state.message !== 'Sin cambios.') {
      toast.success(state.message);
    } else if (state.status === 'error') {
      toast.error(state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
}
