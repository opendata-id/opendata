<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>404 — OpenData.id</title>
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
            <a href="/api" class="mobile-nav-link">API</a>
        </div>
        <div class="mobile-nav-footer">
            <a href="https://github.com/opendata-id" target="_blank" rel="noopener">GitHub</a>
        </div>
    </nav>

    <main class="page-main page-centered">
        <div class="coming-soon">
            <div class="coming-soon-badge">404</div>
            <h1 class="coming-soon-title">Halaman Tidak Ditemukan</h1>
            <p class="coming-soon-text">
                Halaman yang Anda cari tidak ada atau telah dipindahkan.
            </p>
            <a href="/" class="cta-button">
                Kembali ke Beranda
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="square">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                </svg>
            </a>
        </div>
    </main>

    <footer>
        <div class="footer-left">
            <span class="footer-copy">© <?= date('Y') ?> OpenData.id</span>
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
