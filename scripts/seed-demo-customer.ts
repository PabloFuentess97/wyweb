import 'dotenv/config';
import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import { hash } from '@node-rs/argon2';
import { and, eq } from 'drizzle-orm';
import {
  customerUsers,
  customers,
  invoiceLines,
  invoices,
  services,
  ticketMessages,
  tickets,
  users,
} from '../src/lib/db/schema';

/**
 * Seed idempotente: crea un cliente demo "Cerámicas Granadinas SL" con un
 * usuario `client_admin` vinculado, 3 servicios, 2 facturas y 1 ticket abierto.
 *
 * Si ya existen los registros (por CIF o email únicos) se reutilizan y solo
 * se completan los faltantes. Seguro de re-ejecutar.
 */

const DEMO = {
  customer: {
    cif: 'B18000001',
    legalName: 'Cerámicas Granadinas SL',
    tradeName: 'Cerámicas Granadinas',
    emailBilling: 'facturacion@ceramicasgranadinas.demo',
    phone: '+34 958 100 100',
    addressLine1: 'Polígono Industrial Juncaril',
    addressLine2: 'Nave 14',
    postalCode: '18220',
    city: 'Albolote',
    province: 'Granada',
  },
  user: {
    email: 'demo-cliente@uxea.net',
    name: 'Marta Ruiz',
    password: 'DemoCliente2026!',
  },
  services: [
    {
      code: 'SVC-2026-001',
      category: 'web-design' as const,
      name: 'Web corporativa multi-idioma',
      description: 'Rediseño completo con Next.js, accesibilidad WCAG 2.2 y Core Web Vitals en verde.',
      slaTier: 'gold' as const,
      monthlyFeeCents: 29900,
      startedAt: '2024-01-15',
    },
    {
      code: 'SVC-2026-002',
      category: 'maintenance' as const,
      name: 'Mantenimiento mensual',
      description: 'Hosting gestionado, monitorización 24/7 y bolsa de 10 horas para mejoras.',
      slaTier: 'gold' as const,
      monthlyFeeCents: 49900,
      startedAt: '2024-01-15',
    },
    {
      code: 'SVC-2026-003',
      category: 'seo' as const,
      name: 'SEO técnico y contenidos',
      description: 'Auditoría inicial, optimización on-page, informe mensual y reunión.',
      slaTier: 'silver' as const,
      monthlyFeeCents: 79900,
      startedAt: '2024-04-01',
    },
  ],
};

