import { useInflation } from './useInflation';
import { InflationChart } from './partials/InflationChart';

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

export function InflationPage() {
  const { data: inflationRes, isLoading } = useInflation();
  const inflationData = inflationRes?.data ?? [];
  const latestInflation = inflationData[0];

  if (isLoading) {
    return (
      <div className="space-y-4 md:space-y-6">
        <div className="h-8 w-64 bg-stone/30 animate-pulse" />
        <div className="grid grid-cols-2 gap-3 md:gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <div key={i} className="border border-stone bg-paper p-4 h-24 animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm md:text-base text-muted-foreground">
          Data inflasi bulanan year-on-year dari Badan Pusat Statistik (BPS).
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:gap-4">
        <div className="border border-stone bg-paper p-3 md:p-4">
          <span className="label">YoY (Tahunan)</span>
          <span className="block mt-1 font-mono text-xl md:text-2xl text-ink">
            {latestInflation?.yoy.toFixed(2) ?? '-'}%
          </span>
          <span className="text-xs md:text-sm text-muted-foreground">
            {latestInflation ? `${MONTH_NAMES[latestInflation.month]} ${latestInflation.year}` : '-'}
          </span>
        </div>
        <div className="border border-stone bg-paper p-3 md:p-4">
          <span className="label">MtM (Bulanan)</span>
          <span className="block mt-1 font-mono text-xl md:text-2xl text-ink">
            {latestInflation?.mtm.toFixed(2) ?? '-'}%
          </span>
          <span className="text-xs md:text-sm text-muted-foreground">Perubahan bulan lalu</span>
        </div>
      </div>

      {/* Chart */}
      <InflationChart />

      {/* Data Table */}
      <div className="border border-stone bg-paper overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[320px]">
            <thead>
              <tr className="border-b border-stone bg-stone/30">
                <th className="label text-left px-3 md:px-5 py-3 font-medium">Bulan</th>
                <th className="label text-right px-3 md:px-5 py-3 font-medium">YoY</th>
                <th className="label text-right px-3 md:px-5 py-3 font-medium">MtM</th>
              </tr>
            </thead>
            <tbody>
              {inflationData.map((row) => (
                <tr
                  key={`${row.month}-${row.year}`}
                  className="border-b border-stone last:border-b-0 hover:bg-stone/20 transition-colors"
                >
                  <td className="px-3 md:px-5 py-3 text-sm text-ink">
                    {MONTH_NAMES[row.month]} {row.year}
                  </td>
                  <td className="px-3 md:px-5 py-3 text-right font-mono text-sm text-ink">
                    {row.yoy.toFixed(2)}%
                  </td>
                  <td className="px-3 md:px-5 py-3 text-right font-mono text-sm text-muted-foreground">
                    {row.mtm >= 0 ? '+' : ''}{row.mtm.toFixed(2)}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
