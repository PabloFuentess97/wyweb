'use client';

import { useActionState } from 'react';
import { Input } from '@/components/ui/input';
import { updateCompanySettingsAction, type ActionState } from './actions';
import { FormCard, FormFeedback, FormField, SaveButton } from './form-bits';

const initial: ActionState = { status: 'idle' };

export type CompanyDefaults = {
  companyLegalName: string;
  companyTradeName: string | null;
  companyCif: string;
  companyEmail: string;
  companyPhone: string | null;
  companyWebsite: string | null;
  companyLogoUrl: string | null;
  companyAddressLine1: string;
  companyAddressLine2: string | null;
  companyPostalCode: string;
  companyCity: string;
  companyProvince: string;
  companyCountry: string;
};

export function CompanyForm({ defaults }: { defaults: CompanyDefaults }) {
  const [state, formAction] = useActionState(updateCompanySettingsAction, initial);
  const fe = state.status === 'error' ? state.fieldErrors : undefined;

  return (
    <FormCard
      title="Datos de empresa"
      description="Aparecen en facturas, emails y documentos legales generados por la plataforma."
    >
      <form action={formAction} className="flex flex-col gap-5" noValidate>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField id="companyLegalName" label="Razón social" required error={fe?.companyLegalName}>
            <Input
              id="companyLegalName"
              name="companyLegalName"
              defaultValue={defaults.companyLegalName}
              required
              maxLength={200}
              invalid={!!fe?.companyLegalName}
            />
          </FormField>
          <FormField id="companyTradeName" label="Nombre comercial" error={fe?.companyTradeName}>
            <Input
              id="companyTradeName"
              name="companyTradeName"
              defaultValue={defaults.companyTradeName ?? ''}
              maxLength={200}
              invalid={!!fe?.companyTradeName}
            />
          </FormField>
          <FormField id="companyCif" label="CIF / NIF" required error={fe?.companyCif}>
            <Input
              id="companyCif"
              name="companyCif"
              defaultValue={defaults.companyCif}
              required
              maxLength={20}
              className="font-mono uppercase tnum"
              invalid={!!fe?.companyCif}
            />
          </FormField>
          <FormField id="companyEmail" label="Email corporativo" required error={fe?.companyEmail}>
            <Input
              id="companyEmail"
              name="companyEmail"
              type="email"
              defaultValue={defaults.companyEmail}
              required
              maxLength={200}
              invalid={!!fe?.companyEmail}
            />
          </FormField>
          <FormField id="companyPhone" label="Teléfono" error={fe?.companyPhone}>
            <Input
              id="companyPhone"
              name="companyPhone"
              defaultValue={defaults.companyPhone ?? ''}
              maxLength={40}
              invalid={!!fe?.companyPhone}
            />
          </FormField>
          <FormField
            id="companyWebsite"
            label="Web"
            hint="Incluye https://"
            error={fe?.companyWebsite}
          >
            <Input
              id="companyWebsite"
              name="companyWebsite"
              type="url"
              defaultValue={defaults.companyWebsite ?? ''}
              maxLength={200}
              placeholder="https://wyweb.es"
              invalid={!!fe?.companyWebsite}
            />
          </FormField>
        </div>

        <FormField
          id="companyLogoUrl"
          label="URL del logo"
          hint="URL absoluta a un PNG/SVG sobre fondo transparente. Se usa en facturas PDF y emails."
          error={fe?.companyLogoUrl}
        >
          <Input
            id="companyLogoUrl"
            name="companyLogoUrl"
            type="url"
            defaultValue={defaults.companyLogoUrl ?? ''}
            maxLength={500}
            placeholder="https://cdn.wyweb.es/logo.svg"
            invalid={!!fe?.companyLogoUrl}
          />
        </FormField>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            id="companyAddressLine1"
            label="Dirección"
            required
            error={fe?.companyAddressLine1}
          >
            <Input
              id="companyAddressLine1"
              name="companyAddressLine1"
              defaultValue={defaults.companyAddressLine1}
              required
              maxLength={200}
              invalid={!!fe?.companyAddressLine1}
            />
          </FormField>
          <FormField
            id="companyAddressLine2"
            label="Dirección 2"
            error={fe?.companyAddressLine2}
          >
            <Input
              id="companyAddressLine2"
              name="companyAddressLine2"
              defaultValue={defaults.companyAddressLine2 ?? ''}
              maxLength={200}
              invalid={!!fe?.companyAddressLine2}
            />
          </FormField>
          <FormField
            id="companyPostalCode"
            label="Código postal"
            required
            error={fe?.companyPostalCode}
          >
            <Input
              id="companyPostalCode"
              name="companyPostalCode"
              defaultValue={defaults.companyPostalCode}
              required
              maxLength={10}
              className="font-mono tnum"
              invalid={!!fe?.companyPostalCode}
            />
          </FormField>
          <FormField id="companyCity" label="Ciudad" required error={fe?.companyCity}>
            <Input
              id="companyCity"
              name="companyCity"
              defaultValue={defaults.companyCity}
              required
              maxLength={100}
              invalid={!!fe?.companyCity}
            />
          </FormField>
          <FormField
            id="companyProvince"
            label="Provincia"
            required
            error={fe?.companyProvince}
          >
            <Input
              id="companyProvince"
              name="companyProvince"
              defaultValue={defaults.companyProvince}
              required
              maxLength={100}
              invalid={!!fe?.companyProvince}
            />
          </FormField>
          <FormField id="companyCountry" label="País (ISO 2)" required error={fe?.companyCountry}>
            <Input
              id="companyCountry"
              name="companyCountry"
              defaultValue={defaults.companyCountry}
              required
              maxLength={2}
              minLength={2}
              className="font-mono uppercase tnum"
              invalid={!!fe?.companyCountry}
            />
          </FormField>
        </div>

        <FormFeedback state={state} />
        <SaveButton />
      </form>
    </FormCard>
  );
}
