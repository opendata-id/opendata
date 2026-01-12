<?php
/**
 * SEO helper functions
 */

function seoHead(array $config = []): string {
    $defaults = [
        'title' => 'OpenData.id — Open Data Indonesia',
        'title_id' => 'OpenData.id — Data Terbuka Indonesia',
        'description' => 'Open data platform for Indonesia. Access minimum wage (UMR), living costs, food prices, and economic statistics for 514 districts. Free and open source.',
        'description_id' => 'Platform data terbuka Indonesia. Akses data UMR, biaya hidup, harga pangan, dan statistik ekonomi untuk 514 kabupaten/kota. Gratis dan open source.',
        'keywords' => 'indonesia data, open data, umr 2025, minimum wage indonesia, living cost, food prices, economic statistics, bps, kemnaker, cost of living indonesia',
        'keywords_id' => 'data indonesia, open data, umr 2025, biaya hidup, harga pangan, statistik ekonomi, bps, kemnaker',
        'url' => 'https://opendata.id',
        'image' => 'https://opendata.id/img/og-image.png',
        'type' => 'website',
        'locale' => 'id_ID',
    ];

    $c = array_merge($defaults, $config);
    $canonical = rtrim($c['url'], '/');

    $html = <<<HTML
    <!-- Primary Meta Tags -->
    <meta name="description" content="{$c['description']}">
    <meta name="keywords" content="{$c['keywords']}">
    <meta name="author" content="OpenData.id">
    <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
    <meta name="googlebot" content="index, follow">
    <link rel="canonical" href="{$canonical}">

    <!-- Language Alternates -->
    <link rel="alternate" hreflang="id" href="{$canonical}">
    <link rel="alternate" hreflang="en" href="{$canonical}">
    <link rel="alternate" hreflang="x-default" href="{$canonical}">

    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="{$c['type']}">
    <meta property="og:url" content="{$canonical}">
    <meta property="og:title" content="{$c['title']}">
    <meta property="og:description" content="{$c['description']}">
    <meta property="og:image" content="{$c['image']}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:locale" content="{$c['locale']}">
    <meta property="og:locale:alternate" content="en_US">
    <meta property="og:site_name" content="OpenData.id">

    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="{$c['title']}">
    <meta name="twitter:description" content="{$c['description']}">
    <meta name="twitter:image" content="{$c['image']}">
    <meta name="twitter:site" content="@opendataid">

    <!-- Additional SEO -->
    <meta name="theme-color" content="#0d7377">
    <meta name="msapplication-TileColor" content="#0d7377">
    <meta name="geo.region" content="ID">
    <meta name="geo.placename" content="Indonesia">
HTML;

    return $html;
}

function jsonLd(array $data): string {
    return '<script type="application/ld+json">' . json_encode($data, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . '</script>';
}

function websiteJsonLd(): string {
    return jsonLd([
        '@context' => 'https://schema.org',
        '@type' => 'WebSite',
        'name' => 'OpenData.id',
        'alternateName' => 'Open Data Indonesia',
        'url' => 'https://opendata.id',
        'description' => 'Platform data terbuka Indonesia untuk akses data ekonomi, UMR, dan biaya hidup.',
        'inLanguage' => 'id-ID',
        'potentialAction' => [
            '@type' => 'SearchAction',
            'target' => 'https://opendata.id/map?search={search_term_string}',
            'query-input' => 'required name=search_term_string'
        ]
    ]);
}

function organizationJsonLd(): string {
    return jsonLd([
        '@context' => 'https://schema.org',
        '@type' => 'Organization',
        'name' => 'OpenData.id',
        'url' => 'https://opendata.id',
        'logo' => 'https://opendata.id/img/logo.png',
        'description' => 'Platform data terbuka komunitas untuk Indonesia',
        'sameAs' => [
            'https://github.com/luberius/opendata'
        ]
    ]);
}

function breadcrumbJsonLd(array $items): string {
    $listItems = [];
    foreach ($items as $i => $item) {
        $listItems[] = [
            '@type' => 'ListItem',
            'position' => $i + 1,
            'name' => $item['name'],
            'item' => $item['url']
        ];
    }

    return jsonLd([
        '@context' => 'https://schema.org',
        '@type' => 'BreadcrumbList',
        'itemListElement' => $listItems
    ]);
}
