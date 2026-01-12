<?php
/**
 * Shared utility functions for OpenData.id landing
 */

/**
 * Get current Jakarta time
 */
function getJakartaTime(): DateTime {
    return new DateTime('now', new DateTimeZone('Asia/Jakarta'));
}

/**
 * Format currency in Indonesian Rupiah
 */
function formatRupiah(float $amount, bool $short = false): string {
    if ($short) {
        if ($amount >= 1000000000) {
            return number_format($amount / 1000000000, 1, ',', '.') . 'M';
        }
        if ($amount >= 1000000) {
            return number_format($amount / 1000000, 1, ',', '.') . 'jt';
        }
        if ($amount >= 1000) {
            return number_format($amount / 1000, 0, ',', '.') . 'rb';
        }
    }
    return 'Rp ' . number_format($amount, 0, ',', '.');
}

/**
 * Format percentage with sign
 */
function formatPercent(float $value, bool $showSign = true): string {
    $sign = $showSign && $value > 0 ? '+' : '';
    return $sign . number_format($value, 2, ',', '.') . '%';
}

/**
 * Safe HTML escape
 */
function e(string $value): string {
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

/**
 * Check if current page matches path
 */
function isCurrentPage(string $path): bool {
    $uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
    $uri = rtrim($uri, '/') ?: '/';
    return $uri === $path;
}

/**
 * Active class helper for navigation
 */
function activeClass(string $path, string $class = 'active'): string {
    return isCurrentPage($path) ? $class : '';
}

/**
 * Asset URL with cache busting based on file modification time
 */
function asset(string $path): string {
    $filePath = __DIR__ . '/../' . ltrim($path, '/');
    $version = file_exists($filePath) ? filemtime($filePath) : time();
    return $path . '?v=' . $version;
}
