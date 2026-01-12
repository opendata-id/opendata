import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Sparkline } from '@/components/charts';
import { formatRupiah, formatPercent } from '@/lib/formatters';
import { useTopWages } from '@/features/wages/useWages';
import { useStats } from '../useStats';
import { cn } from '@/lib/utils';

export function WagePreview() {
  const { data: wagesRes, isLoading } = useTopWages(5);
  const { data: statsRes } = useStats();
  const topWages = wagesRes?.data ?? [];
  const avgUmr = statsRes?.data?.avg_wage ?? 0;

  return (
    <div className="border border-stone bg-paper animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-stone">
        <div className="flex items-center gap-2 md:gap-3">
          <h2 className="font-serif text-base md:text-lg text-ink">Upah Minimum 2025</h2>
          <span className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-accent-light text-accent-brand text-xs font-medium">
            <span className="w-1.5 h-1.5 bg-accent-brand animate-pulse-slow" />
            Live
          </span>
        </div>
        <Link
          to="/wages"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-accent-brand transition-colors"
        >
          <span className="hidden sm:inline">Lihat semua</span>
          <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
        </Link>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[540px]">
          <thead>
            <tr className="border-b border-stone">
              <th className="label text-left px-3 md:px-5 py-2 font-medium">#</th>
              <th className="label text-left px-3 md:px-5 py-2 font-medium">Wilayah</th>
              <th className="label text-left px-3 md:px-5 py-2 font-medium">Provinsi</th>
              <th className="label text-left px-3 md:px-5 py-2 font-medium">Trend</th>
              <th className="label text-right px-3 md:px-5 py-2 font-medium">UMR</th>
              <th className="label text-right px-3 md:px-5 py-2 font-medium">vs Avg</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-3 md:px-5 py-8 text-center text-muted-foreground">
                  Memuat data...
                </td>
              </tr>
            ) : topWages.map((wage, index) => {
              const vsAvg = avgUmr ? ((wage.umr - avgUmr) / avgUmr) * 100 : 0;
              const trend = [
                wage.umr * 0.85,
                wage.umr * 0.88,
                wage.umr * 0.92,
                wage.umr * 0.95,
                wage.umr * 0.98,
                wage.umr,
              ];

              return (
                <tr
                  key={wage.id}
                  className="border-b border-stone last:border-b-0 hover:bg-stone/30 transition-colors"
                >
                  <td className="px-3 md:px-5 py-3 text-sm text-muted-foreground font-mono">
                    {index + 1}
                  </td>
                  <td className="px-3 md:px-5 py-3">
                    <Link
                      to={`/wages/${wage.region_id}`}
                      className="text-sm font-medium text-ink hover:text-accent-brand transition-colors"
                    >
                      {wage.region}
                    </Link>
                  </td>
                  <td className="px-3 md:px-5 py-3 text-sm text-muted-foreground">
                    {wage.province}
                  </td>
                  <td className="px-3 md:px-5 py-3">
                    <Sparkline data={trend} width={48} height={20} color="accent" />
                  </td>
                  <td className="px-3 md:px-5 py-3 text-right">
                    <span className="font-mono text-sm text-ink">
                      {formatRupiah(wage.umr)}
                    </span>
                  </td>
                  <td className="px-3 md:px-5 py-3 text-right">
                    <span
                      className={cn(
                        'font-mono text-sm',
                        vsAvg >= 0 ? 'text-positive' : 'text-negative'
                      )}
                    >
                      {formatPercent(vsAvg)}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
