import { Sparkline } from '@/components/charts';
import { cn } from '@/lib/utils';
import type { StatSummary } from '@/types';

interface StatCardProps {
  stat: StatSummary;
  index?: number;
}

export function StatCard({ stat, index = 0 }: StatCardProps) {
  return (
    <div
      className="border border-stone bg-paper p-3 md:p-4 animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between gap-2 md:gap-4">
        <div className="flex-1 min-w-0">
          <span className="label">{stat.label}</span>
          <div className="mt-1 flex items-baseline gap-1 md:gap-2">
            <span className="text-lg md:text-2xl font-mono font-medium text-ink truncate">
              {stat.value}
            </span>
            {stat.change !== undefined && (
              <span
                className={cn(
                  'text-xs md:text-sm font-mono flex-shrink-0',
                  stat.change >= 0 ? 'text-positive' : 'text-negative'
                )}
              >
                {stat.change >= 0 ? '+' : ''}
                {stat.change.toFixed(2)}%
              </span>
            )}
          </div>
          {stat.subtext && (
            <span className="mt-1 text-xs md:text-sm text-muted-foreground block">
              {stat.subtext}
            </span>
          )}
        </div>

        {stat.trend && stat.trend.length > 0 && (
          <div className="flex-shrink-0 hidden sm:block">
            <Sparkline
              data={stat.trend}
              width={64}
              height={28}
              color="accent"
              showArea
            />
          </div>
        )}
      </div>
    </div>
  );
}
