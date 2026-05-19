import { sql } from 'drizzle-orm';
import {
  bigint,
  boolean,
  customType,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  timestamp,
  uniqueIndex,
  uuid,
} from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

// ─── Custom column types
const citext = customType<{ data: string }>({
  dataType() {
    return 'citext';
  },
});

const inet = customType<{ data: string }>({
  dataType() {
    return 'inet';
  },
});

// ─── Enums
export const userRoleEnum = pgEnum('user_role', [
  'staff_admin',
  'staff_agent',
  'client_admin',
  'client_user',
]);
export const customerStatusEnum = pgEnum('customer_status', [
  'active',
  'suspended',
  'archived',
]);
export const customerRoleEnum = pgEnum('customer_role', ['admin', 'viewer']);
export const brandEnum = pgEnum('brand', ['wyweb']);
export const serviceCategoryEnum = pgEnum('service_category', [
  'web-design',
  'saas',
  'ecommerce',
  'seo',
  'maintenance',
  'branding',
]);
export const serviceStatusEnum = pgEnum('service_status', [
  'active',
  'pending',
  'suspended',
  'terminated',
]);
export const slaTierEnum = pgEnum('sla_tier', [
  'none',
  'bronze',
  'silver',
  'gold',
  'platinum',
]);
export const invoiceStatusEnum = pgEnum('invoice_status', [
  'draft',
  'issued',
  'paid',
  'overdue',
  'cancelled',
]);
export const ticketStatusEnum = pgEnum('ticket_status', [
  'open',
  'in_progress',
  'waiting_customer',
  'resolved',
  'closed',
]);
export const priorityEnum = pgEnum('priority', ['low', 'normal', 'high', 'critical']);
export const docCategoryEnum = pgEnum('doc_category', [
  'contract',
  'certificate',
  'report',
  'other',
]);
export const leadStatusEnum = pgEnum('lead_status', [
  'new',
  'contacted',
  'qualified',
  'converted',
  'discarded',
]);

// ─── Auth.js standard tables (drizzle adapter)
export const users = pgTable('users', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  email: citext('email').notNull().unique(),
  emailVerified: timestamp('email_verified_at', { withTimezone: true }),
  passwordHash: text('password_hash'),
  name: text('name').notNull(),
  image: text('avatar_url'),
  role: userRoleEnum('role').notNull().default('client_user'),
  themePreference: text('theme_preference').notNull().default('system'),
  densityPreference: text('density_preference').notNull().default('comfortable'),
  language: text('language').notNull().default('es-ES'),
  twoFactorEnabled: boolean('two_factor_enabled').notNull().default(false),
  twoFactorSecret: text('two_factor_secret'),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  deletedAt: timestamp('deleted_at', { withTimezone: true }),
});

export const accounts = pgTable(
  'accounts',
  {
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    type: text('type').notNull(),
    provider: text('provider').notNull(),
    providerAccountId: text('provider_account_id').notNull(),
    refresh_token: text('refresh_token'),
    access_token: text('access_token'),
    expires_at: integer('expires_at'),
    token_type: text('token_type'),
    scope: text('scope'),
    id_token: text('id_token'),
    session_state: text('session_state'),
  },
  (t) => [primaryKey({ columns: [t.provider, t.providerAccountId] })],
);

export const sessions = pgTable('sessions', {
  sessionToken: text('session_token').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expires: timestamp('expires', { withTimezone: true }).notNull(),
});

