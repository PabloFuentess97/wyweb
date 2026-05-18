import { redirect } from 'next/navigation';
import { count } from 'drizzle-orm';
import { auth } from '@/lib/auth';
import { db } from '@/lib/db';
import { leads } from '@/lib/db/schema';
import { eq } from 'drizzle-orm';
import { PrivateLayoutShell } from '@/components/layout/private-layout-shell';
import type { SidebarCounters } from '@/components/layout/private-sidebar';

/**
 * Layout para `/admin/**`. Verifica la sesión + rol staff_*.
 * Pre-carga counters mínimos para badges del sidebar (leads sin atender).
 */
export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || !session.user.role.startsWith('staff_')) {
    redirect('/login?from=/admin');
  }

  // Counters reales: leads en estado "new" (sin tocar)
  const counters: SidebarCounters = {};
  try {
    const rows = await db
      .select({ value: count() })
      .from(leads)
      .where(eq(leads.status, 'new'));
    const newLeadsCount = rows[0]?.value ?? 0;
    if (newLeadsCount > 0) {
      counters['/admin/leads'] = { count: newLeadsCount, tone: 'default' };
    }
  } catch (e) {
    console.error('[admin layout] error counting leads:', e);
  }

  return (
    <PrivateLayoutShell
      variant="staff"
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
      }}
      breadcrumbs={[{ label: 'Backoffice', href: '/admin' }]}
      counters={counters}
    >
      {children}
    </PrivateLayoutShell>
  );
}
