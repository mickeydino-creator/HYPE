import { Area, AreaChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import type { PricePoint } from '../types';

interface Props {
  data: PricePoint[];
  positive: boolean;
  height?: number;
  interactive?: boolean;
}

export default function PriceChart({ data, positive, height = 48, interactive = false }: Props) {
  const color = positive ? '#1FAE5C' : '#F0483E';
  const gradientId = `grad-${positive ? 'up' : 'down'}-${interactive ? 'lg' : 'sm'}`;

  return (
    <div style={{ width: '100%', height }}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 4, right: 0, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.35} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          {interactive && (
            <XAxis dataKey="t" hide tickLine={false} axisLine={false} />
          )}
          {interactive && <YAxis domain={['auto', 'auto']} hide />}
          {interactive && (
            <Tooltip
              cursor={{ stroke: 'rgba(20,21,31,0.12)', strokeWidth: 1 }}
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const p = payload[0].payload as PricePoint;
                return (
                  <div className="rounded-xl border border-base-border bg-white px-3 py-2 text-xs shadow-card">
                    <div className="font-semibold text-ink-900">{p.p.toFixed(2)} HYPE</div>
                    <div className="text-ink-400">{new Date(p.t).toLocaleString()}</div>
                  </div>
                );
              }}
            />
          )}
          <Area
            type="monotone"
            dataKey="p"
            stroke={color}
            strokeWidth={interactive ? 2.5 : 2}
            fill={`url(#${gradientId})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