export const verificationTokens = pgTable(
  'verification_tokens',
  {
    identifier: text('identifier').notNull(),
    token: text('token').notNull(),
    expires: timestamp('expires', { withTimezone: true }).notNull(),
  },
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

export const passwordResetTokens = pgTable('password_reset_tokens', {
  token: text('token').primaryKey(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  usedAt: timestamp('used_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});

// ─── Customers
export const customers = pgTable(
  'customers',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    cif: text('cif').notNull().unique(),
    legalName: text('legal_name').notNull(),
    tradeName: text('trade_name'),
    emailBilling: citext('email_billing').notNull(),
    phone: text('phone'),
    addressLine1: text('address_line1').notNull(),
    addressLine2: text('address_line2'),
    postalCode: text('postal_code').notNull(),
    city: text('city').notNull(),
    province: text('province').notNull(),
    country: text('country').notNull().default('ES'),
    iban: text('iban'),
    status: customerStatusEnum('status').notNull().default('active'),
    brand: brandEnum('brand').notNull().default('wyweb'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
    deletedAt: timestamp('deleted_at', { withTimezone: true }),
  },
  (t) => [
    uniqueIndex('customers_cif_idx').on(t.cif),
    index('customers_status_idx').on(t.status),
  ],
);

export const customerUsers = pgTable(
  'customer_users',
  {
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customers.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.id, { onDelete: 'cascade' }),
    customerRole: customerRoleEnum('customer_role').notNull().default('viewer'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [primaryKey({ columns: [t.customerId, t.userId] })],
);

// ─── Services
export const services = pgTable(
  'services',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customers.id),
    code: text('code').notNull().unique(),
    category: serviceCategoryEnum('category').notNull(),
    name: text('name').notNull(),
    description: text('description'),
    status: serviceStatusEnum('status').notNull().default('pending'),
    slaTier: slaTierEnum('sla_tier').notNull().default('none'),
    startedAt: date('started_at'),
    endedAt: date('ended_at'),
    monthlyFeeCents: integer('monthly_fee_cents'),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('services_customer_idx').on(t.customerId),
    index('services_status_idx').on(t.status),
  ],
);

// ─── Invoices
export const invoices = pgTable(
  'invoices',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customers.id),
    number: text('number').notNull().unique(),
    series: text('series').notNull().default('A'),
    status: invoiceStatusEnum('status').notNull().default('draft'),
    issuedAt: date('issued_at'),
    dueAt: date('due_at'),
    paidAt: timestamp('paid_at', { withTimezone: true }),
    subtotalCents: bigint('subtotal_cents', { mode: 'number' }).notNull().default(0),
    vatCents: bigint('vat_cents', { mode: 'number' }).notNull().default(0),
    irpfCents: bigint('irpf_cents', { mode: 'number' }).notNull().default(0),
    totalCents: bigint('total_cents', { mode: 'number' }).notNull().default(0),
    pdfStorageKey: text('pdf_storage_key'),
    notes: text('notes'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('invoices_customer_idx').on(t.customerId),
    index('invoices_status_idx').on(t.status),
    uniqueIndex('invoices_number_idx').on(t.number),
  ],
);

export const invoiceLines = pgTable('invoice_lines', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  invoiceId: uuid('invoice_id')
    .notNull()
    .references(() => invoices.id, { onDelete: 'cascade' }),
  description: text('description').notNull(),
  serviceId: uuid('service_id').references(() => services.id),
  quantity: numeric('quantity', { precision: 10, scale: 2 }).notNull().default('1'),
  unitPriceCents: bigint('unit_price_cents', { mode: 'number' }).notNull(),
  vatRate: numeric('vat_rate', { precision: 5, scale: 2 }).notNull().default('21.00'),
  irpfRate: numeric('irpf_rate', { precision: 5, scale: 2 }).notNull().default('0.00'),
  subtotalCents: bigint('subtotal_cents', { mode: 'number' }).notNull(),
  sortOrder: integer('sort_order').notNull().default(0),
});

// ─── Tickets
export const tickets = pgTable(
  'tickets',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    number: text('number').notNull().unique(),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customers.id),
    openedByUserId: uuid('opened_by_user_id')
      .notNull()
      .references(() => users.id),
    assignedToUserId: uuid('assigned_to_user_id').references(() => users.id),
    serviceId: uuid('service_id').references(() => services.id),
    subject: text('subject').notNull(),
    status: ticketStatusEnum('status').notNull().default('open'),
    priority: priorityEnum('priority').notNull().default('normal'),
    slaDueAt: timestamp('sla_due_at', { withTimezone: true }),
    firstResponseAt: timestamp('first_response_at', { withTimezone: true }),
    resolvedAt: timestamp('resolved_at', { withTimezone: true }),
    closedAt: timestamp('closed_at', { withTimezone: true }),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('tickets_customer_idx').on(t.customerId),
    index('tickets_assignee_idx').on(t.assignedToUserId),
    index('tickets_status_idx').on(t.status),
  ],
);

export const ticketMessages = pgTable(
  'ticket_messages',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    ticketId: uuid('ticket_id')
      .notNull()
      .references(() => tickets.id, { onDelete: 'cascade' }),
    authorId: uuid('author_id')
      .notNull()
      .references(() => users.id),
    authorRole: text('author_role').notNull(),
    body: text('body').notNull(),
    isInternalNote: boolean('is_internal_note').notNull().default(false),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('ticket_messages_ticket_idx').on(t.ticketId)],
);

export const ticketAttachments = pgTable('ticket_attachments', {
  id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
  ticketMessageId: uuid('ticket_message_id')
    .notNull()
    .references(() => ticketMessages.id, { onDelete: 'cascade' }),
  filename: text('filename').notNull(),
  storageKey: text('storage_key').notNull(),
  mimeType: text('mime_type').notNull(),
  sizeBytes: integer('size_bytes').notNull(),
});

// ─── Documents
export const documents = pgTable(
  'documents',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    customerId: uuid('customer_id')
      .notNull()
      .references(() => customers.id),
    name: text('name').notNull(),
    category: docCategoryEnum('category').notNull().default('other'),
    storageKey: text('storage_key').notNull(),
    mimeType: text('mime_type').notNull(),
    sizeBytes: integer('size_bytes').notNull(),
    visibleToClient: boolean('visible_to_client').notNull().default(true),
    uploadedByUserId: uuid('uploaded_by_user_id')
      .notNull()
      .references(() => users.id),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index('documents_customer_idx').on(t.customerId)],
);

