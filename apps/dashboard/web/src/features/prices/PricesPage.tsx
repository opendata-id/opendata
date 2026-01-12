import { useState } from 'react';
import { usePrices } from './usePrices';
import { PriceCard } from './partials/PriceCard';

export function PricesPage() {
  const [search, setSearch] = useState('');
  const { data: pricesRes, isLoading } = usePrices({ search: search || undefined });
  const prices = pricesRes?.data ?? [];

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm md:text-base text-muted-foreground">
          Harga bahan pangan strategis nasional. Data diperbarui harian dari Bank Indonesia.
        </p>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <input
          type="search"
          placeholder="Cari komoditas..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full px-4 py-2 text-sm border border-stone bg-paper focus:outline-none focus:border-accent-brand"
        />
      </div>

      {/* Price Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3 md:gap-4">
        {isLoading ? (
          Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="border border-stone bg-paper p-4 h-28 animate-pulse" />
          ))
        ) : prices.map((price, index) => (
          <PriceCard key={price.id} price={price} index={index} />
        ))}
      </div>

      {/* Last Updated */}
      <div className="text-sm text-muted-foreground">
        {prices.length > 0 && `Terakhir diperbarui: ${new Date(prices[0].date).toLocaleDateString('id-ID', {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
        })}`}
      </div>
    </div>
  );
}
