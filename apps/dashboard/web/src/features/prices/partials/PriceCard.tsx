import { Sparkline } from '@/components/charts';
import type { PriceResponse } from '@/lib/api';

interface PriceCardProps {
  price: PriceResponse;
  index?: number;
}

export function PriceCard({ price, index = 0 }: PriceCardProps) {
  const trend = [
    price.price * 0.95,
    price.price * 0.97,
    price.price * 0.99,
    price.price * 1.01,
    price.price * 0.98,
    price.price,
  ];

  return (
    <div
      className="border border-stone bg-paper p-3 md:p-4 hover:border-accent-brand transition-colors animate-slide-up"
      style={{ animationDelay: `${Math.min(index, 20) * 30}ms` }}
    >
      <div className="flex items-start justify-between gap-2 md:gap-3">
        <div className="flex-1 min-w-0">
          <span className="label">{price.market_type || 'Nasional'}</span>
          <h3 className="mt-1 text-sm font-medium text-ink truncate">
            {price.commodity}
          </h3>
        </div>
        <Sparkline data={trend} width={48} height={20} color="accent" />
      </div>

      <div className="mt-3 md:mt-4 flex items-end justify-between">
        <div>
          <span className="font-mono text-lg md:text-xl text-ink">
            {price.price.toLocaleString('id-ID')}
          </span>
          <span className="text-xs md:text-sm text-muted-foreground ml-1">/{price.unit}</span>
        </div>
      </div>
    </div>
  );
}
