import { DATASETS } from '@/lib/constants';
import { formatRupiah } from '@/lib/formatters';
import { useStats } from './useStats';
import { StatCard } from './partials/StatCard';
import { DatasetCard } from './partials/DatasetCard';
import { WagePreview } from './partials/WagePreview';
import { PricePreview } from './partials/PricePreview';
import { InflationPreview } from './partials/InflationPreview';
import type { StatSummary } from '@/types';

export function OverviewPage() {
  const { data: statsRes, isLoading } = useStats();
  const stats = statsRes?.data;

  const statCards: StatSummary[] = stats
    ? [
        {
          label: 'UMR Tertinggi',
          value: formatRupiah(stats.max_wage),
          subtext: `Tahun ${stats.wage_year}`,
        },
        {
          label: 'UMR Terendah',
          value: formatRupiah(stats.min_wage),
          subtext: `Tahun ${stats.wage_year}`,
        },
        {
          label: 'Rata-rata UMR',
          value: formatRupiah(stats.avg_wage),
          subtext: `${stats.total_regions} wilayah`,
        },
        {
          label: 'Inflasi YoY',
          value: `${stats.latest_inflation.toFixed(2)}%`,
          subtext: 'Terbaru',
        },
      ]
    : [];

  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <section>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {isLoading
            ? Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border border-stone bg-paper p-4 h-24 animate-pulse" />
              ))
            : statCards.map((stat, index) => (
                <StatCard key={stat.label} stat={stat} index={index} />
              ))}
        </div>
      </section>

      {/* Datasets */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="label">Datasets</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
          {DATASETS.map((dataset, index) => (
            <DatasetCard key={dataset.id} dataset={dataset} index={index} />
          ))}
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-6">
        {/* Left Column - Wages */}
        <div className="lg:col-span-2 space-y-4 lg:space-y-6">
          <WagePreview />
          <PricePreview />
        </div>

        {/* Right Column - Inflation */}
        <div className="space-y-4 lg:space-y-6">
          <InflationPreview />

          {/* Quick Stats */}
          <div className="border border-stone bg-paper p-4 md:p-5">
            <h3 className="label mb-4">Ringkasan</h3>
            <div className="space-y-3 md:space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Total Wilayah</span>
                <span className="font-mono text-ink">{stats?.total_regions ?? '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Provinsi</span>
                <span className="font-mono text-ink">{stats?.total_provinces ?? '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Data UMR</span>
                <span className="font-mono text-ink">{stats?.total_regions ?? '-'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Komoditas</span>
                <span className="font-mono text-ink">{stats?.total_prices ?? '-'}</span>
              </div>
            </div>
          </div>

          {/* Data Sources */}
          <div className="border border-stone bg-paper p-4 md:p-5">
            <h3 className="label mb-4">Sumber Data</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 mt-1.5 bg-accent-brand flex-shrink-0" />
                <div>
                  <span className="text-ink font-medium">BPS</span>
                  <span className="text-muted-foreground ml-1">— Wilayah, Inflasi</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 mt-1.5 bg-accent-brand flex-shrink-0" />
                <div>
                  <span className="text-ink font-medium">Kemnaker</span>
                  <span className="text-muted-foreground ml-1">— UMP, UMK</span>
                </div>
              </div>
              <div className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 mt-1.5 bg-accent-brand flex-shrink-0" />
                <div>
                  <span className="text-ink font-medium">Bank Indonesia</span>
                  <span className="text-muted-foreground ml-1">— Harga Pangan</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
