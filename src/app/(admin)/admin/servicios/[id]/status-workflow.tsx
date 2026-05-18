'use client';

import { useState, useTransition } from 'react';
import { CheckCircle2, PauseCircle, Play, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { changeServiceStatusAction } from '../actions';
import { STATUS_TRANSITIONS } from '@/lib/validation/service';
import { toast } from '@/components/ui/toaster';

type Status = 'active' | 'pending' | 'suspended' | 'terminated';

const ACTION_META: Record<
  Status,
  { label: string; icon: React.ReactNode; variant: 'accent' | 'secondary' | 'destructive' }
> = {
  active: { label: 'Activar', icon: <Play strokeWidth={1.5} />, variant: 'accent' },
  pending: {
    label: 'Pendiente',
    icon: <PauseCircle strokeWidth={1.5} />,
    variant: 'secondary',
  },
  suspended: {
    label: 'Suspender',
    icon: <PauseCircle strokeWidth={1.5} />,
    variant: 'secondary',
  },
  terminated: {
    label: 'Terminar',
    icon: <XCircle strokeWidth={1.5} />,
    variant: 'destructive',
  },
};

type Props = {
  serviceId: string;
  currentStatus: Status;
};

export function StatusWorkflow({ serviceId, currentStatus }: Props) {
  const [isPending, startTransition] = useTransition();
  const [pendingTarget, setPendingTarget] = useState<Status | null>(null);
  const allowedTransitions = STATUS_TRANSITIONS[currentStatus];

  if (allowedTransitions.length === 0) {
    return (
      <div className="rounded-[var(--radius-3)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] px-4 py-3 flex items-center gap-2">
        <CheckCircle2
          className="h-4 w-4 text-[var(--color-fg-muted)]"
          strokeWidth={1.5}
        />
        <p className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold">
          ESTADO TERMINAL · NO ADMITE TRANSICIONES
        </p>
      </div>
    );
  }

  const handle = (target: Status) => {
    setPendingTarget(target);
    startTransition(async () => {
      const result = await changeServiceStatusAction(serviceId, target);
      setPendingTarget(null);
      if (result.status === 'success') {
        toast.success(result.message ?? 'Estado actualizado');
      } else if (result.status === 'error') {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold mr-1">
        TRANSICIONES PERMITIDAS
      </span>
      {allowedTransitions.map((target) => {
        const meta = ACTION_META[target];
        return (
          <Button
            key={target}
            type="button"
            variant={meta.variant}
            size="sm"
            disabled={isPending}
            loading={pendingTarget === target}
            onClick={() => handle(target)}
          >
            {pendingTarget !== target && meta.icon}
            {meta.label}
          </Button>
        );
      })}
    </div>
  );
}
