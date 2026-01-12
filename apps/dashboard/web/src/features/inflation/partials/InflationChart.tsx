import {
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  ComposedChart,
  Line,
} from 'recharts';
import { useInflation } from '../useInflation';

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;

  return (
    <div className="bg-ink text-paper px-3 py-2 shadow-lg text-sm">
      <div className="font-medium mb-1">{label}</div>
      <div className="space-y-0.5 font-mono text-xs">
        {payload.map((entry: any) => (
          <div key={entry.name} className="flex justify-between gap-4">
            <span style={{ color: entry.color }}>{entry.name}</span>
            <span>{entry.value.toFixed(2)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};

export function InflationChart() {
  const { data: inflationRes, isLoading } = useInflation();
  const inflationData = inflationRes?.data ?? [];

  const chartData = [...inflationData]
    .reverse()
    .slice(-12)
    .map((d) => ({
      month: `${MONTH_NAMES[d.month]} ${d.year}`,
      yoy: d.yoy,
      mtm: d.mtm,
    }));

  if (isLoading || chartData.length === 0) {
    return (
      <div className="border border-stone bg-paper p-5 h-80 flex items-center justify-center">
        <span className="text-muted-foreground">Memuat data...</span>
      </div>
    );
  }

  return (
    <div className="border border-stone bg-paper p-5">
      {/* Legend */}
      <div className="flex items-center gap-6 mb-4">
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-[#0d7377]" />
          <span className="text-sm text-muted-foreground">YoY</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-0.5 bg-[#6b6b6b]" />
          <span className="text-sm text-muted-foreground">MtM</span>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="yoyGradient" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#0d7377" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#0d7377" stopOpacity={0} />
            </linearGradient>
          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="#e8e6e3"
            vertical={false}
          />

          <XAxis
            dataKey="month"
            axisLine={{ stroke: '#e8e6e3' }}
            tickLine={{ stroke: '#e8e6e3' }}
            tick={{ fill: '#6b6b6b', fontSize: 11, fontFamily: 'DM Sans' }}
          />

          <YAxis
            axisLine={{ stroke: '#e8e6e3' }}
            tickLine={{ stroke: '#e8e6e3' }}
            tick={{ fill: '#6b6b6b', fontSize: 11, fontFamily: 'JetBrains Mono' }}
            tickFormatter={(value) => `${value}%`}
            domain={['auto', 'auto']}
          />

          <Tooltip
            content={<CustomTooltip />}
            cursor={{ stroke: '#0d7377', strokeDasharray: '4 4', strokeOpacity: 0.5 }}
          />

          <Area
            type="monotone"
            dataKey="yoy"
            stroke="none"
            fill="url(#yoyGradient)"
            animationDuration={800}
          />

          <Line
            type="monotone"
            dataKey="yoy"
            name="YoY"
            stroke="#0d7377"
            strokeWidth={2}
            dot={{ fill: '#0d7377', r: 3 }}
            activeDot={{ fill: '#0d7377', r: 6, stroke: '#fff', strokeWidth: 2 }}
            animationDuration={1000}
          />

          <Line
            type="monotone"
            dataKey="mtm"
            name="MtM"
            stroke="#6b6b6b"
            strokeWidth={1.5}
            strokeDasharray="2 2"
            dot={{ fill: '#6b6b6b', r: 2 }}
            activeDot={{ fill: '#6b6b6b', r: 5, stroke: '#fff', strokeWidth: 2 }}
            animationDuration={1000}
            animationBegin={200}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
