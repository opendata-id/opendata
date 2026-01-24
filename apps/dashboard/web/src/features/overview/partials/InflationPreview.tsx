import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Sparkline } from '@/components/charts';
import { useInflation } from '@/features/inflation/useInflation';

const MONTH_NAMES = ['', 'Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];

export function InflationPreview() {
  const { data: inflationRes, isLoading } = useInflation();
  const inflationData = inflationRes?.data ?? [];

  const latestInflation = inflationData[0];
  const headlineTrend = [...inflationData].reverse().slice(-12).map((i) => i.yoy);

  const latestYoY = latestInflation?.yoy ?? 0;
  const latestMtM = latestInflation?.mtm ?? 0;

  if (isLoading) {
    return (
      <div className="border border-stone bg-paper animate-slide-up p-4 md:p-5">
        <div className="h-32 animate-pulse bg-stone/30" />
      </div>
    );
  }

  return (
    <div className="border border-stone bg-paper animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-stone">
        <h2 className="font-serif text-base md:text-lg text-ink">Inflasi YoY</h2>
        <Link
          to="/inflation"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-accent-brand transition-colors"
        >
          Detail
          <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
        </Link>
      </div>

      {/* Content */}
      <div className="p-4 md:p-5">
        {/* Main chart */}
        <div className="flex items-end justify-between gap-3 md:gap-4 mb-4 md:mb-6">
          <div>
            <span className="label">
              {latestInflation ? `${MONTH_NAMES[latestInflation.month]} ${latestInflation.year}` : '-'}
            </span>
            <div className="mt-1 flex items-baseline gap-2">
              <span className="text-2xl md:text-3xl font-mono font-medium text-ink">
                {latestYoY.toFixed(2)}%
              </span>
              <span className="text-sm text-muted-foreground">YoY</span>
            </div>
          </div>
          {headlineTrend.length > 0 && (
            <Sparkline
              data={headlineTrend}
              width={100}
              height={36}
              color="accent"
              showArea
            />
          )}
        </div>

        {/* Categories */}
        <div className="grid grid-cols-2 gap-3 md:gap-4 pt-3 md:pt-4 border-t border-stone">
          <div>
            <span className="label">YoY</span>
            <span className="block mt-1 font-mono text-base md:text-lg text-ink">
              {latestYoY.toFixed(2)}%
            </span>
          </div>
          <div>
            <span className="label">MtM</span>
            <span className="block mt-1 font-mono text-base md:text-lg text-ink">
              {latestMtM.toFixed(2)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
