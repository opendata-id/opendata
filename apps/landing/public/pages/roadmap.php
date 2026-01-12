<?php require_once __DIR__ . '/../lib/seo.php'; ?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?= seoHead([
        'title' => 'Roadmap OpenData.id — Rencana Pengembangan',
        'description' => 'Lihat rencana pengembangan OpenData.id. Fitur yang sedang dikerjakan dan yang akan datang untuk platform data terbuka Indonesia.',
        'url' => 'https://opendata.id/roadmap',
    ]) ?>
    <?= breadcrumbJsonLd([
        ['name' => 'Beranda', 'url' => 'https://opendata.id'],
        ['name' => 'Roadmap', 'url' => 'https://opendata.id/roadmap'],
    ]) ?>
    <title>Roadmap — OpenData.id</title>
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
                <a href="/roadmap" class="header-nav-link active">Roadmap</a>
                <a href="/api" class="header-nav-link">API</a>
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
            <a href="/roadmap" class="mobile-nav-link active">Roadmap</a>
            <a href="/api" class="mobile-nav-link">API</a>
        </div>
        <div class="mobile-nav-footer">
            <a href="https://github.com/opendata-id" target="_blank" rel="noopener">GitHub</a>
        </div>
    </nav>

    <main class="page-main">
        <article class="page-article">
            <header class="article-header">
                <h1 class="article-title">Roadmap</h1>
                <p class="article-subtitle">Rencana pengembangan</p>
            </header>

            <section class="article-section" style="animation-delay: 0.1s">
                <h2 class="section-label">Sedang Dikerjakan</h2>
                <div class="section-content">
                    <div class="roadmap-list">
                        <div class="roadmap-item">
                            <div class="roadmap-marker in-progress"></div>
                            <div class="roadmap-content">
                                <h3>Peta Biaya Hidup</h3>
                                <p>Visualisasi interaktif UMR dan biaya hidup untuk 514 kabupaten/kota di Indonesia.</p>
                                <div class="roadmap-meta">
                                    <span class="roadmap-tag">v1.0</span>
                                </div>
                            </div>
                        </div>
                        <div class="roadmap-item">
                            <div class="roadmap-marker in-progress"></div>
                            <div class="roadmap-content">
                                <h3>Dashboard Indikator Ekonomi</h3>
                                <p>Data inflasi, nilai tukar, dan indikator ekonomi makro Indonesia.</p>
                                <div class="roadmap-meta">
                                    <span class="roadmap-tag">v1.0</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="article-section" style="animation-delay: 0.2s">
                <h2 class="section-label">Direncanakan</h2>
                <div class="section-content">
                    <div class="roadmap-list">
                        <div class="roadmap-item">
                            <div class="roadmap-marker pending"></div>
                            <div class="roadmap-content">
                                <h3>API Publik</h3>
                                <p>REST API terbuka untuk developer dan peneliti mengakses data secara programatis.</p>
                            </div>
                        </div>
                        <div class="roadmap-item">
                            <div class="roadmap-marker pending"></div>
                            <div class="roadmap-content">
                                <h3>Kontribusi Developer</h3>
                                <p>Buka repository untuk kontribusi kode, perbaikan bug, dan penambahan fitur dari komunitas.</p>
                            </div>
                        </div>
                        <div class="roadmap-item">
                            <div class="roadmap-marker pending"></div>
                            <div class="roadmap-content">
                                <h3>Portal Kontribusi Data</h3>
                                <p>Sistem untuk mengirim laporan harga, verifikasi data, dan menyarankan sumber data baru.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            <section class="article-section" style="animation-delay: 0.3s">
                <h2 class="section-label">Ide</h2>
                <div class="section-content">
                    <div class="roadmap-list">
                        <div class="roadmap-item">
                            <div class="roadmap-marker idea"></div>
                            <div class="roadmap-content">
                                <h3>Explorer Sensus</h3>
                                <p>Visualisasi data demografi dari sensus BPS: kepadatan penduduk, tren pertumbuhan, distribusi usia.</p>
                            </div>
                        </div>
                        <div class="roadmap-item">
                            <div class="roadmap-marker idea"></div>
                            <div class="roadmap-content">
                                <h3>Histori Harga Pangan</h3>
                                <p>Grafik tren harga komoditas pangan dari PIHPS dengan perbandingan antar wilayah.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>
        </article>
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
            <span class="footer-source">Data: BPS, Kemnaker, PIHPS</span>
        </div>
    </footer>

    <script>
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
