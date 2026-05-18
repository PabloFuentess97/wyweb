/**
 * Mappings centralizados estado → variante visual.
 * Garantizan que el mismo estado se pinta igual en todo el producto.
 */

export const TICKET_STATUS_LABEL: Record<
  'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed',
  string
> = {
  open: 'Abierto',
  in_progress: 'En proceso',
  waiting_customer: 'Esperando',
  resolved: 'Resuelto',
  closed: 'Cerrado',
};

export const TICKET_STATUS_BADGE: Record<
  'open' | 'in_progress' | 'waiting_customer' | 'resolved' | 'closed',
  'info' | 'warning' | 'default' | 'success' | 'outline'
> = {
  open: 'info',
  in_progress: 'warning',
  waiting_customer: 'default',
  resolved: 'success',
  closed: 'outline',
};

export const PRIORITY_LABEL: Record<
  'low' | 'normal' | 'high' | 'critical',
  string
> = {
  low: 'Baja',
  normal: 'Normal',
  high: 'Alta',
  critical: 'Crítica',
};

export const PRIORITY_BADGE: Record<
  'low' | 'normal' | 'high' | 'critical',
  'outline' | 'default' | 'warning' | 'danger'
> = {
  low: 'outline',
  normal: 'default',
  high: 'warning',
  critical: 'danger',
};

export const INVOICE_STATUS_LABEL: Record<
  'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled',
  string
> = {
  draft: 'Borrador',
  issued: 'Emitida',
  paid: 'Pagada',
  overdue: 'Vencida',
  cancelled: 'Cancelada',
};

export const INVOICE_STATUS_BADGE: Record<
  'draft' | 'issued' | 'paid' | 'overdue' | 'cancelled',
  'outline' | 'info' | 'success' | 'danger' | 'default'
> = {
  draft: 'outline',
  issued: 'info',
  paid: 'success',
  overdue: 'danger',
  cancelled: 'default',
};

export const SERVICE_STATUS_LABEL: Record<
  'active' | 'pending' | 'suspended' | 'terminated',
  string
> = {
  active: 'Activo',
  pending: 'Pendiente',
  suspended: 'Suspendido',
  terminated: 'Terminado',
};

export const SERVICE_STATUS_BADGE: Record<
  'active' | 'pending' | 'suspended' | 'terminated',
  'success' | 'warning' | 'danger' | 'outline'
> = {
  active: 'success',
  pending: 'warning',
  suspended: 'danger',
  terminated: 'outline',
};

export const SLA_TIER_LABEL: Record<
  'none' | 'bronze' | 'silver' | 'gold' | 'platinum',
  string
> = {
  none: 'Sin SLA',
  bronze: 'Bronze',
  silver: 'Silver',
  gold: 'Gold',
  platinum: 'Platinum',
};

export const SERVICE_CATEGORY_LABEL: Record<
  'web-design' | 'saas' | 'ecommerce' | 'seo' | 'maintenance' | 'branding',
  string
> = {
  'web-design': 'Diseño web',
  saas: 'SaaS a medida',
  ecommerce: 'Ecommerce',
  seo: 'SEO',
  maintenance: 'Mantenimiento',
  branding: 'Branding',
};

export const LEAD_STATUS_LABEL: Record<
  'new' | 'contacted' | 'qualified' | 'converted' | 'discarded',
  string
> = {
  new: 'Nuevo',
  contacted: 'Contactado',
  qualified: 'Cualificado',
  converted: 'Convertido',
  discarded: 'Descartado',
};

export const LEAD_STATUS_BADGE: Record<
  'new' | 'contacted' | 'qualified' | 'converted' | 'discarded',
  'info' | 'warning' | 'accent' | 'success' | 'outline'
> = {
  new: 'info',
  contacted: 'warning',
  qualified: 'accent',
  converted: 'success',
  discarded: 'outline',
};
