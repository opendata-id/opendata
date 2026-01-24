<?php require_once __DIR__ . '/../lib/seo.php'; ?>
<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <?= seoHead([
        'title' => 'Tentang OpenData.id — Platform Data Terbuka Indonesia',
        'description' => 'OpenData.id adalah platform data terbuka berbasis komunitas untuk Indonesia. Misi kami membuat data Indonesia dapat diakses, akurat, dan bermanfaat untuk semua.',
        'url' => 'https://opendata.id/about',
        'type' => 'article',
    ]) ?>
    <?= breadcrumbJsonLd([
        ['name' => 'Beranda', 'url' => 'https://opendata.id'],
        ['name' => 'Tentang', 'url' => 'https://opendata.id/about'],
    ]) ?>
    <title>Tentang — OpenData.id</title>
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
                <a href="/about" class="header-nav-link active">Tentang</a>
                <a href="/roadmap" class="header-nav-link">Roadmap</a>
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
            <a href="/about" class="mobile-nav-link active">Tentang</a>
            <a href="/roadmap" class="mobile-nav-link">Roadmap</a>
            <a href="/api" class="mobile-nav-link">API</a>
        </div>
        <div class="mobile-nav-footer">
            <a href="https://github.com/opendata-id" target="_blank" rel="noopener">GitHub</a>
        </div>
    </nav>

    <main class="page-main">
        <article class="page-article">
            <header class="article-header">
                <h1 class="article-title">Tentang OpenData.id</h1>
                <p class="article-subtitle">Data terbuka berbasis komunitas untuk Indonesia</p>
            </header>

            <section class="article-section" style="animation-delay: 0.1s">
                <h2 class="section-label">Tujuan</h2>
                <div class="section-content">
                    <p class="lead-text">
                        Membuat data Indonesia dapat diakses, akurat, dan bermanfaat untuk semua.
                    </p>
                    <p>
                        Data pemerintah yang sudah dipublikasikan sering tersebar di berbagai instansi dan disajikan dalam format PDF yang sulit diolah.
                        OpenData.id mengumpulkan data terbuka tersebut, membersihkan, dan menyajikannya dalam format yang mudah digunakan
                        oleh developer, peneliti, jurnalis, dan masyarakat.
                    </p>
                    <div class="goal-grid">
                        <div class="goal-card">
                            <div class="goal-card-header">
                                <span class="goal-icon">◈</span>
                                <h3>Dapat Diakses</h3>
                            </div>
                            <p>Tanpa registrasi. Kode sumber terbuka.</p>
                        </div>
                        <div class="goal-card">
                            <div class="goal-card-header">
                                <span class="goal-icon">◉</span>
                                <h3>Akurat</h3>
                            </div>
                            <p>Referensi silang dari berbagai sumber. Diverifikasi komunitas.</p>
                        </div>
                        <div class="goal-card">
                            <div class="goal-card-header">
                                <span class="goal-icon">◎</span>
                                <h3>Bermanfaat</h3>
                            </div>
                            <p>Format bersih. Visualisasi lengkap. Update real-time.</p>
                        </div>
                    </div>
                </div>
            </section>

            <section class="article-section" style="animation-delay: 0.3s">
                <h2 class="section-label">Data Berbasis Komunitas</h2>
                <div class="section-content">
                    <div class="callout">
                        <div class="callout-content">
                            <h3>Mengapa komunitas penting</h3>
                            <p>
                                Survei pemerintah lengkap tapi lambat. Saat BPS mempublikasikan data tahunan,
                                kondisi di lapangan sudah berubah. Kontributor komunitas dapat melaporkan harga real-time,
                                kondisi lokal, dan koreksi lebih cepat dari birokrasi manapun.
                            </p>
                        </div>
                    </div>
                    <p>
                        Kami membangun model hybrid: data resmi pemerintah sebagai fondasi, diperkaya dengan
                        update dari komunitas. Setiap kontribusi dilacak, diatribusikan, dan diverifikasi dari
                        berbagai sumber sebelum dipublikasikan.
                    </p>
                    <div class="source-grid">
                        <div class="source-card official">
                            <span class="source-badge">Resmi</span>
                            <h4>Sumber Pemerintah</h4>
                            <ul>
                                <li>BPS (Badan Pusat Statistik)</li>
                                <li>Kemnaker (Kementerian Ketenagakerjaan)</li>
                                <li>PIHPS (Pusat Informasi Harga Pangan)</li>
                                <li>Bank Indonesia</li>
                            </ul>
                        </div>
                        <div class="source-card community">
                            <span class="source-badge">Komunitas</span>
                            <h4>Crowd-Sourced</h4>
                            <ul>
                                <li>Laporan harga lokal</li>
                                <li>Koreksi biaya regional</li>
                                <li>Update pasar real-time</li>
                                <li>Verifikasi data</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </section>

            <section class="article-section cta-section" style="animation-delay: 0.4s">
                <div class="cta-box">
                    <h2>Lihat rencana pengembangan</h2>
                    <p>Fitur yang sedang dikerjakan dan yang akan datang untuk OpenData.id.</p>
                    <a href="/roadmap" class="cta-button">
                        Lihat Roadmap
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square">
                            <path d="M5 12h14M12 5l7 7-7 7"/>
                        </svg>
                    </a>
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
            <span class="footer-source">Data: BPS, Kemnaker, PIHPS + Komunitas</span>
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
