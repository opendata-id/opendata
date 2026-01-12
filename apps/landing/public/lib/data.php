<?php
/**
 * Data fetching service for OpenData.id landing
 *
 * Fetches data directly from DuckDB database
 */

class DataService {
    private string $dbPath;
    private string $cacheDir;
    private int $cacheTtl;

    public function __construct() {
        $this->dbPath = getenv('DUCKDB_PATH') ?: '/var/www/opendata/data/duckdb/opendata.db';
        $this->cacheDir = sys_get_temp_dir() . '/opendata_cache';
        $this->cacheTtl = 300; // 5 minutes

        if (!is_dir($this->cacheDir)) {
            @mkdir($this->cacheDir, 0755, true);
        }
    }

    /**
     * Query DuckDB and return results as array
     */
    private function query(string $sql, ?string $cacheKey = null): ?array {
        if ($cacheKey) {
            $cacheFile = $this->cacheDir . '/' . md5($cacheKey) . '.json';
            if (file_exists($cacheFile) && (time() - filemtime($cacheFile)) < $this->cacheTtl) {
                $cached = json_decode(file_get_contents($cacheFile), true);
                if ($cached !== null) return $cached;
            }
        }

        if (!file_exists($this->dbPath)) {
            return null;
        }

        $escaped = escapeshellarg($sql);
        $duckdb = getenv('DUCKDB_BIN') ?: '/usr/local/bin/duckdb';
        $cmd = "{$duckdb} {$this->dbPath} -readonly -json -c {$escaped} 2>/dev/null";
        $output = shell_exec($cmd);

        if (!$output) return null;

        $data = json_decode($output, true);

        if ($cacheKey && $data !== null) {
            @file_put_contents($cacheFile, json_encode($data));
        }

        return $data;
    }

