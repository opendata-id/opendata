<?php require_once __DIR__ . '/../lib/seo.php'; ?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?= seoHead([
        'title' => 'API OpenData.id — Akses Data Indonesia Gratis',
        'description' => 'REST API gratis untuk mengakses data Indonesia. Data UMR, biaya hidup, harga pangan, dan statistik ekonomi dalam format JSON. Tanpa API key.',
        'url' => 'https://opendata.id/api',
        'keywords' => 'api indonesia, rest api, data api, umr api, open data api, json api indonesia',
    ]) ?>
    <?= breadcrumbJsonLd([
        ['name' => 'Beranda', 'url' => 'https://opendata.id'],
        ['name' => 'API', 'url' => 'https://opendata.id/api'],
    ]) ?>
    <title>API — OpenData.id</title>
    <link rel="stylesheet" href="/style.css">
    <link rel="icon" href="data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 32 32'><rect width='32' height='32' fill='%231a1a1a'/><text x='16' y='22' font-size='16' text-anchor='middle' fill='%230d7377'>○</text></svg>">
</head>
<body class="page-body">
    <header>
        <a href="/" class="logo">
            <div class="logo-mark">○</div>
            <span class="logo-text">OpenData.id</span>
        </a>
        <div class="header-meta">
            <nav class="header-nav">
                <a href="/about" class="header-nav-link">Tentang</a>
                <a href="/roadmap" class="header-nav-link">Roadmap</a>
                <a href="/api" class="header-nav-link active">API</a>
            </nav>
            <a href="https://github.com/opendata-id" target="_blank" rel="noopener" class="header-link">GitHub</a>
        </div>
        <button class="mobile-menu-toggle" aria-label="Menu" onclick="toggleMobileMenu()">
            <span></span>
            <span></span>
            <span></span>
        </button>
    </header>

    <nav class="mobile-nav" id="mobileNav">
        <div class="mobile-nav-links">
            <a href="/" class="mobile-nav-link">Beranda</a>
            <a href="/about" class="mobile-nav-link">Tentang</a>
            <a href="/roadmap" class="mobile-nav-link">Roadmap</a>
            <a href="/api" class="mobile-nav-link active">API</a>
        </div>
        <div class="mobile-nav-footer">
            <a href="https://github.com/opendata-id" target="_blank" rel="noopener">GitHub</a>
        </div>
    </nav>

    <main class="page-main page-centered">
        <div class="coming-soon">
            <div class="coming-soon-badge">Segera Hadir</div>
            <h1 class="coming-soon-title">Dokumentasi API</h1>
            <p class="coming-soon-text">
                Akses gratis dan terbuka ke data Indonesia. Tanpa API key.
                Kami sedang menyelesaikan dokumentasi dan rate limit.
            </p>

            <div class="api-preview">
                <div class="api-preview-header">
                    <span class="api-method">GET</span>
                    <span class="api-endpoint">/api/regions</span>
                </div>
                <div class="api-preview-body">
<pre><code>{
  "data": [
    {
      "id": 3171,
      "name": "Jakarta Pusat",
      "province": "DKI Jakarta",
      "type": "kota",
      "umr": 5340000
    },
    ...
  ],
  "meta": {
    "total": 514,
    "year": 2025
  }
}</code></pre>
                </div>
            </div>

            <div class="api-endpoints-preview">
                <h2>Endpoint yang Direncanakan</h2>
                <div class="endpoint-list">
                    <div class="endpoint-item">
                        <span class="api-method">GET</span>
                        <code>/api/regions</code>
                        <span class="endpoint-desc">Daftar semua wilayah</span>
                    </div>
                    <div class="endpoint-item">
                        <span class="api-method">GET</span>
                        <code>/api/regions/:id</code>
                        <span class="endpoint-desc">Detail wilayah</span>
                    </div>
                    <div class="endpoint-item">
                        <span class="api-method">GET</span>
                        <code>/api/regions/geojson</code>
                        <span class="endpoint-desc">GeoJSON dengan batas wilayah</span>
                    </div>
                    <div class="endpoint-item">
                        <span class="api-method">GET</span>
                        <code>/api/wages</code>
                        <span class="endpoint-desc">Data UMR per wilayah/tahun</span>
                    </div>
                    <div class="endpoint-item">
                        <span class="api-method">GET</span>
                        <code>/api/costs</code>
                        <span class="endpoint-desc">Biaya hidup per kategori</span>
                    </div>
                    <div class="endpoint-item">
                        <span class="api-method">GET</span>
                        <code>/api/prices</code>
                        <span class="endpoint-desc">Indeks harga pangan</span>
                    </div>
                </div>
            </div>

            <div class="notify-form">
                <p>Dapatkan notifikasi saat API diluncurkan:</p>
                <form class="notify-input-group" onsubmit="handleNotify(event)">
                    <input type="email" placeholder="email@anda.com" class="notify-input" required>
                    <button type="submit" class="notify-button">Beritahu Saya</button>
                </form>
                <p class="notify-note">Tanpa spam. Hanya satu email saat kami meluncurkan.</p>
            </div>
        </div>
    </main>

    <footer>
        <div class="footer-left">
            <span class="footer-copy">© <?= date('Y') ?> OpenData.id</span>
            <nav class="footer-nav">
                <a href="/about">Tentang</a>
                <a href="/roadmap">Roadmap</a>
                <a href="/api">API</a>
                <a href="https://github.com/opendata-id" target="_blank" rel="noopener">Sumber</a>
            </nav>
        </div>
        <div class="footer-right">
            <span class="footer-source">Data: BPS, Kemnaker, PIHPS + Komunitas</span>
        </div>
    </footer>

    <script>
        function handleNotify(e) {
            e.preventDefault();
            const input = e.target.querySelector('input');
            const button = e.target.querySelector('button');
            button.textContent = 'Terdaftar!';
            button.disabled = true;
            input.disabled = true;
            input.value = '';
            input.placeholder = 'Terima kasih! Kami akan menghubungi Anda.';
        }

        function toggleMobileMenu() {
            const toggle = document.querySelector('.mobile-menu-toggle');
            const nav = document.getElementById('mobileNav');
            toggle.classList.toggle('active');
            nav.classList.toggle('active');
            document.body.style.overflow = nav.classList.contains('active') ? 'hidden' : '';
        }
    </script>
</body>
</html>
