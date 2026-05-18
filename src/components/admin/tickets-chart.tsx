'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type DataPoint = {
  month: string;
  created: number;
  resolved: number;
};

type Props = {
  data: ReadonlyArray<DataPoint>;
};

export function TicketsChart({ data }: Props) {
  const formatted = data.map((d) => ({ ...d, label: formatMonthLabel(d.month) }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={formatted}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="created" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-warning)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--color-warning)" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="resolved" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-success)" stopOpacity={0.4} />
              <stop offset="95%" stopColor="var(--color-success)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="var(--color-border)"
            vertical={false}
          />
          <XAxis
            dataKey="label"
            tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--color-fg-muted)' }}
            tickLine={false}
            axisLine={{ stroke: 'var(--color-border)' }}
          />
          <YAxis
            tick={{ fontSize: 10, fontFamily: 'var(--font-mono)', fill: 'var(--color-fg-muted)' }}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
            width={30}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              borderRadius: 'var(--radius-3)',
              fontFamily: 'var(--font-sans)',
              fontSize: 12,
              padding: '8px 10px',
            }}
            formatter={(value, name) => [
              typeof value === 'number' ? value : Number(value ?? 0),
              name === 'created' ? 'Creados' : 'Resueltos',
            ]}
          />
          <Legend
            wrapperStyle={{
              fontFamily: 'var(--font-mono)',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              paddingTop: 8,
            }}
            formatter={(value) => (value === 'created' ? 'Creados' : 'Resueltos')}
          />
          <Area
            type="monotone"
            dataKey="created"
            stroke="var(--color-warning)"
            strokeWidth={1.5}
            fill="url(#created)"
          />
          <Area
            type="monotone"
            dataKey="resolved"
            stroke="var(--color-success)"
            strokeWidth={1.5}
            fill="url(#resolved)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

function formatMonthLabel(yyyyMM: string): string {
  const [year, month] = yyyyMM.split('-');
  const date = new Date(Number(year), Number(month) - 1, 1);
  return new Intl.DateTimeFormat('es-ES', { month: 'short' })
    .format(date)
    .toUpperCase()
    .replace('.', '');
}