// ─── Leads
export const leads = pgTable(
  'leads',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    name: text('name').notNull(),
    email: citext('email').notNull(),
    phone: text('phone'),
    company: text('company'),
    message: text('message').notNull(),
    source: text('source').notNull().default('web-contact'),
    status: leadStatusEnum('status').notNull().default('new'),
    convertedToCustomerId: uuid('converted_to_customer_id').references(() => customers.id),
    assignedToUserId: uuid('assigned_to_user_id').references(() => users.id),
    notes: text('notes'),
    ip: inet('ip'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('leads_status_idx').on(t.status),
    index('leads_email_idx').on(t.email),
  ],
);

// ─── Audit
// ─── Settings (singleton: una sola fila id=1)
export const settings = pgTable('settings', {
  id: integer('id').primaryKey().default(1),
  // Empresa
  companyLegalName: text('company_legal_name').notNull().default('Wyweb S.L.'),
  companyTradeName: text('company_trade_name'),
  companyCif: text('company_cif').notNull().default(''),
  companyEmail: citext('company_email').notNull().default(''),
  companyPhone: text('company_phone'),
  companyWebsite: text('company_website'),
  companyLogoUrl: text('company_logo_url'),
  companyAddressLine1: text('company_address_line1').notNull().default(''),
  companyAddressLine2: text('company_address_line2'),
  companyPostalCode: text('company_postal_code').notNull().default(''),
  companyCity: text('company_city').notNull().default(''),
  companyProvince: text('company_province').notNull().default(''),
  companyCountry: text('company_country').notNull().default('ES'),
  // Datos bancarios para emisión de facturas
  bankIban: text('bank_iban'),
  bankSwiftBic: text('bank_swift_bic'),
  bankName: text('bank_name'),
  // Facturación
  invoicePrefix: text('invoice_prefix').notNull().default('UXE'),
  invoiceSeries: text('invoice_series').notNull().default('A'),
  invoiceNextNumber: integer('invoice_next_number').notNull().default(1),
  invoiceNumberPadding: integer('invoice_number_padding').notNull().default(5),
  invoiceFooter: text('invoice_footer'),
  invoiceDefaultVatRate: numeric('invoice_default_vat_rate', { precision: 5, scale: 2 })
    .notNull()
    .default('21.00'),
  invoiceDefaultPaymentTermsDays: integer('invoice_default_payment_terms_days')
    .notNull()
    .default(30),
  // Email
  emailFromName: text('email_from_name').notNull().default('Wyweb'),
  emailFromAddress: citext('email_from_address').notNull().default('no-reply@wyweb.net'),
  emailReplyTo: citext('email_reply_to'),
  emailFooterHtml: text('email_footer_html'),
  // Plantillas custom: { [key]: { subject: string, body: string } }
  emailTemplates: jsonb('email_templates').notNull().default({}),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  updatedByUserId: uuid('updated_by_user_id').references(() => users.id),
});

export const auditLog = pgTable(
  'audit_log',
  {
    id: uuid('id').primaryKey().default(sql`gen_random_uuid()`),
    actorUserId: uuid('actor_user_id').references(() => users.id),
    action: text('action').notNull(),
    entityType: text('entity_type').notNull(),
    entityId: uuid('entity_id'),
    diff: jsonb('diff').notNull().default({}),
    ip: inet('ip'),
    userAgent: text('user_agent'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [
    index('audit_actor_idx').on(t.actorUserId),
    index('audit_entity_idx').on(t.entityType, t.entityId),
    index('audit_created_idx').on(t.createdAt),
  ],
);

// ─── Relations
export const usersRelations = relations(users, ({ many }) => ({
  customerUsers: many(customerUsers),
  openedTickets: many(tickets, { relationName: 'opener' }),
}));

export const customersRelations = relations(customers, ({ many }) => ({
  users: many(customerUsers),
  services: many(services),
  invoices: many(invoices),
  tickets: many(tickets),
  documents: many(documents),
}));

export const customerUsersRelations = relations(customerUsers, ({ one }) => ({
  customer: one(customers, {
    fields: [customerUsers.customerId],
    references: [customers.id],
  }),
  user: one(users, { fields: [customerUsers.userId], references: [users.id] }),
}));

export const invoicesRelations = relations(invoices, ({ one, many }) => ({
  customer: one(customers, {
    fields: [invoices.customerId],
    references: [customers.id],
  }),
  lines: many(invoiceLines),
}));

export const ticketsRelations = relations(tickets, ({ one, many }) => ({
  customer: one(customers, {
    fields: [tickets.customerId],
    references: [customers.id],
  }),
  openedBy: one(users, {
    fields: [tickets.openedByUserId],
    references: [users.id],
    relationName: 'opener',
  }),
  assignedTo: one(users, {
    fields: [tickets.assignedToUserId],
    references: [users.id],
    relationName: 'assignee',
  }),
  messages: many(ticketMessages),
}));

// ─── Types
export type Lead = typeof leads.$inferSelect;
export type NewLead = typeof leads.$inferInsert;
export type Customer = typeof customers.$inferSelect;
export type User = typeof users.$inferSelect;
export type Settings = typeof settings.$inferSelect;
export type NewSettings = typeof settings.$inferInsert;
