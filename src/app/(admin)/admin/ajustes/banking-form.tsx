'use client';

import { useActionState } from 'react';
import { Landmark } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { updateBankingSettingsAction, type ActionState } from './actions';
import { FormCard, FormFeedback, FormField, SaveButton } from './form-bits';

const initial: ActionState = { status: 'idle' };

export type BankingDefaults = {
  bankIban: string | null;
  bankSwiftBic: string | null;
  bankName: string | null;
};

export function BankingForm({ defaults }: { defaults: BankingDefaults }) {
  const [state, formAction] = useActionState(updateBankingSettingsAction, initial);
  const fe = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <FormCard
      title="Datos bancarios"
      description="Cuenta de cobro que aparecerá en las facturas. Solo IBAN español (ES + 22 dígitos)."
    >
      <form action={formAction} className="flex flex-col gap-5" noValidate>
        <FormField id="bankIban" label="IBAN" hint="Formato ES + 22 dígitos" error={fe?.bankIban}>
          <div className="relative">
            <Landmark
              className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--color-fg-subtle)] pointer-events-none"
              strokeWidth={1.5}
            />
            <Input
              id="bankIban"
              name="bankIban"
              defaultValue={defaults.bankIban ?? ''}
              maxLength={34}
              placeholder="ES00 0000 0000 0000 0000 0000"
              className="pl-9 font-mono uppercase tnum tracking-wider"
              invalid={!!fe?.bankIban}
              autoComplete="off"
            />
          </div>
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField id="bankName" label="Entidad" error={fe?.bankName}>
            <Input
              id="bankName"
              name="bankName"
              defaultValue={defaults.bankName ?? ''}
              maxLength={200}
              placeholder="CaixaBank, S.A."
              invalid={!!fe?.bankName}
            />
          </FormField>
          <FormField
            id="bankSwiftBic"
            label="SWIFT / BIC"
            hint="Opcional · 8 u 11 caracteres"
            error={fe?.bankSwiftBic}
          >
            <Input
              id="bankSwiftBic"
              name="bankSwiftBic"
              defaultValue={defaults.bankSwiftBic ?? ''}
              maxLength={11}
              placeholder="CAIXESBBXXX"
              className="font-mono uppercase tnum"
              invalid={!!fe?.bankSwiftBic}
              autoComplete="off"
            />
          </FormField>
        </div>

        <FormFeedback state={state} />
        <SaveButton />
      </form>
    </FormCard>
  );
}
