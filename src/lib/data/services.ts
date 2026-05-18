import type { ComponentType, SVGAttributes } from 'react';
import {
  Accessibility,
  BarChart3,
  Box,
  Brush,
  Code2,
  CreditCard,
  Database,
  Gauge,
  Globe2,
  HeartPulse,
  Image as ImageIcon,
  LayoutDashboard,
  Lightbulb,
  Lock,
  MessageSquare,
  Palette,
  Pencil,
  Rocket,
  Search,
  Server,
  ShoppingBag,
  Smartphone,
  Type,
  Users,
  Wrench,
  Zap,
} from 'lucide-react';

export type ServiceSlug =
  | 'diseno-web'
  | 'saas'
  | 'ecommerce'
  | 'seo'
  | 'mantenimiento'
  | 'branding';

export type LucideIcon = ComponentType<
  SVGAttributes<SVGSVGElement> & { strokeWidth?: number }
>;

export type CustomIcon = ComponentType<
  SVGAttributes<SVGSVGElement> & { title?: string }
>;

export type Feature = {
  Icon: LucideIcon;
  title: string;
  description: string;
};

export type Stat = {
  value: string;
  label: string;
};

export type ServiceCase = {
  industry: string;
  customer: string;
  title: string;
  quote: string;
  attribution: { name: string; role: string };
  stats: readonly Stat[];
};

export type Service = {
  slug: ServiceSlug;
  index: string;
  eyebrow: string;
  category: string;
  title: string;
  titleShort: string;
  lead: string;
  description: string;
  Icon: LucideIcon;
  features: readonly Feature[];
  techStack: readonly string[];
  case?: ServiceCase;
  related: readonly ServiceSlug[];
  metadata: {
    title: string;
    description: string;
  };
};

