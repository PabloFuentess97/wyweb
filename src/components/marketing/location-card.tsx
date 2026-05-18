import { ArrowUpRight, Clock, Mail, MapPin, Phone } from 'lucide-react';

type Props = {
  city: string;
  /** Texto de provincia / región en mono. */
  region?: string;
  addressLines: readonly string[];
  /** Coordenadas decimales (lat, lng). */
  coordinates: { lat: number; lng: number };
  hours?: string;
  email?: string;
  phone?: string;
  /** URL externa para "ver en mapa". */
  mapUrl?: string;
};

/**
 * Card de ubicación. Sin iframe externo: representación abstracta del lugar
 * con coordenadas, dirección, horario y CTA a un mapa real (Google/OSM).
 */
export function LocationCard({
  city,
  region,
  addressLines,
  coordinates,
  hours,
  email,
  phone,
  mapUrl,
}: Props) {
  return (
    <article className="grid grid-cols-1 lg:grid-cols-12 rounded-[var(--radius-card)] border border-[var(--color-border)] bg-[var(--color-surface)] overflow-hidden">
      {/* Mapa abstracto */}
      <div className="lg:col-span-6 relative aspect-[4/3] lg:aspect-auto bg-[var(--color-bg-subtle)] border-b lg:border-b-0 lg:border-r border-[var(--color-border)] overflow-hidden">
        <AbstractMap />
        <div className="absolute top-4 left-4 flex items-center gap-2 px-2.5 py-1 rounded-[var(--radius-2)] bg-[var(--color-surface)] border border-[var(--color-border)]">
          <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)] animate-pulse" />
          <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold">
            SEDE PRINCIPAL
          </span>
        </div>
        <div className="absolute bottom-4 left-4 right-4 flex flex-col gap-1.5">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-subtle)] font-semibold">
            COORD · WGS84
          </p>
          <p className="font-mono text-sm tnum text-[var(--color-fg-strong)]">
            {coordinates.lat.toFixed(4)}° N · {Math.abs(coordinates.lng).toFixed(4)}°{' '}
            {coordinates.lng < 0 ? 'W' : 'E'}
          </p>
        </div>
      </div>

      {/* Info */}
      <div className="lg:col-span-6 p-6 md:p-8 flex flex-col gap-5">
        <header className="flex flex-col gap-1">
          <p className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-accent)] font-semibold">
            {region ?? 'ANDALUCÍA · ESPAÑA'}
          </p>
          <h3 className="text-3xl md:text-4xl font-semibold tracking-[-0.025em] text-[var(--color-fg-strong)] leading-tight">
            {city}
          </h3>
        </header>

        <div className="grid grid-cols-1 gap-4 border-t border-[var(--color-border)] pt-5">
          <Row icon={<MapPin strokeWidth={1.5} />} label="Dirección">
            {addressLines.map((l, i) => (
              <span key={i} className="block">
                {l}
              </span>
            ))}
          </Row>
          {hours && (
            <Row icon={<Clock strokeWidth={1.5} />} label="Horario">
              {hours}
            </Row>
          )}
          {email && (
            <Row icon={<Mail strokeWidth={1.5} />} label="Email">
              <a
                href={`mailto:${email}`}
                className="text-[var(--color-fg-strong)] hover:text-[var(--color-accent)] transition-colors"
              >
                {email}
              </a>
            </Row>
          )}
          {phone && (
            <Row icon={<Phone strokeWidth={1.5} />} label="Teléfono">
              <a
                href={`tel:${phone.replace(/\s+/g, '')}`}
                className="text-[var(--color-fg-strong)] hover:text-[var(--color-accent)] transition-colors"
              >
                {phone}
              </a>
            </Row>
          )}
        </div>

        {mapUrl && (
          <a
            href={mapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] hover:underline underline-offset-4 mt-2"
          >
            Abrir en OpenStreetMap
            <ArrowUpRight className="h-3.5 w-3.5" strokeWidth={1.5} />
          </a>
        )}
      </div>
    </article>
  );
}

function Row({
  icon,
  label,
  children,
}: {
  icon: React.ReactNode;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex gap-3">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[var(--radius-2)] border border-[var(--color-border)] text-[var(--color-fg-muted)] [&_svg]:h-3.5 [&_svg]:w-3.5">
        {icon}
      </span>
      <div className="flex flex-col gap-0.5 min-w-0">
        <span className="font-mono text-[10px] uppercase tracking-[0.16em] text-[var(--color-fg-muted)] font-semibold">
          {label}
        </span>
        <span className="text-sm text-[var(--color-fg)] leading-relaxed">{children}</span>
      </div>
    </div>
  );
}

/**
 * Representación visual abstracta del lugar — no un mapa real, una estilización
 * de tres calles que se cruzan sobre un grid hairline, con un punto sobre el centro.
 */
function AbstractMap() {
  return (
    <svg
      viewBox="0 0 480 360"
      className="absolute inset-0 w-full h-full"
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="loc-grid" width="20" height="20" patternUnits="userSpaceOnUse">
          <path
            d="M 20 0 L 0 0 0 20"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="0.5"
          />
        </pattern>
      </defs>
      <rect width="480" height="360" fill="url(#loc-grid)" />

      {/* Roads: subtle wide lines with double thinner lines on top */}
      <g
        stroke="var(--color-border-strong)"
        strokeWidth="14"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M 20 110 Q 180 130 280 200 T 460 290" />
        <path d="M 60 340 Q 200 240 240 180 T 420 40" />
        <path d="M 0 230 Q 120 220 240 180 T 480 130" />
      </g>
      <g
        stroke="var(--color-bg-subtle)"
        strokeWidth="10"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M 20 110 Q 180 130 280 200 T 460 290" />
        <path d="M 60 340 Q 200 240 240 180 T 420 40" />
        <path d="M 0 230 Q 120 220 240 180 T 480 130" />
      </g>

      {/* Buildings (subtle blocks) */}
      <g fill="var(--color-bg)" stroke="var(--color-border)" strokeWidth="0.5">
        <rect x="80" y="60" width="40" height="30" rx="1" />
        <rect x="140" y="80" width="50" height="40" rx="1" />
        <rect x="350" y="60" width="40" height="40" rx="1" />
        <rect x="80" y="270" width="60" height="40" rx="1" />
        <rect x="200" y="280" width="40" height="30" rx="1" />
        <rect x="350" y="250" width="60" height="60" rx="1" />
        <rect x="320" y="160" width="40" height="30" rx="1" />
      </g>

      {/* Pin: concentric rings + dot */}
      <g transform="translate(240,180)">
        <circle r="40" fill="var(--color-accent)" opacity="0.08">
          <animate
            attributeName="r"
            values="30;50;30"
            dur="3s"
            repeatCount="indefinite"
          />
          <animate
            attributeName="opacity"
            values="0.12;0.04;0.12"
            dur="3s"
            repeatCount="indefinite"
          />
        </circle>
        <circle
          r="14"
          fill="none"
          stroke="var(--color-accent)"
          strokeWidth="1.5"
          opacity="0.6"
        />
        <circle r="6" fill="var(--color-accent)" />
        <circle r="2" fill="var(--color-bg)" />
      </g>
    </svg>
  );
}
