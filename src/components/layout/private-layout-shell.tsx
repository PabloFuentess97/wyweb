'use client';

import { useState } from 'react';
import {
  PrivateSidebar,
  type SidebarCounters,
} from '@/components/layout/private-sidebar';
import {
  PrivateTopbar,
  type Crumb,
} from '@/components/layout/private-topbar';

type Props = {
  variant: 'client' | 'staff';
  user: { name: string; email: string; image?: string | null; role: string };
  breadcrumbs: ReadonlyArray<Crumb>;
  counters?: SidebarCounters;
  notificationCount?: number;
  children: React.ReactNode;
};

/**
 * Shell del layout privado: sidebar fijo + topbar sticky + contenido.
 * El estado del drawer mobile vive aquí.
 */
export function PrivateLayoutShell({
  variant,
  user,
  breadcrumbs,
  counters,
  notificationCount,
  children,
}: Props) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-[var(--color-bg)]">
      <PrivateSidebar
        variant={variant}
        user={user}
        counters={counters}
        mobileOpen={mobileOpen}
        onMobileOpenChange={setMobileOpen}
      />

      <div className="flex-1 flex flex-col min-w-0">
        <PrivateTopbar
          user={user}
          breadcrumbs={breadcrumbs}
          notificationCount={notificationCount}
          onMobileMenuClick={() => setMobileOpen(true)}
        />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}