    /**
     * Get economic indicators for homepage
     */
    public function getEconomicIndicators(): array {
        $stats = [];

        // Get highest UMR
        $highest = $this->query("
            SELECT r.name, r.province, w.umr
            FROM wages w JOIN regions r ON w.region_id = r.id
            WHERE w.year = 2025 ORDER BY w.umr DESC LIMIT 1
        ", 'umr_highest');

        if ($highest && count($highest) > 0) {
            $h = $highest[0];
            $stats[] = [
                'label' => 'UMR Tertinggi',
                'value' => $this->formatMoney($h['umr']),
                'subtext' => $h['name'],
                'change' => null,
                'direction' => null,
            ];
        }

        // Get lowest UMR
        $lowest = $this->query("
            SELECT r.name, r.province, w.umr
            FROM wages w JOIN regions r ON w.region_id = r.id
            WHERE w.year = 2025 ORDER BY w.umr ASC LIMIT 1
        ", 'umr_lowest');

        if ($lowest && count($lowest) > 0) {
            $l = $lowest[0];
            $stats[] = [
                'label' => 'UMR Terendah',
                'value' => $this->formatMoney($l['umr']),
                'subtext' => $l['province'],
                'change' => null,
                'direction' => null,
            ];
        }

        // Get average UMR
        $avg = $this->query("
            SELECT AVG(umr) as avg_umr, COUNT(*) as total
            FROM wages WHERE year = 2025
        ", 'umr_avg');

        if ($avg && count($avg) > 0) {
            $stats[] = [
                'label' => 'Rata-rata UMR',
                'value' => $this->formatMoney($avg[0]['avg_umr']),
                'subtext' => $avg[0]['total'] . ' wilayah',
                'change' => null,
                'direction' => null,
            ];
        }

        // Get total regions
        $regions = $this->query("
            SELECT COUNT(*) as total, COUNT(DISTINCT province) as provinces
            FROM regions
        ", 'region_count');

        if ($regions && count($regions) > 0) {
            $stats[] = [
                'label' => 'Data Wilayah',
                'value' => $regions[0]['total'],
                'subtext' => $regions[0]['provinces'] . ' provinsi',
                'change' => null,
                'direction' => null,
            ];
        }

        // Fallback if DB not available
        if (empty($stats)) {
            return [
                ['label' => 'UMR Tertinggi', 'value' => '5.69jt', 'subtext' => 'Kota Bekasi', 'change' => null, 'direction' => null],
                ['label' => 'UMR Terendah', 'value' => '2.17jt', 'subtext' => 'Jawa Tengah', 'change' => null, 'direction' => null],
                ['label' => 'Rata-rata UMR', 'value' => '3.2jt', 'subtext' => '390 wilayah', 'change' => null, 'direction' => null],
                ['label' => 'Data Wilayah', 'value' => '390', 'subtext' => '33 provinsi', 'change' => null, 'direction' => null],
            ];
        }

        return $stats;
    }

    private function formatMoney(float $amount): string {
        if ($amount >= 1000000) {
            return number_format($amount / 1000000, 2, ',', '.') . 'jt';
        }
        return number_format($amount, 0, ',', '.');
    }

    /**
     * Get grocery prices for ticker
     */
    public function getGroceryPrices(): array {
        $prices = $this->query("
            SELECT commodity, price, unit, date
            FROM grocery_prices
            WHERE region_type = 'nasional'
            ORDER BY date DESC, commodity
            LIMIT 15
        ", 'grocery_prices');

        if ($prices && count($prices) > 0) {
            return array_map(function($row) {
                return [
                    'name' => $this->shortenCommodity($row['commodity']),
                    'price' => number_format($row['price'], 0, ',', '.'),
                    'unit' => $row['unit'] ?? 'kg',
                    'change' => null,
                    'direction' => null,
                ];
            }, $prices);
        }

        // Fallback to static data
        return [
            ['name' => 'Beras Medium', 'price' => '16.150', 'unit' => 'kg', 'change' => null, 'direction' => null],
            ['name' => 'Minyak Goreng', 'price' => '18.200', 'unit' => 'L', 'change' => null, 'direction' => null],
            ['name' => 'Gula Pasir', 'price' => '17.800', 'unit' => 'kg', 'change' => null, 'direction' => null],
            ['name' => 'Telur Ayam', 'price' => '28.400', 'unit' => 'kg', 'change' => null, 'direction' => null],
            ['name' => 'Daging Ayam', 'price' => '35.600', 'unit' => 'kg', 'change' => null, 'direction' => null],
            ['name' => 'Daging Sapi', 'price' => '135.000', 'unit' => 'kg', 'change' => null, 'direction' => null],
        ];
    }

    private function shortenCommodity(string $name): string {
        $patterns = [
            '/Kualitas /' => '',
            '/Ukuran Sedang/' => '',
            '/Ras Segar/' => '',
        ];
        $short = preg_replace(array_keys($patterns), array_values($patterns), $name);
        return trim(preg_replace('/\s+/', ' ', $short));
    }

    /**
     * Get project list for portal
     */
    public function getProjects(): array {
        $counts = $this->query("
            SELECT COUNT(*) as regions, COUNT(DISTINCT province) as provinces
            FROM regions
        ", 'project_counts');

        $regionCount = $counts[0]['regions'] ?? 390;
        $provinceCount = $counts[0]['provinces'] ?? 33;

        return [
            [
                'name' => 'Dashboard Data',
                'slug' => 'data',
                'description' => 'Jelajahi data UMR 2025, harga pangan, dan inflasi. Filter, cari, dan analisis indikator ekonomi seluruh wilayah Indonesia.',
                'status' => 'active',
                'regions' => $regionCount,
                'provinces' => $provinceCount,
            ],
            [
                'name' => 'Peta Biaya Hidup',
                'slug' => 'map',
                'description' => 'Indeks biaya hidup di seluruh wilayah Indonesia. Jelajahi upah minimum, sewa, biaya pangan, dan keterjangkauan per kabupaten/kota.',
                'status' => 'active',
                'regions' => $regionCount,
                'provinces' => $provinceCount,
            ],
            [
                'name' => 'Penjelajah Sensus',
                'slug' => 'census',
                'description' => 'Visualisasi data demografis dari sensus BPS. Kepadatan populasi, tren pertumbuhan, dan statistik regional.',
                'status' => 'soon',
                'regions' => null,
                'provinces' => null,
            ],
        ];
    }

    /**
     * Get UMR stats
     */
    public function getUmrStats(): ?array {
        $regions = $this->fetch('/api/regions', 3600);

        if (!$regions) {
            return null;
        }

        $umrValues = array_filter(array_column($regions, 'umr'));

        if (empty($umrValues)) {
            return null;
        }

        return [
            'min' => min($umrValues),
            'max' => max($umrValues),
            'avg' => array_sum($umrValues) / count($umrValues),
            'count' => count($regions),
        ];
    }
}

// Global instance
function data(): DataService {
    static $instance = null;
    if ($instance === null) {
        $instance = new DataService();
    }
    return $instance;
}
