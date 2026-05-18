import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { Building2, FileText, Landmark, Mail, MessageSquare } from 'lucide-react';
import { auth } from '@/lib/auth';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { getSettings } from '@/lib/db/queries/settings';
import { BankingForm } from './banking-form';
import { CompanyForm } from './company-form';
import { EmailForm } from './email-form';
import { InvoicingForm } from './invoicing-form';
import { TemplatesForm } from './templates-form';

export const metadata: Metadata = {
  title: 'Ajustes · Backoffice',
  robots: { index: false, follow: false },
};

export default async function AjustesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (session.user.role !== 'staff_admin') {
    redirect('/admin?error=forbidden');
  }

  const sp = await searchParams;
  const tab = ['empresa', 'bancarios', 'facturacion', 'email', 'plantillas'].includes(
    sp.tab ?? '',
  )
    ? (sp.tab as string)
    : 'empresa';

  const s = await getSettings();

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 max-w-5xl mx-auto">
      <header className="flex flex-col gap-2 mb-8 max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
          BACKOFFICE · AJUSTES
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
          Configuración global
        </h1>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
          Datos de empresa, bancarios y plantillas de comunicación. Los cambios se registran en el
          log de auditoría y aplican inmediatamente a toda la plataforma.
        </p>
      </header>

      <Tabs defaultValue={tab} className="flex flex-col gap-6">
        <TabsList className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
          <TabsTrigger value="empresa" className="gap-1.5">
            <Building2 className="h-3.5 w-3.5" strokeWidth={1.5} />
            Empresa
          </TabsTrigger>
          <TabsTrigger value="bancarios" className="gap-1.5">
            <Landmark className="h-3.5 w-3.5" strokeWidth={1.5} />
            Bancarios
          </TabsTrigger>
          <TabsTrigger value="facturacion" className="gap-1.5">
            <FileText className="h-3.5 w-3.5" strokeWidth={1.5} />
            Facturación
          </TabsTrigger>
          <TabsTrigger value="email" className="gap-1.5">
            <Mail className="h-3.5 w-3.5" strokeWidth={1.5} />
            Email
          </TabsTrigger>
          <TabsTrigger value="plantillas" className="gap-1.5">
            <MessageSquare className="h-3.5 w-3.5" strokeWidth={1.5} />
            Plantillas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="empresa">
          <CompanyForm
            defaults={{
              companyLegalName: s.companyLegalName,
              companyTradeName: s.companyTradeName,
              companyCif: s.companyCif,
              companyEmail: s.companyEmail,
              companyPhone: s.companyPhone,
              companyWebsite: s.companyWebsite,
              companyLogoUrl: s.companyLogoUrl,
              companyAddressLine1: s.companyAddressLine1,
              companyAddressLine2: s.companyAddressLine2,
              companyPostalCode: s.companyPostalCode,
              companyCity: s.companyCity,
              companyProvince: s.companyProvince,
              companyCountry: s.companyCountry,
            }}
          />
        </TabsContent>

        <TabsContent value="bancarios">
          <BankingForm
            defaults={{
              bankIban: s.bankIban,
              bankSwiftBic: s.bankSwiftBic,
              bankName: s.bankName,
            }}
          />
        </TabsContent>

        <TabsContent value="facturacion">
          <InvoicingForm
            defaults={{
              invoicePrefix: s.invoicePrefix,
              invoiceSeries: s.invoiceSeries,
              invoiceNextNumber: s.invoiceNextNumber,
              invoiceNumberPadding: s.invoiceNumberPadding,
              invoiceFooter: s.invoiceFooter,
              invoiceDefaultVatRate: s.invoiceDefaultVatRate,
              invoiceDefaultPaymentTermsDays: s.invoiceDefaultPaymentTermsDays,
            }}
          />
        </TabsContent>

        <TabsContent value="email">
          <EmailForm
            defaults={{
              emailFromName: s.emailFromName,
              emailFromAddress: s.emailFromAddress,
              emailReplyTo: s.emailReplyTo,
              emailFooterHtml: s.emailFooterHtml,
            }}
          />
        </TabsContent>

        <TabsContent value="plantillas">
          <TemplatesForm defaults={s.emailTemplates} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
