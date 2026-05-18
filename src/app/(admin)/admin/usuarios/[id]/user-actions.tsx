'use client';

import { useActionState, useEffect, useTransition } from 'react';
import { useFormStatus } from 'react-dom';
import { Mail, RotateCcw, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  changeUserRoleAction,
  resendWelcomeEmailAction,
  restoreUserAction,
  softDeleteUserAction,
  type ActionState,
} from '../actions';
import { toast } from '@/components/ui/toaster';

const initial: ActionState = { status: 'idle' };

type Props = {
  userId: string;
  currentRole: 'staff_admin' | 'staff_agent' | 'client_admin' | 'client_user';
  isDeleted: boolean;
  isSelf: boolean;
  hasPassword: boolean;
};

export function UserActions({
  userId,
  currentRole,
  isDeleted,
  isSelf,
  hasPassword,
}: Props) {
  return (
    <div className="flex flex-col gap-4">
      <ChangeRole
        userId={userId}
        currentRole={currentRole}
        isSelf={isSelf}
      />

      {!hasPassword && !isDeleted && (
        <ResendWelcomeButton userId={userId} />
      )}

      <div className="border-t border-[var(--color-border)] pt-4 flex flex-col gap-2">
        {isDeleted ? (
          <RestoreButton userId={userId} />
        ) : (
          <DeleteButton userId={userId} disabled={isSelf} />
        )}
      </div>
    </div>
  );
}

function ChangeRole({
  userId,
  currentRole,
  isSelf,
}: {
  userId: string;
  currentRole: string;
  isSelf: boolean;
}) {
  const [state, formAction] = useActionState(
    changeUserRoleAction.bind(null, userId),
    initial,
  );
  useToastEffect(state);

  return (
    <form action={formAction} className="flex flex-col gap-1.5">
      <label className="font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold">
        Rol
      </label>
      <div className="flex gap-2">
        <Select name="role" defaultValue={currentRole}>
          <SelectTrigger className="flex-1">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="staff_admin">Staff · Admin</SelectItem>
            <SelectItem value="staff_agent">Staff · Agente</SelectItem>
            <SelectItem value="client_admin">Cliente · Admin</SelectItem>
            <SelectItem value="client_user">Cliente · Usuario</SelectItem>
          </SelectContent>
        </Select>
        <Submit label="OK" />
      </div>
      {isSelf && (
        <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)]">
          NO PUEDES QUITARTE EL ROL ADMIN A TI MISMO
        </p>
      )}
    </form>
  );
}

function ResendWelcomeButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="secondary"
      size="sm"
      loading={isPending}
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await resendWelcomeEmailAction(userId);
          if (result.status === 'success') toast.success(result.message ?? 'OK');
          else if (result.status === 'error') toast.error(result.message);
        });
      }}
    >
      {!isPending && <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />}
      {isPending ? 'Enviando…' : 'Reenviar email de bienvenida'}
    </Button>
  );
}

function DeleteButton({
  userId,
  disabled,
}: {
  userId: string;
  disabled?: boolean;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="destructive"
      size="sm"
      loading={isPending}
      disabled={disabled || isPending}
      onClick={() => {
        if (!confirm('¿Eliminar este usuario? La acción es reversible (soft delete).')) {
          return;
        }
        startTransition(async () => {
          const result = await softDeleteUserAction(userId);
          if (result.status === 'success') toast.success(result.message ?? 'OK');
          else if (result.status === 'error') toast.error(result.message);
        });
      }}
    >
      {!isPending && <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />}
      {isPending ? 'Eliminando…' : 'Eliminar usuario'}
    </Button>
  );
}

function RestoreButton({ userId }: { userId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      type="button"
      variant="primary"
      size="sm"
      loading={isPending}
      disabled={isPending}
      onClick={() => {
        startTransition(async () => {
          const result = await restoreUserAction(userId);
          if (result.status === 'success') toast.success(result.message ?? 'OK');
          else if (result.status === 'error') toast.error(result.message);
        });
      }}
    >
      {!isPending && <RotateCcw className="h-3.5 w-3.5" strokeWidth={1.5} />}
      {isPending ? 'Restaurando…' : 'Restaurar usuario'}
    </Button>
  );
}

function Submit({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button
      type="submit"
      variant="secondary"
      size="sm"
      loading={pending}
      disabled={pending}
    >
      {pending ? '…' : label}
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