export const services: Record<ServiceSlug, Service> = {
  'diseno-web': {
    slug: 'diseno-web',
    index: '01',
    eyebrow: 'DISEÑO Y DESARROLLO WEB',
    category: 'Diseño web',
    title: 'Webs que se ven bien y rinden mejor.',
    titleShort: 'Diseño web',
    lead: 'Webs corporativas, landings y portales hechos a medida con foco en conversión y rendimiento.',
    description:
      'Diseñamos y construimos cada web desde cero según el negocio que hay detrás. Sin plantillas genéricas: investigación, wireframes, UI propia, código limpio y métricas de Core Web Vitals en verde. Entregamos el código y la documentación; no quedas atado.',
    Icon: LayoutDashboard,
    features: [
      {
        Icon: Pencil,
        title: 'Diseño UI/UX a medida',
        description:
          'Wireframes, prototipo navegable y sistema de diseño propio antes de tocar código.',
      },
      {
        Icon: Code2,
        title: 'Desarrollo limpio',
        description:
          'Next.js + Tailwind. Código tipado, accesible y testado. Sin builders ni plantillas.',
      },
      {
        Icon: Gauge,
        title: 'Core Web Vitals',
        description:
          'LCP < 2.5s, CLS < 0.1, TBT < 200ms medidos antes de entregar. SEO técnico de base.',
      },
      {
        Icon: Accessibility,
        title: 'Accesibilidad WCAG 2.2',
        description:
          'Contraste, navegación por teclado, semántica y ARIA. Auditoría con Lighthouse y manual.',
      },
      {
        Icon: Smartphone,
        title: 'Responsive real',
        description:
          'Mobile-first, breakpoints cuidados. Probada en dispositivos reales, no solo en DevTools.',
      },
      {
        Icon: Globe2,
        title: 'i18n cuando hace falta',
        description:
          'Multi-idioma con rutas localizadas, hreflang y traducciones gestionadas por el cliente.',
      },
    ],
    techStack: [
      'Next.js',
      'React',
      'TypeScript',
      'Tailwind CSS',
      'Vercel',
      'Coolify',
      'Figma',
      'Playwright',
    ],
    case: {
      industry: 'Servicios profesionales',
      customer: 'Despacho legal Méndez & Asociados',
      title: 'Migración de WordPress a Next.js: -68% TTFB y +42% leads orgánicos.',
      quote:
        'Tardábamos seis segundos en cargar. Ahora medio. Los formularios reciben más consultas y dejamos de pagar mantenimiento de plugins que nadie usaba.',
      attribution: { name: 'Carlos Méndez', role: 'Socio · Méndez & Asociados' },
      stats: [
        { value: '0.6s', label: 'TTFB medio' },
        { value: '+42%', label: 'Leads orgánicos' },
        { value: '100', label: 'Lighthouse SEO' },
        { value: '6 sem', label: 'Tiempo de entrega' },
      ],
    },
    related: ['seo', 'mantenimiento'],
    metadata: {
      title: 'Diseño y desarrollo web a medida',
      description:
        'Webs corporativas, landings y portales hechos a medida. Next.js, Tailwind, accesibilidad WCAG y Core Web Vitals en verde.',
    },
  },

  saas: {
    slug: 'saas',
    index: '02',
    eyebrow: 'SAAS Y APLICACIONES A MEDIDA',
    category: 'SaaS',
    title: 'Plataformas web a medida que sustituyen a hojas de cálculo.',
    titleShort: 'SaaS a medida',
    lead: 'Diseñamos y construimos SaaS, paneles internos y portales con autenticación, roles y facturación.',
    description:
      'Si el negocio depende de un Excel compartido, una herramienta interna o un panel de cliente que no existe — lo construimos. Autenticación, RBAC, multi-tenant, facturación, integraciones con tu stack actual. Código tuyo, infraestructura tuya.',
    Icon: Code2,
    features: [
      {
        Icon: Lock,
        title: 'Auth + RBAC',
        description:
          'Login con contraseña, 2FA, magic link y SSO. Roles granulares y auditoría completa.',
      },
      {
        Icon: Users,
        title: 'Multi-tenant',
        description:
          'Cada cliente o equipo aislado. Datos, usuarios y configuración por organización.',
      },
      {
        Icon: Database,
        title: 'Modelo de datos sólido',
        description:
          'PostgreSQL + Drizzle ORM, migraciones versionadas, integridad referencial.',
      },
      {
        Icon: CreditCard,
        title: 'Pagos y suscripciones',
        description:
          'Integración con Stripe o emisión propia. Trial, downgrade, cobros recurrentes.',
      },
      {
        Icon: Zap,
        title: 'API e integraciones',
        description:
          'REST y webhooks para conectar con tu CRM, ERP o herramientas internas existentes.',
      },
      {
        Icon: Server,
        title: 'Despliegue gestionado',
        description:
          'Hetzner + Coolify o tu propio cloud. CI/CD, backups y observabilidad incluidos.',
      },
    ],
    techStack: [
      'Next.js',
      'TypeScript',
      'PostgreSQL',
      'Drizzle ORM',
      'Auth.js',
      'Stripe',
      'Resend',
      'Coolify',
    ],
    related: ['diseno-web', 'mantenimiento'],
    metadata: {
      title: 'SaaS y aplicaciones a medida',
      description:
        'Diseño y desarrollo de SaaS multi-tenant: auth, RBAC, pagos, API y despliegue gestionado en infraestructura propia.',
    },
  },

  ecommerce: {
    slug: 'ecommerce',
    index: '03',
    eyebrow: 'ECOMMERCE',
    category: 'Ecommerce',
    title: 'Tiendas online que cargan rápido y venden de verdad.',
    titleShort: 'Ecommerce',
    lead: 'Tiendas online con pasarela de pago, gestión de stock, envíos y facturación electrónica.',
    description:
      'Construimos tiendas pensadas para el cliente final, no para el comercial que las vende. Catálogo navegable, checkout en una pantalla, pasarelas de pago españolas, integración con plataformas logísticas y conexión con tu ERP o software de facturación.',
    Icon: ShoppingBag,
    features: [
      {
        Icon: Box,
        title: 'Catálogo y stock',
        description:
          'Variantes, atributos, etiquetas y filtros. Sincronización con tu ERP o gestor de inventario.',
      },
      {
        Icon: CreditCard,
        title: 'Pago multipasarela',
        description:
          'Stripe, Redsys, PayPal, Bizum. Suscripciones, pago aplazado y financiación con SeQura/Aplazame.',
      },
      {
        Icon: Globe2,
        title: 'Envíos integrados',
        description:
          'SEUR, Correos Express, MRW, Sending. Tarifas en tiempo real y tracking en la cuenta del cliente.',
      },
      {
        Icon: BarChart3,
        title: 'Analítica de embudo',
        description:
          'Eventos GA4 + servidor, abandonos de carrito, productos top y atribución por canal.',
      },
      {
        Icon: MessageSquare,
        title: 'Atención y reseñas',
        description:
          'Chat embebido, sistema de reseñas con foto y notificaciones de status por email/SMS.',
      },
      {
        Icon: Search,
        title: 'SEO ecommerce',
        description:
          'Datos estructurados producto, hreflang, sitemaps por categoría y URLs canónicas.',
      },
    ],
    techStack: [
      'Next.js',
      'Shopify Hydrogen',
      'Medusa.js',
      'Stripe',
      'Redsys',
      'Algolia',
      'GA4',
      'Sentry',
    ],
    related: ['diseno-web', 'seo'],
    metadata: {
      title: 'Tiendas online — ecommerce a medida',
      description:
        'Ecommerce con pasarela de pago, envíos integrados, analítica de embudo y SEO técnico. Hecho a medida o sobre Shopify/Medusa.',
    },
  },

  seo: {
    slug: 'seo',
    index: '04',
    eyebrow: 'SEO Y RENDIMIENTO',
    category: 'SEO',
    title: 'SEO técnico que mueve la aguja sin trucos.',
    titleShort: 'SEO y rendimiento',
    lead: 'Auditoría técnica, rendimiento web, contenidos optimizados y monitorización mensual.',
    description:
      'No vendemos rankings garantizados ni backlinks dudosos. Auditamos qué frena tu web hoy, lo arreglamos (técnico + contenido) y medimos cada mes. Foco en intención de búsqueda real y conversión, no en vanity metrics.',
    Icon: Search,
    features: [
      {
        Icon: Gauge,
        title: 'Auditoría técnica',
        description:
          'Crawl completo, Core Web Vitals, datos estructurados, indexabilidad. Plan priorizado.',
      },
      {
        Icon: Type,
        title: 'On-page y contenidos',
        description:
          'Titles, descriptions, headings, internal linking. Reescritura basada en intención de búsqueda.',
      },
      {
        Icon: ImageIcon,
        title: 'Optimización de medios',
        description:
          'AVIF/WebP automatizado, lazy loading, dimensiones explícitas y CDN.',
      },
      {
        Icon: BarChart3,
        title: 'Search Console y GSC',
        description:
          'Verificación, sitemap, rich results y cobertura. Alertas cuando algo se rompe.',
      },
      {
        Icon: Lightbulb,
        title: 'Estrategia de keywords',
        description:
          'Análisis competitivo, gap analysis y priorización por volumen × dificultad × intención.',
      },
      {
        Icon: HeartPulse,
        title: 'Monitorización mensual',
        description:
          'Informe con posiciones, tráfico orgánico, conversiones y cambios pendientes. Reunión opcional.',
      },
    ],
    techStack: [
      'Search Console',
      'Ahrefs',
      'Screaming Frog',
      'GA4',
      'Schema.org',
      'Lighthouse',
      'PageSpeed',
      'Cloudflare',
    ],
    related: ['diseno-web', 'ecommerce'],
    metadata: {
      title: 'SEO técnico y rendimiento web',
      description:
        'Auditoría técnica, Core Web Vitals, contenidos optimizados, datos estructurados y monitorización mensual del tráfico orgánico.',
    },
  },

  mantenimiento: {
    slug: 'mantenimiento',
    index: '05',
    eyebrow: 'MANTENIMIENTO Y SOPORTE',
    category: 'Mantenimiento',
    title: 'Tu web no es un proyecto cerrado: es un servicio vivo.',
    titleShort: 'Mantenimiento',
    lead: 'Soporte mensual con SLA, hosting gestionado, mejoras continuas y monitorización 24/7.',
    description:
      'Mantenimiento que no es "te llamamos cuando falla". Hosting gestionado en infraestructura propia, monitorización con alertas, backups verificados, actualizaciones de seguridad y horas mensuales para mejoras sin tener que volver a contratar.',
    Icon: Wrench,
    features: [
      {
        Icon: Server,
        title: 'Hosting gestionado',
        description:
          'VPS propios en Hetzner con Coolify, SSL automático, escalado vertical y monitor de uptime.',
      },
      {
        Icon: HeartPulse,
        title: 'Monitorización 24/7',
        description:
          'Probes externos cada minuto, alertas a nuestro on-call. Llamamos antes que el cliente.',
      },
      {
        Icon: Database,
        title: 'Backups verificados',
        description:
          'Diario incremental + retención 30 días. Restauración probada mensualmente.',
      },
      {
        Icon: Lock,
        title: 'Actualizaciones de seguridad',
        description:
          'Dependencias, OS y certificados. Parches críticos en menos de 48h.',
      },
      {
        Icon: Rocket,
        title: 'Mejoras continuas',
        description:
          'Bolsa de horas mensuales para iterar: nuevas secciones, A/B tests, integraciones.',
      },
      {
        Icon: BarChart3,
        title: 'Informe mensual',
        description:
          'Uptime, tráfico, errores, performance. Y qué se hizo y qué viene el mes siguiente.',
      },
    ],
    techStack: [
      'Coolify',
      'Hetzner',
      'Plausible',
      'Glitchtip',
      'pgBackRest',
      'UptimeRobot',
      'Cloudflare',
      'GitHub Actions',
    ],
    related: ['diseno-web', 'saas'],
    metadata: {
      title: 'Mantenimiento web y soporte mensual',
      description:
        'Hosting gestionado, monitorización 24/7, backups verificados, actualizaciones de seguridad y bolsa de horas para mejoras.',
    },
  },

  branding: {
    slug: 'branding',
    index: '06',
    eyebrow: 'BRANDING E IDENTIDAD VISUAL',
    category: 'Branding',
    title: 'Una identidad visual que aguanta más allá del logo.',
    titleShort: 'Branding',
    lead: 'Naming, logotipo, sistema visual, guidelines y plantillas operativas.',
    description:
      'Construimos identidades que funcionan en la web, en una factura y en una tarjeta. No solo un logo bonito: paleta, tipografía, sistema modular, plantillas de redes sociales y la documentación para que cualquiera en tu equipo la aplique sin que pierda coherencia.',
    Icon: Palette,
    features: [
      {
        Icon: Lightbulb,
        title: 'Naming y posicionamiento',
        description:
          'Investigación de mercado, propuestas evaluadas y verificación de disponibilidad.',
      },
      {
        Icon: Brush,
        title: 'Logotipo + isotipo',
        description:
          'Marca principal, versiones reducidas, monocromos y formato favicon/app icon.',
      },
      {
        Icon: Type,
        title: 'Sistema tipográfico',
        description:
          'Tipos primarias y secundarias con licencia, jerarquía y casos de uso documentados.',
      },
      {
        Icon: ImageIcon,
        title: 'Paleta + estilo gráfico',
        description:
          'Tokens de color (light/dark), tratamiento fotográfico y librería de iconos consistente.',
      },
      {
        Icon: LayoutDashboard,
        title: 'Plantillas operativas',
        description:
          'Carta, factura, presentación, post redes sociales y firma email. Listas para usar.',
      },
      {
        Icon: Pencil,
        title: 'Brand guidelines',
        description:
          'PDF / Notion público con normas de uso. Para que pueda aplicarlo cualquiera del equipo.',
      },
    ],
    techStack: [
      'Figma',
      'Adobe Illustrator',
      'Notion',
      'Google Fonts',
      'Adobe Fonts',
      'Sketch',
    ],
    related: ['diseno-web', 'seo'],
    metadata: {
      title: 'Branding e identidad visual',
      description:
        'Naming, logotipo, sistema visual, guidelines y plantillas operativas. Identidad que aguanta más allá del logo.',
    },
  },
};

export const serviceList = Object.values(services);

export const SERVICE_ICON_MAP = {
  'diseno-web': LayoutDashboard,
  saas: Code2,
  ecommerce: ShoppingBag,
  seo: Search,
  mantenimiento: Wrench,
  branding: Palette,
} satisfies Record<ServiceSlug, LucideIcon>;
