/**
 * SLA helpers — tiempos de primera respuesta por tier.
 * Reflejan los compromisos del blueprint:
 *  - Bronze:  8h
 *  - Silver:  4h
 *  - Gold:    2h
 *  - Platinum: 30 min
 *
 * Para simplificar V1 no consideramos horario laboral; calendario natural.
 */

export type SlaTier = 'none' | 'bronze' | 'silver' | 'gold' | 'platinum';

export const SLA_RESPONSE_HOURS: Record<SlaTier, number | null> = {
  none: null,
  bronze: 8,
  silver: 4,
  gold: 2,
  platinum: 0.5,
};

export const SLA_RESOLUTION_HOURS: Record<SlaTier, number | null> = {
  none: null,
  bronze: 24,
  silver: 24,
  gold: 12,
  platinum: 4,
};

/** Calcula `slaDueAt` para primera respuesta dado un tier y fecha de apertura. */
export function computeSlaDueAt(tier: SlaTier, openedAt: Date): Date | null {
  const hours = SLA_RESPONSE_HOURS[tier];
  if (hours === null) return null;
  return new Date(openedAt.getTime() + hours * 60 * 60 * 1000);
}

export type SlaState = {
  tier: SlaTier;
  dueAt: Date | null;
  /** Tiempo restante en ms. Negativo si vencido. */
  remainingMs: number | null;
  /** Estado visual: ok / risk (<25%) / breach. */
  state: 'ok' | 'risk' | 'breach' | 'none';
  /** Etiqueta en formato "X h Y m" o "VENCIDO HACE Z". */
  label: string;
};

export function computeSlaState(
  tier: SlaTier,
  slaDueAt: Date | null,
  firstResponseAt: Date | null,
): SlaState {
  if (tier === 'none' || !slaDueAt) {
    return { tier, dueAt: null, remainingMs: null, state: 'none', label: 'SIN SLA' };
  }
  if (firstResponseAt) {
    return {
      tier,
      dueAt: slaDueAt,
      remainingMs: 0,
      state: 'ok',
      label: 'RESPONDIDO',
    };
  }
  const now = Date.now();
  const remainingMs = slaDueAt.getTime() - now;

  const total = SLA_RESPONSE_HOURS[tier]! * 60 * 60 * 1000;
  const elapsed = total - remainingMs;
  const fractionUsed = elapsed / total;

  if (remainingMs <= 0) {
    return {
      tier,
      dueAt: slaDueAt,
      remainingMs,
      state: 'breach',
      label: `VENCIDO ${formatDurationShort(-remainingMs)} ATRÁS`,
    };
  }
  return {
    tier,
    dueAt: slaDueAt,
    remainingMs,
    state: fractionUsed > 0.75 ? 'risk' : 'ok',
    label: `${formatDurationShort(remainingMs)} RESTANTES`,
  };
}

export function formatDurationShort(ms: number): string {
  const abs = Math.abs(ms);
  const minutes = Math.floor(abs / 60000);
  if (minutes < 60) return `${minutes} M`;
  const hours = Math.floor(minutes / 60);
  const remMin = minutes % 60;
  if (hours < 24) return remMin > 0 ? `${hours}H ${remMin}M` : `${hours}H`;
  const days = Math.floor(hours / 24);
  const remHours = hours % 24;
  return remHours > 0 ? `${days}D ${remHours}H` : `${days}D`;
}
