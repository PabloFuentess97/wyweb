'use client';

import { useActionState } from 'react';
import { useFormStatus } from 'react-dom';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import {
  assignTicketAction,
  changeTicketPriorityAction,
  changeTicketStatusAction,
  type ActionState,
} from '../actions';
import { toast } from '@/components/ui/toaster';
import { useEffect } from 'react';

const initial: ActionState = { status: 'idle' };

type StaffAgent = { id: string; name: string; role: string };

type Props = {
  ticketId: string;
  currentStatus: 'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed';
  currentPriority: 'low' | 'normal' | 'high' | 'critical';
  currentAssignedToUserId: string | null;
  staffAgents: ReadonlyArray<StaffAgent>;
};

export function AdminControls({
  ticketId,
  currentStatus,
  currentPriority,
  currentAssignedToUserId,
  staffAgents,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <AssignForm
        ticketId={ticketId}
        currentValue={currentAssignedToUserId}
        agents={staffAgents}
      />
      <StatusForm ticketId={ticketId} currentValue={currentStatus} />
      <PriorityForm ticketId={ticketId} currentValue={currentPriority} />
    </div>
  );
}

function AssignForm({
  ticketId,
  currentValue,
  agents,
}: {
  ticketId: string;
  currentValue: string | null;
  agents: ReadonlyArray<StaffAgent>;
}) {
  const [state, formAction] = useActionState(
    assignTicketAction.bind(null, ticketId),
    initial,
  );
  useToastEffect(state);

  return (
    <form action={formAction} className="flex flex-col gap-1.5" id="asignar">
      <label
        className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold"
      >
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
  ticketId,
  currentValue,
}: {
  ticketId: string;
  currentValue: string;
}) {
  const [state, formAction] = useActionState(
    changeTicketStatusAction.bind(null, ticketId),
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
            <SelectItem value="open">Abierto</SelectItem>
            <SelectItem value="in_progress">En proceso</SelectItem>
            <SelectItem value="waiting_customer">Esperando cliente</SelectItem>
            <SelectItem value="resolved">Resuelto</SelectItem>
            <SelectItem value="closed">Cerrado</SelectItem>
          </SelectContent>
        </Select>
        <SubmitMicro label="OK" />
      </div>
    </form>
  );
}

function PriorityForm({
  ticketId,
  currentValue,
}: {
  ticketId: string;
  currentValue: string;
}) {
  const [state, formAction] = useActionState(
    changeTicketPriorityAction.bind(null, ticketId),
    initial,
  );
  useToastEffect(state);

  return (
    <form action={formAction} className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold">
        Prioridad
      </label>
      <div className="flex gap-2">
        <Select name="priority" defaultValue={currentValue}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="low">Baja</SelectItem>
            <SelectItem value="normal">Normal</SelectItem>
            <SelectItem value="high">Alta</SelectItem>
            <SelectItem value="critical">Crítica</SelectItem>
          </SelectContent>
        </Select>
        <SubmitMicro label="OK" />
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

function useToastEffect(state: ActionState) {
  useEffect(() => {
    if (state.status === 'success' && state.message) {
      toast.success(state.message);
    } else if (state.status === 'error') {
      toast.error(state.message);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state]);
}
