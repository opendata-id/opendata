import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { MOCK_PRICES } from '@/lib/constants';
import { cn } from '@/lib/utils';

export function PricePreview() {
  const categories = ['Beras', 'Protein', 'Bumbu'];

  const pricesByCategory = categories.map((cat) => ({
    category: cat,
    items: MOCK_PRICES.filter((p) => p.category === cat).slice(0, 3),
  }));

  return (
    <div className="border border-stone bg-paper animate-slide-up">
      {/* Header */}
      <div className="flex items-center justify-between px-4 md:px-5 py-3 border-b border-stone">
        <h2 className="font-serif text-base md:text-lg text-ink">Harga Pangan Hari Ini</h2>
        <Link
          to="/prices"
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-accent-brand transition-colors"
        >
          <span className="hidden sm:inline">Lihat semua</span>
          <ArrowRight className="w-4 h-4" strokeWidth={1.5} />
        </Link>
      </div>

      {/* Price Grid - stack on mobile */}
      <div className="grid grid-cols-1 sm:grid-cols-3 divide-y sm:divide-y-0 sm:divide-x divide-stone">
        {pricesByCategory.map(({ category, items }) => (
          <div key={category} className="p-3 md:p-4">
            <span className="label">{category}</span>
            <div className="mt-2 md:mt-3 space-y-2 md:space-y-3">
              {items.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground truncate pr-2">
                    {item.commodity.replace(category, '').trim() || item.commodity}
                  </span>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="font-mono text-sm text-ink">
                      {item.price.toLocaleString('id-ID')}
                    </span>
                    {item.change !== undefined && item.change !== 0 && (
                      <span
                        className={cn(
                          'font-mono text-xs',
                          item.change > 0 ? 'text-negative' : 'text-positive'
                        )}
                      >
                        {item.change > 0 ? '↑' : '↓'}
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
