import { Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { WagesFilter } from './partials/WagesFilter';
import { WagesTable } from './partials/WagesTable';

export function WagesPage() {
  const handleExport = () => {
    console.log('Export CSV');
  };

  return (
    <div className="space-y-4 md:space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm md:text-base text-muted-foreground">
            Data upah minimum regional (UMR/UMK) tahun 2025 untuk seluruh wilayah Indonesia.
          </p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleExport}
          className="border-stone hover:bg-stone/50 self-start sm:self-auto"
        >
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <WagesFilter />

      {/* Table */}
      <WagesTable />
    </div>
  );
}
