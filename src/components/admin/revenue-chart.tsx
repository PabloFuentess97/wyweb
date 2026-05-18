'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

type DataPoint = {
  month: string; // 'YYYY-MM'
  totalCents: number;
  count: number;
};

type Props = {
  data: ReadonlyArray<DataPoint>;
};

export function RevenueChart({ data }: Props) {
  const formatted = data.map((d) => ({
    ...d,
    label: formatMonthLabel(d.month),
    totalEur: d.totalCents / 100,
  }));

  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={formatted}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
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
            tickFormatter={(v) => {
              const n = typeof v === 'number' ? v : Number(v ?? 0);
              return n >= 1000 ? `${(n / 1000).toFixed(0)}k €` : `${n} €`;
            }}
            width={50}
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
            cursor={{ fill: 'var(--color-bg-subtle)' }}
            formatter={(value) => {
              const num = typeof value === 'number' ? value : Number(value ?? 0);
              return [
                new Intl.NumberFormat('es-ES', {
                  style: 'currency',
                  currency: 'EUR',
                  minimumFractionDigits: 2,
                }).format(num),
                'Facturado',
              ];
            }}
          />
          <Bar
            dataKey="totalEur"
            fill="var(--color-accent)"
            radius={[4, 4, 0, 0]}
            maxBarSize={40}
          />
        </BarChart>
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
