import { Link } from 'react-router-dom';
import {
  Banknote,
  MapPin,
  ShoppingCart,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';
import type { Dataset } from '@/types';

const iconMap = {
  banknote: Banknote,
  'map-pin': MapPin,
  'shopping-cart': ShoppingCart,
  'trending-up': TrendingUp,
};

interface DatasetCardProps {
  dataset: Dataset;
  index?: number;
}

export function DatasetCard({ dataset, index = 0 }: DatasetCardProps) {
  const Icon = iconMap[dataset.icon as keyof typeof iconMap] || Banknote;
  const href = `/${dataset.id}`;

  return (
    <Link
      to={href}
      className="group block border border-stone bg-paper p-3 md:p-5 transition-all hover:border-accent-brand hover:shadow-[var(--shadow-elevated)] animate-slide-up"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2 md:gap-3">
          <div className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center bg-stone/50 text-muted-foreground group-hover:bg-accent-light group-hover:text-accent-brand transition-colors">
            <Icon className="w-4 h-4 md:w-5 md:h-5" strokeWidth={1.5} />
          </div>
          <div className="min-w-0">
            <h3 className="font-medium text-sm md:text-base text-ink group-hover:text-accent-brand transition-colors truncate">
              {dataset.name}
            </h3>
            <p className="text-xs md:text-sm text-muted-foreground mt-0.5 line-clamp-1">
              {dataset.description}
            </p>
          </div>
        </div>
        <ArrowRight
          className="w-4 h-4 text-muted-foreground opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all flex-shrink-0 hidden md:block"
          strokeWidth={1.5}
        />
      </div>

      <div className="mt-3 md:mt-4 pt-3 md:pt-4 border-t border-stone flex items-center gap-4 md:gap-6">
        <div>
          <span className="label">Records</span>
          <span className="block font-mono text-base md:text-lg text-ink">
            {dataset.count.toLocaleString('id-ID')}
          </span>
        </div>
        <div className="hidden sm:block">
          <span className="label">Updated</span>
          <span className="block text-xs md:text-sm text-muted-foreground">
            {new Date(dataset.lastUpdated).toLocaleDateString('id-ID', {
              day: 'numeric',
              month: 'short',
              year: 'numeric',
            })}
          </span>
        </div>
      </div>
    </Link>
  );
}
