import 'server-only';
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from '@react-pdf/renderer';

export type PdfCompany = {
  legalName: string;
  cif: string;
  email: string;
  phone: string | null;
  website: string | null;
  addressLine1: string;
  addressLine2: string | null;
  postalCode: string;
  city: string;
  province: string;
  country: string;
  bankIban: string | null;
  bankSwiftBic: string | null;
  bankName: string | null;
  invoiceFooter: string | null;
};

export type PdfCustomer = {
  legalName: string;
  tradeName: string | null;
  cif: string;
  addressLine1: string;
  addressLine2: string | null;
  postalCode: string;
  city: string;
  province: string;
  country: string;
};

export type PdfLine = {
  description: string;
  quantity: number;
  unitPriceCents: number;
  vatRate: number;
  irpfRate: number;
  subtotalCents: number;
};

export type PdfInvoice = {
  number: string;
  series: string;
  issuedAt: Date;
  dueAt: Date | null;
  notes: string | null;
  subtotalCents: number;
  vatCents: number;
  irpfCents: number;
  totalCents: number;
};

const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 9,
    fontFamily: 'Helvetica',
    color: '#0E1120',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 24,
    borderBottom: '1px solid #E4E4E7',
    paddingBottom: 16,
  },
  brandTitle: {
    fontSize: 18,
    fontFamily: 'Helvetica-Bold',
    color: '#0E1120',
    letterSpacing: -0.4,
  },
  brandSub: {
    fontSize: 8,
    color: '#71717A',
    marginTop: 2,
  },
  invoiceTitle: {
    textAlign: 'right',
  },
  eyebrow: {
    fontSize: 7,
    color: '#71717A',
    letterSpacing: 1,
    textTransform: 'uppercase',
    fontFamily: 'Helvetica-Bold',
  },
  invoiceNumber: {
    fontSize: 16,
    fontFamily: 'Courier-Bold',
    color: '#0E1120',
    marginTop: 2,
  },
  parties: {
    flexDirection: 'row',
    gap: 24,
    marginBottom: 20,
  },
  partyBox: {
    flex: 1,
    border: '1px solid #E4E4E7',
    padding: 10,
    borderRadius: 2,
  },
  partyLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#71717A',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  partyName: {
    fontSize: 10,
    fontFamily: 'Helvetica-Bold',
    color: '#0E1120',
    marginBottom: 2,
  },
  partyLine: {
    fontSize: 8.5,
    color: '#3F3F46',
    lineHeight: 1.4,
  },
  partyCif: {
    fontSize: 8.5,
    fontFamily: 'Courier',
    color: '#3F3F46',
    marginTop: 1,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 24,
    marginBottom: 16,
  },
  metaItem: {
    alignItems: 'flex-end',
  },
  metaValue: {
    fontFamily: 'Courier',
    fontSize: 9,
    color: '#0E1120',
  },
  table: {
    border: '1px solid #E4E4E7',
    borderRadius: 2,
    marginBottom: 16,
  },
  tableHeader: {
    flexDirection: 'row',
    backgroundColor: '#F4F4F5',
    borderBottom: '1px solid #E4E4E7',
    padding: 8,
  },
  tableHeaderCell: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#71717A',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '1px solid #F4F4F5',
    padding: 8,
  },
  tableRowLast: {
    borderBottom: 'none',
  },
  cellDescription: { flex: 4 },
  cellQty: { flex: 0.8, textAlign: 'right' },
  cellUnit: { flex: 1.2, textAlign: 'right' },
  cellVat: { flex: 0.8, textAlign: 'right' },
  cellSubtotal: { flex: 1.4, textAlign: 'right' },
  cellText: { fontSize: 9, color: '#0E1120' },
  cellMono: { fontFamily: 'Courier', fontSize: 9, color: '#0E1120' },
  totals: {
    alignSelf: 'flex-end',
    width: '50%',
    marginBottom: 24,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottom: '1px solid #F4F4F5',
  },
  totalLabel: { fontSize: 9, color: '#71717A' },
  totalValue: { fontFamily: 'Courier', fontSize: 9, color: '#0E1120' },
  grandRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderTop: '1px solid #0E1120',
    borderBottom: 'none',
    marginTop: 4,
  },
  grandLabel: {
    fontFamily: 'Helvetica-Bold',
    fontSize: 11,
    color: '#0E1120',
    letterSpacing: 0.4,
    textTransform: 'uppercase',
  },
  grandValue: {
    fontFamily: 'Courier-Bold',
    fontSize: 14,
    color: '#0E1120',
  },
  bankBox: {
    border: '1px solid #E4E4E7',
    backgroundColor: '#FAFAFA',
    padding: 10,
    borderRadius: 2,
    marginBottom: 12,
  },
  bankLabel: {
    fontSize: 7,
    fontFamily: 'Helvetica-Bold',
    color: '#71717A',
    letterSpacing: 1,
    textTransform: 'uppercase',
    marginBottom: 4,
  },
  bankIban: {
    fontFamily: 'Courier-Bold',
    fontSize: 12,
    color: '#0E1120',
    letterSpacing: 1,
  },
  bankMeta: {
    fontSize: 8,
    color: '#71717A',
    marginTop: 2,
  },
  notes: {
    fontSize: 8.5,
    color: '#3F3F46',
    lineHeight: 1.5,
    marginBottom: 12,
  },
  footer: {
    position: 'absolute',
    bottom: 28,
    left: 40,
    right: 40,
    fontSize: 7,
    color: '#A1A1AA',
    textAlign: 'center',
    paddingTop: 6,
    borderTop: '1px solid #F4F4F5',
  },
});