async function main() {
  const url = process.env.DATABASE_URL!;
  const ssl = url.includes('localhost') ? false : 'require';
  const client = postgres(url, { max: 1, ssl });
  const db = drizzle(client);

  console.log('▸ Seeding demo customer…');

  // 1. Customer (idempotente por CIF)
  const [existingCustomer] = await db
    .select({ id: customers.id })
    .from(customers)
    .where(eq(customers.cif, DEMO.customer.cif))
    .limit(1);

  let customerId: string;
  if (existingCustomer) {
    customerId = existingCustomer.id;
    console.log(`  · Customer ya existía: ${customerId}`);
  } else {
    const [created] = await db
      .insert(customers)
      .values({
        ...DEMO.customer,
        country: 'ES',
        status: 'active',
        brand: 'wyweb',
      })
      .returning({ id: customers.id });
    customerId = created!.id;
    console.log(`  · Customer creado: ${customerId}`);
  }

  // 2. User (idempotente por email)
  const [existingUser] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, DEMO.user.email))
    .limit(1);

  let userId: string;
  if (existingUser) {
    userId = existingUser.id;
    console.log(`  · User ya existía: ${userId}`);
  } else {
    const passwordHash = await hash(DEMO.user.password, {
      algorithm: 2,
      memoryCost: 19456,
      timeCost: 2,
      parallelism: 1,
    });
    const [created] = await db
      .insert(users)
      .values({
        email: DEMO.user.email,
        name: DEMO.user.name,
        role: 'client_admin',
        passwordHash,
        emailVerified: new Date(),
      })
      .returning({ id: users.id });
    userId = created!.id;
    console.log(`  · User creado: ${userId}`);
  }

  // 3. Customer-User pivot (idempotente por PK compuesta)
  const [existingLink] = await db
    .select()
    .from(customerUsers)
    .where(
      and(
        eq(customerUsers.customerId, customerId),
        eq(customerUsers.userId, userId),
      ),
    )
    .limit(1);

  if (!existingLink) {
    await db.insert(customerUsers).values({
      customerId,
      userId,
      customerRole: 'admin',
    });
    console.log('  · Customer-user link creado.');
  } else {
    console.log('  · Customer-user link ya existía.');
  }

  // 4. Services (idempotente por code único)
  for (const svc of DEMO.services) {
    const [existing] = await db
      .select({ id: services.id })
      .from(services)
      .where(eq(services.code, svc.code))
      .limit(1);
    if (existing) {
      console.log(`  · Service ${svc.code} ya existía.`);
      continue;
    }
    await db.insert(services).values({
      ...svc,
      customerId,
      status: 'active',
    });
    console.log(`  · Service ${svc.code} creado.`);
  }

  // 5. Invoices (2: una pagada, una emitida)
  const invoicePlans = [
    {
      number: '2026-A-0014',
      status: 'paid' as const,
      issuedAt: '2026-03-01',
      dueAt: '2026-03-31',
      paidAt: new Date('2026-03-18'),
      lines: [
        {
          description: 'Fibra empresarial 1 Gbps · Marzo 2026',
          unitPriceCents: 29900,
          vatRate: '21.00',
          irpfRate: '0.00',
        },
        {
          description: 'SLA Gold 24/7 · Marzo 2026',
          unitPriceCents: 49900,
          vatRate: '21.00',
          irpfRate: '0.00',
        },
      ],
    },
    {
      number: '2026-A-0019',
      status: 'issued' as const,
      issuedAt: '2026-04-01',
      dueAt: '2026-04-30',
      paidAt: null,
      lines: [
        {
          description: 'Fibra empresarial 1 Gbps · Abril 2026',
          unitPriceCents: 29900,
          vatRate: '21.00',
          irpfRate: '0.00',
        },
        {
          description: 'SLA Gold 24/7 · Abril 2026',
          unitPriceCents: 49900,
          vatRate: '21.00',
          irpfRate: '0.00',
        },
        {
          description: 'Sensórica de planta · Abril 2026',
          unitPriceCents: 79900,
          vatRate: '21.00',
          irpfRate: '0.00',
        },
      ],
    },
  ];

  for (const inv of invoicePlans) {
    const [existing] = await db
      .select({ id: invoices.id })
      .from(invoices)
      .where(eq(invoices.number, inv.number))
      .limit(1);
    if (existing) {
      console.log(`  · Invoice ${inv.number} ya existía.`);
      continue;
    }

    const subtotal = inv.lines.reduce((acc, l) => acc + l.unitPriceCents, 0);
    const vat = Math.round(subtotal * 0.21);
    const irpf = 0;
    const total = subtotal + vat - irpf;

    const [created] = await db
      .insert(invoices)
      .values({
        customerId,
        number: inv.number,
        series: 'A',
        status: inv.status,
        issuedAt: inv.issuedAt,
        dueAt: inv.dueAt,
        paidAt: inv.paidAt,
        subtotalCents: subtotal,
        vatCents: vat,
        irpfCents: irpf,
        totalCents: total,
      })
      .returning({ id: invoices.id });

    if (created) {
      await db.insert(invoiceLines).values(
        inv.lines.map((l, i) => ({
          invoiceId: created.id,
          description: l.description,
          quantity: '1.00',
          unitPriceCents: l.unitPriceCents,
          vatRate: l.vatRate,
          irpfRate: l.irpfRate,
          subtotalCents: l.unitPriceCents,
          sortOrder: i,
        })),
      );
    }
    console.log(`  · Invoice ${inv.number} creada.`);
  }

  // 6. Ticket abierto + 1 mensaje
  const ticketNumber = 'TIC-2026-0042';
  const [existingTicket] = await db
    .select({ id: tickets.id })
    .from(tickets)
    .where(eq(tickets.number, ticketNumber))
    .limit(1);

  if (existingTicket) {
    console.log(`  · Ticket ${ticketNumber} ya existía.`);
  } else {
    const [createdTicket] = await db
      .insert(tickets)
      .values({
        number: ticketNumber,
        customerId,
        openedByUserId: userId,
        subject: 'Caída intermitente en sede principal',
        status: 'in_progress',
        priority: 'high',
      })
      .returning({ id: tickets.id });

    if (createdTicket) {
      await db.insert(ticketMessages).values({
        ticketId: createdTicket.id,
        authorId: userId,
        authorRole: 'client',
        body: 'Esta mañana hemos tenido tres microcortes (~30s cada uno) entre las 09:12 y las 10:05. ¿Podéis revisar?',
      });
    }
    console.log(`  · Ticket ${ticketNumber} creado.`);
  }

  console.log('\n✓ Seed demo completado.\n');
  console.log('Login del cliente demo:');
  console.log(`  email   : ${DEMO.user.email}`);
  console.log(`  password: ${DEMO.user.password}`);
  console.log(`  rol     : client_admin`);
  console.log(`  customer: ${DEMO.customer.legalName} (CIF ${DEMO.customer.cif})`);

  await client.end();
  process.exit(0);
}

main().catch((err) => {
  console.error('✗ Seed falló:', err);
  process.exit(1);
});
