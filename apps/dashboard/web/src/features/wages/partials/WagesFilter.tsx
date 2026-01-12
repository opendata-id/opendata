import { useSnapshot } from 'valtio';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { filterState, setSearch, setProvince, resetFilters } from '@/store/filters';
import { PROVINCES } from '@/lib/constants';

export function WagesFilter() {
  const { search, province } = useSnapshot(filterState);

  const hasFilters = search || province;

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      {/* Search */}
      <div className="relative flex-1 sm:max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type="search"
          placeholder="Cari wilayah..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9 h-9 bg-paper border-stone"
        />
      </div>

      {/* Province Filter */}
      <Select
        value={province || 'all'}
        onValueChange={(value) => setProvince(value === 'all' ? null : value)}
      >
        <SelectTrigger className="w-full sm:w-48 h-9 bg-paper border-stone">
          <SelectValue placeholder="Semua Provinsi" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">Semua Provinsi</SelectItem>
          {PROVINCES.map((prov) => (
            <SelectItem key={prov} value={prov}>
              {prov}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {/* Reset */}
      {hasFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={resetFilters}
          className="h-9 text-muted-foreground hover:text-ink self-start sm:self-auto"
        >
          <X className="w-4 h-4 mr-1" />
          Reset
        </Button>
      )}
    </div>
  );
}
