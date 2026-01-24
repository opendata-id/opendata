<?php
require_once __DIR__ . '/../lib/seo.php';
$projects = data()->getProjects();
$stats = data()->getEconomicIndicators();
$groceryPrices = data()->getGroceryPrices();
?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?= seoHead([
        'title' => 'OpenData.id — Data Terbuka Indonesia',
        'description' => 'Platform data terbuka Indonesia. Akses data UMR, biaya hidup, dan harga pangan untuk 514 kabupaten/kota. Gratis dan open source.',
        'url' => 'https://opendata.id',
    ]) ?>
    <title>OpenData.id — Data Terbuka Indonesia</title>
    <link rel="stylesheet" href="<?= asset('/style.css') ?>">
    <link rel="icon" type="image/svg+xml" href="/favicon.svg">
    <script defer src="<?= asset('/js/alpine.min.js') ?>"></script>
    <?= websiteJsonLd() ?>
    <?= organizationJsonLd() ?>
</head>
<body>
    <div class="ticker-wrap">
        <div class="ticker-label">
            <span>HARGA PANGAN</span>
        </div>
        <div class="ticker">
            <div class="ticker-content">
                <?php foreach ($groceryPrices as $item): ?>
                <span class="ticker-item">
                    <span class="ticker-name"><?= e($item['name']) ?></span>
                    <span class="ticker-price">Rp <?= e($item['price']) ?>/<?= e($item['unit']) ?></span>
                    <?php if ($item['change']): ?>
                    <span class="ticker-change <?= e($item['direction'] ?? '') ?>"><?= e($item['change']) ?>%</span>
                    <?php endif; ?>
                </span>
                <?php endforeach; ?>
            </div>
            <div class="ticker-content" aria-hidden="true">
                <?php foreach ($groceryPrices as $item): ?>
                <span class="ticker-item">
                    <span class="ticker-name"><?= e($item['name']) ?></span>
                    <span class="ticker-price">Rp <?= e($item['price']) ?>/<?= e($item['unit']) ?></span>
                    <?php if ($item['change']): ?>
                    <span class="ticker-change <?= e($item['direction'] ?? '') ?>"><?= e($item['change']) ?>%</span>
                    <?php endif; ?>
                </span>
                <?php endforeach; ?>
            </div>
        </div>
    </div>

    <header>
        <a href="/" class="logo">
            <div class="logo-mark">○</div>
            <span class="logo-text">OpenData.id</span>
        </a>
        <div class="header-meta">
            <div x-data="clock()" x-init="init()" class="header-time">
                <span x-text="date"></span> — <span x-text="time" class="header-time-live"></span> WIB
            </div>
            <a href="/roadmap" class="header-nav-link">Roadmap</a>
            <a href="https://github.com/opendata-id" target="_blank" rel="noopener" class="header-link">GitHub</a>
        </div>
    </header>

    <main>
        <section class="data-section">
            <div class="section-header">
                <span class="section-title">Indikator Ekonomi</span>
                <div class="live-indicator">
                    <div class="live-dot"></div>
                    <span><?= date('Y') ?></span>
                </div>
            </div>
            <div class="data-grid">
                <?php foreach ($stats as $stat): ?>
                <div class="data-cell">
                    <span class="data-label"><?= e($stat['label']) ?></span>
                    <div class="data-value-row">
                        <span class="data-value"><?= e($stat['value']) ?></span>
                        <?php if (!empty($stat['change'])): ?>
                        <span class="data-change <?= e($stat['direction'] ?? '') ?>"><?= e($stat['change']) ?>%</span>
                        <?php endif; ?>
                    </div>
                    <span class="data-subtext"><?= e($stat['subtext']) ?></span>
                </div>
                <?php endforeach; ?>
            </div>
        </section>

        <section class="portal-section">
            <div class="section-header">
                <span class="section-title">Aplikasi</span>
            </div>
            <div class="portal-grid">
                <?php foreach ($projects as $index => $project): ?>
                <a href="/<?= e($project['slug']) ?>" class="app-card<?= $project['status'] !== 'active' ? ' disabled' : '' ?>">
                    <div class="app-card-header">
                        <span class="app-number"><?= str_pad($index + 1, 2, '0', STR_PAD_LEFT) ?></span>
                        <span class="app-status <?= e($project['status']) ?>"><?= $project['status'] === 'active' ? 'Live' : 'Segera' ?></span>
                    </div>
                    <h3 class="app-title"><?= e($project['name']) ?></h3>
                    <p class="app-description"><?= e($project['description']) ?></p>
                    <div class="app-meta">
                        <?php if ($project['regions']): ?>
                        <div class="app-meta-item">
                            <svg class="app-meta-icon" viewBox="0 0 24 24">
                                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" stroke-linecap="square"/>
                            </svg>
                            <span><?= $project['regions'] ?> wilayah</span>
                        </div>
                        <?php endif; ?>
                        <?php if ($project['provinces']): ?>
                        <div class="app-meta-item">
                            <svg class="app-meta-icon" viewBox="0 0 24 24">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" stroke-linecap="square"/>
                                <circle cx="12" cy="10" r="3"/>
                            </svg>
                            <span><?= $project['provinces'] ?> provinsi</span>
                        </div>
                        <?php endif; ?>
                    </div>
                    <svg class="app-arrow" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="square">
                        <path d="M5 12h14M12 5l7 7-7 7"/>
                    </svg>
                </a>
                <?php endforeach; ?>
            </div>
        </section>
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
        function clock() {
            return {
                time: '',
                date: '',
                init() {
                    this.update();
                    setInterval(() => this.update(), 1000);
                },
                update() {
                    const now = new Date();
                    const options = { timeZone: 'Asia/Jakarta' };
                    this.time = now.toLocaleTimeString('en-GB', { ...options, hour: '2-digit', minute: '2-digit', second: '2-digit' });
                    this.date = now.toLocaleDateString('en-GB', { ...options, weekday: 'short', day: '2-digit', month: 'short', year: 'numeric' });
                }
            }
        }
    </script>
</body>
</html>