function formatEuros(cents: number): string {
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
  }).format(cents / 100);
}

function formatDate(d: Date): string {
  return new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(d);
}

function formatIban(iban: string | null): string | null {
  if (!iban) return null;
  return iban.replace(/(.{4})/g, '$1 ').trim();
}

export type RenderInvoicePdfInput = {
  company: PdfCompany;
  customer: PdfCustomer;
  invoice: PdfInvoice;
  lines: ReadonlyArray<PdfLine>;
};

function InvoiceDocument({
  company,
  customer,
  invoice,
  lines,
}: RenderInvoicePdfInput) {
  const showIrpf = invoice.irpfCents > 0;
  return (
    <Document
      title={`Factura ${invoice.number}`}
      author={company.legalName}
      creator={company.legalName}
      producer="Wyweb Self-Built BillingProvider"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.brandTitle}>{company.legalName}</Text>
            <Text style={styles.brandSub}>
              CIF {company.cif} · {company.city} · {company.country}
            </Text>
          </View>
          <View style={styles.invoiceTitle}>
            <Text style={styles.eyebrow}>FACTURA · SERIE {invoice.series}</Text>
            <Text style={styles.invoiceNumber}>{invoice.number}</Text>
          </View>
        </View>

        <View style={styles.parties}>
          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>EMISOR</Text>
            <Text style={styles.partyName}>{company.legalName}</Text>
            <Text style={styles.partyCif}>CIF {company.cif}</Text>
            <Text style={styles.partyLine}>
              {company.addressLine1}
              {company.addressLine2 ? `\n${company.addressLine2}` : ''}
              {`\n${company.postalCode} ${company.city} (${company.province}) · ${company.country}`}
            </Text>
            <Text style={styles.partyLine}>{company.email}</Text>
            {company.phone && <Text style={styles.partyLine}>{company.phone}</Text>}
          </View>

          <View style={styles.partyBox}>
            <Text style={styles.partyLabel}>CLIENTE</Text>
            <Text style={styles.partyName}>
              {customer.legalName}
              {customer.tradeName ? ` · ${customer.tradeName}` : ''}
            </Text>
            <Text style={styles.partyCif}>CIF {customer.cif}</Text>
            <Text style={styles.partyLine}>
              {customer.addressLine1}
              {customer.addressLine2 ? `\n${customer.addressLine2}` : ''}
              {`\n${customer.postalCode} ${customer.city} (${customer.province}) · ${customer.country}`}
            </Text>
          </View>
        </View>

        <View style={styles.metaRow}>
          <View style={styles.metaItem}>
            <Text style={styles.eyebrow}>FECHA EMISIÓN</Text>
            <Text style={styles.metaValue}>{formatDate(invoice.issuedAt)}</Text>
          </View>
          {invoice.dueAt && (
            <View style={styles.metaItem}>
              <Text style={styles.eyebrow}>VENCIMIENTO</Text>
              <Text style={styles.metaValue}>{formatDate(invoice.dueAt)}</Text>
            </View>
          )}
        </View>

        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderCell, styles.cellDescription]}>Concepto</Text>
            <Text style={[styles.tableHeaderCell, styles.cellQty]}>Cant.</Text>
            <Text style={[styles.tableHeaderCell, styles.cellUnit]}>Precio ud.</Text>
            <Text style={[styles.tableHeaderCell, styles.cellVat]}>IVA</Text>
            <Text style={[styles.tableHeaderCell, styles.cellSubtotal]}>Subtotal</Text>
          </View>
          {lines.map((line, idx) => (
            <View
              key={idx}
              style={[
                styles.tableRow,
                idx === lines.length - 1 ? styles.tableRowLast : {},
              ]}
            >
              <Text style={[styles.cellText, styles.cellDescription]}>
                {line.description}
              </Text>
              <Text style={[styles.cellMono, styles.cellQty]}>
                {line.quantity.toFixed(2)}
              </Text>
              <Text style={[styles.cellMono, styles.cellUnit]}>
                {formatEuros(line.unitPriceCents)}
              </Text>
              <Text style={[styles.cellMono, styles.cellVat]}>
                {line.vatRate.toFixed(0)}%
              </Text>
              <Text style={[styles.cellMono, styles.cellSubtotal]}>
                {formatEuros(line.subtotalCents)}
              </Text>
            </View>
          ))}
        </View>

        <View style={styles.totals}>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Base imponible</Text>
            <Text style={styles.totalValue}>{formatEuros(invoice.subtotalCents)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>IVA</Text>
            <Text style={styles.totalValue}>{formatEuros(invoice.vatCents)}</Text>
          </View>
          {showIrpf && (
            <View style={styles.totalRow}>
              <Text style={styles.totalLabel}>IRPF retenido</Text>
              <Text style={styles.totalValue}>−{formatEuros(invoice.irpfCents)}</Text>
            </View>
          )}
          <View style={styles.grandRow}>
            <Text style={styles.grandLabel}>TOTAL</Text>
            <Text style={styles.grandValue}>{formatEuros(invoice.totalCents)}</Text>
          </View>
        </View>

        {company.bankIban && (
          <View style={styles.bankBox}>
            <Text style={styles.bankLabel}>FORMA DE PAGO · TRANSFERENCIA</Text>
            <Text style={styles.bankIban}>{formatIban(company.bankIban)}</Text>
            <Text style={styles.bankMeta}>
              {[company.bankName, company.bankSwiftBic && `SWIFT ${company.bankSwiftBic}`]
                .filter(Boolean)
                .join(' · ')}
              {invoice.dueAt
                ? ` · Vencimiento ${formatDate(invoice.dueAt)}`
                : ''}
            </Text>
          </View>
        )}

        {invoice.notes && (
          <Text style={styles.notes}>{invoice.notes}</Text>
        )}

        <Text style={styles.footer} fixed>
          {company.invoiceFooter ?? `${company.legalName} · CIF ${company.cif}`}
        </Text>
      </Page>
    </Document>
  );
}

export async function renderInvoicePdf(
  input: RenderInvoicePdfInput,
): Promise<Buffer> {
  return renderToBuffer(<InvoiceDocument {...input} />);
}
