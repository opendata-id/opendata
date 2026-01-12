import { useState, useMemo } from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useProvinces } from './useRegions';
import { useStats } from '@/features/overview/useStats';
import { cn } from '@/lib/utils';

export function RegionsPage() {
  const [search, setSearch] = useState('');
  const [selectedProvince, setSelectedProvince] = useState<string | null>(null);

  const { data: provincesRes, isLoading } = useProvinces();
  const { data: statsRes } = useStats();
  const provinces = provincesRes?.data ?? [];
  const stats = statsRes?.data;

  const filteredProvinces = useMemo(() => {
    if (!search) return provinces;
    return provinces.filter((p) => p.province.toLowerCase().includes(search.toLowerCase()));
  }, [provinces, search]);

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div>
        <p className="text-sm md:text-base text-muted-foreground">
          Data wilayah administratif Indonesia: {stats?.total_provinces ?? '-'} provinsi dan {stats?.total_regions ?? '-'} kabupaten/kota.
        </p>
      </div>

      {/* Search */}
      <div className="relative w-full sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari provinsi..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 bg-paper border-stone"
        />
      </div>

      {/* Province Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-2 md:gap-3">
        {isLoading ? (
          Array.from({ length: 12 }).map((_, i) => (
            <div key={i} className="border border-stone bg-paper p-3 md:p-4 h-16 animate-pulse" />
          ))
        ) : filteredProvinces.map((prov, index) => (
          <button
            key={prov.province}
            onClick={() => setSelectedProvince(prov.province)}
            className={cn(
              'border border-stone bg-paper p-3 md:p-4 text-left transition-all hover:border-accent-brand hover:shadow-sm animate-slide-up',
              selectedProvince === prov.province && 'border-accent-brand bg-accent-light'
            )}
            style={{ animationDelay: `${Math.min(index, 20) * 20}ms` }}
          >
            <span className="text-xs md:text-sm font-medium text-ink line-clamp-1">{prov.province}</span>
            <span className="block text-xs text-muted-foreground mt-0.5 md:mt-1">{prov.count} wilayah</span>
          </button>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 md:gap-4 pt-4 md:pt-6 border-t border-stone">
        <div>
          <span className="label">Total Provinsi</span>
          <span className="block mt-1 font-mono text-xl md:text-2xl text-ink">{stats?.total_provinces ?? '-'}</span>
        </div>
        <div>
          <span className="label">Kabupaten/Kota</span>
          <span className="block mt-1 font-mono text-xl md:text-2xl text-ink">{stats?.total_regions ?? '-'}</span>
        </div>
      </div>
    </div>
  );
}
