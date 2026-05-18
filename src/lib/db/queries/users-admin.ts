import 'server-only';
import { and, asc, eq, isNull, sql } from 'drizzle-orm';
import { db } from '@/lib/db';
import { customerUsers, customers, users } from '@/lib/db/schema';

export type UserRole =
  | 'staff_admin'
  | 'staff_agent'
  | 'client_admin'
  | 'client_user';

export type AdminUserListItem = {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  emailVerified: Date | null;
  hasPassword: boolean;
  twoFactorEnabled: boolean;
  customersCount: number;
  customerNames: string[];
  createdAt: Date;
  deletedAt: Date | null;
};

export async function getAdminUsersList(
  options: { includeDeleted?: boolean } = {},
): Promise<AdminUserListItem[]> {
  const rows = await db.execute(sql`
    SELECT
      u.id,
      u.name,
      u.email,
      u.role,
      u.email_verified_at AS "emailVerified",
      u.password_hash IS NOT NULL AS "hasPassword",
      u.two_factor_enabled AS "twoFactorEnabled",
      u.created_at AS "createdAt",
      u.deleted_at AS "deletedAt",
      COALESCE(
        ARRAY_AGG(c.legal_name) FILTER (WHERE c.id IS NOT NULL),
        '{}'::text[]
      ) AS "customerNames"
    FROM users u
    LEFT JOIN customer_users cu ON cu.user_id = u.id
    LEFT JOIN customers c ON c.id = cu.customer_id
    ${options.includeDeleted ? sql`` : sql`WHERE u.deleted_at IS NULL`}
    GROUP BY u.id
    ORDER BY
      CASE u.role
        WHEN 'staff_admin' THEN 1
        WHEN 'staff_agent' THEN 2
        WHEN 'client_admin' THEN 3
        WHEN 'client_user' THEN 4
      END,
      u.name ASC
  `);

  return (rows as unknown as ReadonlyArray<{
    id: string;
    name: string;
    email: string;
    role: UserRole;
    emailVerified: string | null;
    hasPassword: boolean;
    twoFactorEnabled: boolean;
    createdAt: string;
    deletedAt: string | null;
    customerNames: string[];
  }>).map((r) => ({
    id: r.id,
    name: r.name,
    email: r.email,
    role: r.role,
    emailVerified: r.emailVerified ? new Date(r.emailVerified) : null,
    hasPassword: r.hasPassword,
    twoFactorEnabled: r.twoFactorEnabled,
    customersCount: r.customerNames.length,
    customerNames: r.customerNames,
    createdAt: new Date(r.createdAt),
    deletedAt: r.deletedAt ? new Date(r.deletedAt) : null,
  }));
}

export type AdminUserDetail = {
  user: {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    emailVerified: Date | null;
    hasPassword: boolean;
    themePreference: string;
    densityPreference: string;
    language: string;
    twoFactorEnabled: boolean;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: Date | null;
  };
  customers: Array<{
    customerId: string;
    customerName: string;
    cif: string;
    customerRole: 'admin' | 'viewer';
    linkedAt: Date;
  }>;
};

export async function getAdminUserById(
  id: string,
): Promise<AdminUserDetail | null> {
  const [user] = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      role: users.role,
      emailVerified: users.emailVerified,
      passwordHash: users.passwordHash,
      themePreference: users.themePreference,
      densityPreference: users.densityPreference,
      language: users.language,
      twoFactorEnabled: users.twoFactorEnabled,
      createdAt: users.createdAt,
      updatedAt: users.updatedAt,
      deletedAt: users.deletedAt,
    })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  if (!user) return null;

  const customerLinks = await db
    .select({
      customerId: customerUsers.customerId,
      customerName: customers.legalName,
      cif: customers.cif,
      customerRole: customerUsers.customerRole,
      linkedAt: customerUsers.createdAt,
    })
    .from(customerUsers)
    .innerJoin(customers, eq(customers.id, customerUsers.customerId))
    .where(eq(customerUsers.userId, id))
    .orderBy(asc(customers.legalName));

  return {
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      hasPassword: !!user.passwordHash,
      themePreference: user.themePreference,
      densityPreference: user.densityPreference,
      language: user.language,
      twoFactorEnabled: user.twoFactorEnabled,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      deletedAt: user.deletedAt,
    },
    customers: customerLinks,
  };
}

export async function getActiveCustomersForUserAssignment() {
  return db
    .select({
      id: customers.id,
      legalName: customers.legalName,
      cif: customers.cif,
    })
    .from(customers)
    .where(and(eq(customers.status, 'active'), isNull(customers.deletedAt)))
    .orderBy(asc(customers.legalName));
}

