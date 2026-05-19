import { redirect } from 'next/navigation';
import type { Metadata } from 'next';
import { eq } from 'drizzle-orm';
import { Lock, ShieldCheck, Sparkles, User } from 'lucide-react';
import { auth } from '@/lib/auth';
import { Badge } from '@/components/ui/badge';
import { db } from '@/lib/db';
import { users } from '@/lib/db/schema';
import { ProfileForm } from '@/app/(cliente)/area-cliente/perfil/profile-form';
import { PasswordForm } from '@/app/(cliente)/area-cliente/perfil/password-form';

export const metadata: Metadata = {
  title: 'Perfil · Backoffice',
  robots: { index: false, follow: false },
};

const ROLE_LABEL: Record<string, string> = {
  client_admin: 'Cliente · Administrador',
  client_user: 'Cliente · Usuario',
  staff_admin: 'Staff · Admin',
  staff_agent: 'Staff · Agente',
};

export default async function PerfilAdminPage() {
  const session = await auth();
  if (!session?.user) redirect('/login');
  if (!session.user.role.startsWith('staff_')) redirect('/area-cliente/perfil');

  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      themePreference: users.themePreference,
      densityPreference: users.densityPreference,
      language: users.language,
      twoFactorEnabled: users.twoFactorEnabled,
      passwordHash: users.passwordHash,
      createdAt: users.createdAt,
    })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) redirect('/login');

  const hasPassword = !!user.passwordHash;
  const memberSince = new Intl.DateTimeFormat('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  }).format(user.createdAt);

  return (
    <div className="px-4 md:px-6 lg:px-8 py-8 max-w-4xl mx-auto">
      <header className="flex flex-col gap-2 mb-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.16em] font-semibold text-[var(--color-accent)]">
          BACKOFFICE · PERFIL
        </p>
        <h1 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
          Tu perfil
        </h1>
        <div className="flex flex-wrap items-center gap-2 mt-1">
          <Badge variant="accent" dot>
            {ROLE_LABEL[user.role] ?? user.role}
          </Badge>
          <span className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-muted)]">
            STAFF DESDE · {memberSince.toUpperCase()}
          </span>
        </div>
      </header>

      <div className="flex flex-col gap-8">
        <Section
          number="01"
          icon={<User strokeWidth={1.5} />}
          title="Cuenta y preferencias"
          description="Tu nombre, idioma y aspecto del panel. Los cambios se guardan tras pulsar 'Guardar'."
        >
          <ProfileForm
            defaults={{
              name: user.name,
              email: user.email,
              themePreference: user.themePreference as 'light' | 'dark' | 'system',
              densityPreference: user.densityPreference as 'comfortable' | 'compact',
              language: user.language,
            }}
          />
        </Section>

        <Section
          number="02"
          icon={<Lock strokeWidth={1.5} />}
          title="Contraseña"
          description="Mínimo 12 caracteres y fuerza buena o superior. Usa un gestor de contraseñas."
        >
          {hasPassword ? (
            <PasswordForm email={user.email} />
          ) : (
            <div className="rounded-[var(--radius-3)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] p-6">
              <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold mb-1">
                CUENTA SIN CONTRASEÑA
              </p>
              <p className="text-sm text-[var(--color-fg)] leading-relaxed">
                Tu cuenta no tiene contraseña configurada. Cierra sesión y usa{' '}
                <a
                  href="/recuperar"
                  className="text-[var(--color-accent)] underline-offset-4 hover:underline"
                >
                  Recuperar contraseña
                </a>{' '}
                para fijar una.
              </p>
            </div>
          )}
        </Section>

        <Section
          number="03"
          icon={<ShieldCheck strokeWidth={1.5} />}
          title="Doble factor (2FA)"
          description="Añade una capa más de seguridad con una app de autenticación tipo Google Authenticator o 1Password."
        >
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 rounded-[var(--radius-3)] border border-dashed border-[var(--color-border-strong)] bg-[var(--color-bg-subtle)] p-5">
            <div className="flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[var(--radius-2)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-fg-muted)]">
                <Sparkles className="h-4 w-4" strokeWidth={1.5} />
              </span>
              <div className="flex flex-col gap-1">
                <p className="font-mono text-[11px] uppercase tracking-[0.12em] text-[var(--color-fg-muted)] font-semibold">
                  PRÓXIMAMENTE
                </p>
                <p className="text-sm text-[var(--color-fg)] leading-relaxed">
                  La activación de 2FA con TOTP estará disponible en una próxima
                  iteración. Mientras tanto, mantén una contraseña fuerte y
                  única.
                </p>
                <p className="font-mono text-[10px] uppercase tracking-[0.08em] text-[var(--color-fg-subtle)] mt-1">
                  ESTADO ACTUAL · {user.twoFactorEnabled ? 'ACTIVO' : 'NO CONFIGURADO'}
                </p>
              </div>
            </div>
          </div>
        </Section>

        <Section
          number="04"
          icon={<User strokeWidth={1.5} />}
          title="Sesión activa"
          description="Información sobre tu sesión actual."
        >
          <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
            <DataRow label="ID de usuario">
              <span className="font-mono text-xs tnum text-[var(--color-fg-muted)] truncate block">
                {user.id}
              </span>
            </DataRow>
            <DataRow label="Email">
              <span className="text-[var(--color-fg)]">{user.email}</span>
            </DataRow>
            <DataRow label="Rol">
              <span className="text-[var(--color-fg)]">
                {ROLE_LABEL[user.role] ?? user.role}
              </span>
            </DataRow>
            <DataRow label="Idioma">
              <span className="text-[var(--color-fg)]">{user.language}</span>
            </DataRow>
          </dl>
        </Section>
      </div>
    </div>
  );
}

function Section({
  number,
  icon,
  title,
  description,
  children,
}: {
  number: string;
  icon: React.ReactNode;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      <header className="flex items-start gap-3 px-6 py-4 border-b border-[var(--color-border)] bg-[var(--color-bg-subtle)]">
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-2)] bg-[var(--color-surface)] border border-[var(--color-border)] text-[var(--color-fg-muted)] [&>svg]:h-3.5 [&>svg]:w-3.5">
          {icon}
        </span>
        <div className="flex-1 min-w-0 flex flex-col gap-0.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-subtle)] font-semibold tnum">
            {number}
          </p>
          <h2 className="text-base font-semibold tracking-[-0.01em] text-[var(--color-fg-strong)] leading-tight">
            {title}
          </h2>
          {description && (
            <p className="text-sm text-[var(--color-fg-muted)] leading-snug mt-1">
              {description}
            </p>
          )}
        </div>
      </header>
      <div className="px-6 py-6">{children}</div>
    </section>
  );
}

function DataRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-0.5 min-w-0">
      <dt className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold">
        {label}
      </dt>
      <dd className="text-sm">{children}</dd>
    </div>
  );
}
