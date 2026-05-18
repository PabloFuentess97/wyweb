import { redirect } from 'next/navigation';
import { auth } from '@/lib/auth';
import { PrivateLayoutShell } from '@/components/layout/private-layout-shell';

/**
 * Layout para `/area-cliente/**`. Verifica la sesión, hidrata el shell con
 * los datos del usuario y los counters del sidebar.
 *
 * El proxy ya bloquea el acceso sin sesión, pero hacemos doble check aquí
 * (Reglas No Negociables · §16.3).
 */
export default async function ClienteLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!session?.user || !session.user.role.startsWith('client_')) {
    redirect('/login?from=/area-cliente');
  }

  // TODO Fase 2: contar tickets abiertos / facturas vencidas reales (DB)
  const counters = {};

  return (
    <PrivateLayoutShell
      variant="client"
      user={{
        name: session.user.name,
        email: session.user.email,
        image: session.user.image,
        role: session.user.role,
      }}
      breadcrumbs={[{ label: 'Área cliente', href: '/area-cliente' }]}
      counters={counters}
    >
      {children}
    </PrivateLayoutShell>
  );
}
