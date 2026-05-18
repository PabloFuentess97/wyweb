import { cn } from '@/lib/utils';

type Props = React.SVGAttributes<SVGSVGElement>;

/**
 * Visualización SVG de una red de nodos interconectados.
 * Decorativa: aria-hidden, anima de forma muy sutil, respeta prefers-reduced-motion (en globals.css).
 * Se usa en el hero de la home y otros heroes editoriales.
 */
export function ConnectedNodes({ className, ...props }: Props) {
  type Node = {
    id: string;
    x: number;
    y: number;
    r: number;
    primary?: boolean;
  };
  const nodes: readonly Node[] = [
    { id: 'a', x: 240, y: 200, r: 8, primary: true },
    { id: 'b', x: 100, y: 90, r: 5 },
    { id: 'c', x: 380, y: 110, r: 5 },
    { id: 'd', x: 60, y: 260, r: 4 },
    { id: 'e', x: 420, y: 280, r: 4 },
    { id: 'f', x: 160, y: 380, r: 5 },
    { id: 'g', x: 320, y: 400, r: 4 },
    { id: 'h', x: 200, y: 60, r: 3 },
    { id: 'i', x: 440, y: 200, r: 3 },
  ];

  const edges: Array<[string, string]> = [
    ['a', 'b'],
    ['a', 'c'],
    ['a', 'd'],
    ['a', 'e'],
    ['a', 'f'],
    ['a', 'g'],
    ['b', 'h'],
    ['c', 'h'],
    ['c', 'i'],
    ['e', 'i'],
    ['d', 'f'],
    ['e', 'g'],
  ];

  const nodeById = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const animatedEdges = ['a-b', 'a-c', 'a-e', 'c-i'];

  return (
    <svg
      viewBox="0 0 480 480"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
      role="presentation"
      className={cn('block w-full h-auto', className)}
      {...props}
    >
      {/* Hairline grid hint */}
      <defs>
        <pattern id="cn-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path
            d="M 40 0 L 0 0 0 40"
            fill="none"
            stroke="var(--color-border)"
            strokeWidth="0.5"
          />
        </pattern>
        <radialGradient id="cn-fade" cx="50%" cy="50%" r="60%">
          <stop offset="0%" stopColor="black" stopOpacity="1" />
          <stop offset="100%" stopColor="black" stopOpacity="0" />
        </radialGradient>
        <mask id="cn-mask">
          <rect width="480" height="480" fill="url(#cn-fade)" />
        </mask>
      </defs>

      <rect width="480" height="480" fill="url(#cn-grid)" mask="url(#cn-mask)" />

      {/* Edges */}
      <g stroke="var(--color-border-strong)" strokeWidth="1" fill="none">
        {edges.map(([from, to]) => {
          const a = nodeById[from];
          const b = nodeById[to];
          if (!a || !b) return null;
          return (
            <line
              key={`${from}-${to}`}
              x1={a.x}
              y1={a.y}
              x2={b.x}
              y2={b.y}
              opacity={0.7}
            />
          );
        })}
      </g>

      {/* Animated dots along select edges */}
      <g fill="var(--color-accent)">
        {edges
          .filter(([from, to]) => animatedEdges.includes(`${from}-${to}`))
          .map(([from, to], i) => {
            const a = nodeById[from];
            const b = nodeById[to];
            if (!a || !b) return null;
            const dur = 3 + i * 0.7;
            return (
              <circle key={`d-${from}-${to}`} r="2.5" opacity="0.9">
                <animate
                  attributeName="cx"
                  values={`${a.x};${b.x};${a.x}`}
                  dur={`${dur}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="cy"
                  values={`${a.y};${b.y};${a.y}`}
                  dur={`${dur}s`}
                  repeatCount="indefinite"
                />
                <animate
                  attributeName="opacity"
                  values="0;0.9;0.9;0"
                  dur={`${dur}s`}
                  repeatCount="indefinite"
                />
              </circle>
            );
          })}
      </g>

      {/* Nodes */}
      <g>
        {nodes.map((n) => (
          <g key={n.id}>
            {n.primary && (
              <>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.r * 2.4}
                  fill="var(--color-accent)"
                  opacity="0.12"
                >
                  <animate
                    attributeName="r"
                    values={`${n.r * 2};${n.r * 3};${n.r * 2}`}
                    dur="3s"
                    repeatCount="indefinite"
                  />
                  <animate
                    attributeName="opacity"
                    values="0.18;0.05;0.18"
                    dur="3s"
                    repeatCount="indefinite"
                  />
                </circle>
                <circle
                  cx={n.x}
                  cy={n.y}
                  r={n.r * 1.6}
                  fill="none"
                  stroke="var(--color-accent)"
                  strokeWidth="0.8"
                  opacity="0.4"
                />
              </>
            )}
            <circle
              cx={n.x}
              cy={n.y}
              r={n.r}
              fill={n.primary ? 'var(--color-accent)' : 'var(--color-fg-strong)'}
              stroke="var(--color-bg)"
              strokeWidth="1.5"
            />
          </g>
        ))}
      </g>

      {/* Mono labels */}
      <g
        fill="var(--color-fg-subtle)"
        fontFamily="var(--font-mono)"
        fontSize="9"
        fontWeight="500"
        letterSpacing="1.6"
        textAnchor="middle"
      >
        <text x="240" y="225" fill="var(--color-fg-strong)" fontSize="10">
          NODE · CORE
        </text>
        <text x="100" y="105">
          GRA-01
        </text>
        <text x="380" y="125">
          MAD-04
        </text>
        <text x="60" y="275">
          SVQ-02
        </text>
        <text x="420" y="295">
          BCN-03
        </text>
      </g>
    </svg>
  );
}
