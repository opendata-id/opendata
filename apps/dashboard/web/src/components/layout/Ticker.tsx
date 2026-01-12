import { MOCK_PRICES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function Ticker() {
  const prices = MOCK_PRICES;

  return (
    <div className="h-[var(--ticker-height)] bg-ink text-paper flex items-center overflow-hidden">
      {/* Label */}
      <div className="flex-shrink-0 h-full px-4 flex items-center bg-accent-brand">
        <span className="text-xs font-medium uppercase tracking-wider">
          Harga Pangan
        </span>
      </div>

      {/* Ticker content */}
      <div className="flex-1 overflow-hidden relative">
        <div className="animate-ticker flex whitespace-nowrap">
          {/* Duplicate content for seamless loop */}
          {[...prices, ...prices].map((item, index) => (
            <span
              key={`${item.id}-${index}`}
              className="inline-flex items-center gap-2 px-4 border-r border-white/10"
            >
              <span className="text-sm text-white/70">{item.commodity}</span>
              <span className="text-sm font-mono font-medium">
                Rp {item.price.toLocaleString('id-ID')}
              </span>
              <span className="text-xs text-white/50">/{item.unit}</span>
              {item.change !== undefined && item.change !== 0 && (
                <span
                  className={cn(
                    'text-xs font-mono',
                    item.change > 0 ? 'text-red-400' : 'text-emerald-400'
                  )}
                >
                  {item.change > 0 ? '+' : ''}
                  {item.change.toFixed(1)}%
                </span>
              )}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
