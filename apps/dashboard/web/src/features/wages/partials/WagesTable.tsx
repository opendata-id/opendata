import { Link } from 'react-router-dom';
import { useSnapshot } from 'valtio';
import { ArrowUpDown, ArrowUp, ArrowDown } from 'lucide-react';
import { Sparkline } from '@/components/charts';
import { formatRupiahFull, formatPercent } from '@/lib/formatters';
import { filterState, setSort, toggleSortOrder } from '@/store/filters';
import { useWages } from '../useWages';
import { useStats } from '@/features/overview/useStats';
import { cn } from '@/lib/utils';
import type { WageResponse } from '@/lib/api';

export function WagesTable() {
  const { search, province, sortBy, sortOrder } = useSnapshot(filterState);
  const { data: statsRes } = useStats();
  const avgUmr = statsRes?.data?.avg_wage ?? 0;

  const { data: wagesRes, isLoading } = useWages({
    search: search || undefined,
    province: province || undefined,
    sort_by: sortBy,
    sort_order: sortOrder,
    per_page: 100,
  });

  const filteredWages = wagesRes?.data ?? [];
  const total = wagesRes?.meta?.total ?? 0;

  const handleSort = (column: string) => {
    if (sortBy === column) {
      toggleSortOrder();
    } else {
      setSort(column, 'desc');
    }
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sortBy !== column) {
      return <ArrowUpDown className="w-3 h-3 ml-1 opacity-50" />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUp className="w-3 h-3 ml-1" />
    ) : (
      <ArrowDown className="w-3 h-3 ml-1" />
    );
  };

  return (
    <div className="border border-stone bg-paper overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[640px]">
          <thead>
            <tr className="border-b border-stone bg-stone/30">
              <th className="label text-left px-3 md:px-5 py-3 font-medium w-12">#</th>
              <th className="label text-left px-3 md:px-5 py-3 font-medium">
                <button
                  onClick={() => handleSort('name')}
                  className="flex items-center hover:text-ink transition-colors"
                >
                  Wilayah
                  <SortIcon column="name" />
                </button>
              </th>
              <th className="label text-left px-3 md:px-5 py-3 font-medium">
                <button
                  onClick={() => handleSort('province')}
                  className="flex items-center hover:text-ink transition-colors"
                >
                  Provinsi
                  <SortIcon column="province" />
                </button>
              </th>
              <th className="label text-left px-3 md:px-5 py-3 font-medium w-20">Trend</th>
              <th className="label text-right px-3 md:px-5 py-3 font-medium">
                <button
                  onClick={() => handleSort('umr')}
                  className="flex items-center justify-end w-full hover:text-ink transition-colors"
                >
                  UMR {new Date().getFullYear()}
                  <SortIcon column="umr" />
                </button>
              </th>
              <th className="label text-right px-3 md:px-5 py-3 font-medium w-24">vs Avg</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-3 md:px-5 py-12 text-center text-muted-foreground">
                  Memuat data...
                </td>
              </tr>
            ) : filteredWages.map((wage, index) => (
              <WageRow key={wage.id} wage={wage} index={index} avgUmr={avgUmr} />
            ))}
          </tbody>
        </table>
      </div>

      {!isLoading && filteredWages.length === 0 && (
        <div className="py-12 text-center">
          <p className="text-muted-foreground">Tidak ada data yang sesuai filter</p>
        </div>
      )}

      {/* Footer */}
      <div className="px-3 md:px-5 py-3 border-t border-stone bg-stone/20 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <span className="text-sm text-muted-foreground">
          Menampilkan {filteredWages.length} dari {total} wilayah
        </span>
        <span className="text-sm text-muted-foreground">
          Rata-rata: <span className="font-mono text-ink">{formatRupiahFull(avgUmr)}</span>
        </span>
      </div>
    </div>
  );
}

function WageRow({ wage, index, avgUmr }: { wage: WageResponse; index: number; avgUmr: number }) {
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
      className="border-b border-stone last:border-b-0 hover:bg-stone/20 transition-colors animate-fade-in"
      style={{ animationDelay: `${Math.min(index, 20) * 20}ms` }}
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
      <td className="px-3 md:px-5 py-3 text-sm text-muted-foreground">{wage.province}</td>
      <td className="px-3 md:px-5 py-3">
        <Sparkline data={trend} width={48} height={20} color="accent" />
      </td>
      <td className="px-3 md:px-5 py-3 text-right">
        <span className="font-mono text-sm text-ink">{formatRupiahFull(wage.umr)}</span>
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
}
