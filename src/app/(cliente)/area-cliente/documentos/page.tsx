import type { Metadata } from 'next';
import { FolderOpen, Info } from 'lucide-react';
import { auth } from '@/lib/auth';
import { EmptyState } from '@/components/ui/empty-state';
import { DocumentRow } from '@/components/cliente/document-row';
import { getDocumentsByCustomer, type DocCategory } from '@/lib/db/queries/documents';
import { getS3Config } from '@/lib/storage/s3';

export const metadata: Metadata = {
  title: 'Documentos',
  robots: { index: false, follow: false },
};

const CATEGORY_LABEL: Record<DocCategory, string> = {
  contract: 'Contratos',
  certificate: 'Certificados',
  report: 'Informes',
  other: 'Otros',
};

const CATEGORY_ORDER: DocCategory[] = ['contract', 'certificate', 'report', 'other'];

export default async function DocumentosPage() {
  const session = await auth();
  if (!session?.user) return null;

  const docs = await getDocumentsByCustomer(session.user.customerIds);
  const storageConfigured = !!getS3Config();

  // Agrupar por categoría
  const grouped = new Map<DocCategory, typeof docs>();
  for (const d of docs) {
    const list = grouped.get(d.category) ?? [];
    list.push(d);
    grouped.set(d.category, list);
  }

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8">
      <header className="flex flex-col gap-2 mb-8 max-w-3xl">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
          ÁREA CLIENTE · DOCUMENTOS
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
          Documentos
        </h1>
        <p className="text-sm text-[var(--color-fg-muted)] leading-relaxed">
          Contratos, certificados e informes asociados a tu cuenta. La descarga genera un
          enlace temporal cifrado de 5 minutos.
        </p>
      </header>

      {!storageConfigured && docs.length > 0 && (
        <aside
          className="mb-6 flex items-start gap-3 rounded-[var(--radius-card)] border border-[color-mix(in_oklab,var(--color-warning)_30%,var(--color-border))] bg-[color-mix(in_oklab,var(--color-warning)_6%,var(--color-surface))] p-4"
          role="status"
        >
          <Info
            className="h-5 w-5 text-[var(--color-warning)] shrink-0 mt-0.5"
            strokeWidth={1.5}
          />
          <div className="flex flex-col gap-1">
            <p className="font-mono text-[11px] uppercase tracking-[0.12em] font-semibold text-[var(--color-warning)]">
              ALMACENAMIENTO NO CONFIGURADO
            </p>
            <p className="text-sm text-[var(--color-fg)] leading-relaxed">
              El servidor de archivos todavía no está conectado en este entorno. Los
              documentos están registrados pero la descarga no estará disponible hasta
              que se complete la integración con MinIO.
            </p>
          </div>
        </aside>
      )}

      {docs.length === 0 ? (
        <EmptyState
          icon={<FolderOpen strokeWidth={1.5} />}
          title="Sin documentos"
          description="Aún no hay documentos asociados a tu cuenta. Aparecerán aquí cuando subamos contratos, certificados o informes."
        />
      ) : (
        <div className="flex flex-col gap-6">
          {CATEGORY_ORDER.filter((cat) => grouped.has(cat)).map((cat) => {
            const list = grouped.get(cat) ?? [];
            return (
              <section
                key={cat}
                className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden"
              >
                <header className="flex items-center justify-between gap-2 px-4 py-2.5 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
                  <h2 className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-fg-strong)]">
                    {CATEGORY_LABEL[cat]}
                  </h2>
                  <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)] tnum">
                    {list.length} {list.length === 1 ? 'DOC.' : 'DOCS.'}
                  </span>
                </header>
                <ul className="divide-y divide-[var(--color-border)]">
                  {list.map((d) => (
                    <DocumentRow key={d.id} doc={d} />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      )}

      <p className="mt-8 font-mono text-[10px] uppercase tracking-[0.12em] text-[var(--color-fg-subtle)] max-w-2xl leading-relaxed">
        LOS DOCUMENTOS LOS SUBE EL EQUIPO DE UXEA TRAS FIRMA O EMISIÓN. SI NECESITAS
        UNA COPIA NO LISTADA, ESCRÍBENOS A INFO@UXEA.NET.
      </p>
    </div>
  );
}
