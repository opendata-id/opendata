<?php
/**
 * OpenData.id Landing - Router
 *
 * All requests go through this file.
 * Usage: php -S localhost:3000 index.php
 */

// Load utilities
require_once __DIR__ . '/lib/functions.php';
require_once __DIR__ . '/lib/data.php';

// Parse request
$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);
$uri = rtrim($uri, '/') ?: '/';

// Static files - serve directly
$staticExtensions = ['css', 'js', 'png', 'jpg', 'jpeg', 'gif', 'svg', 'ico', 'woff', 'woff2', 'ttf', 'map'];
$extension = pathinfo($uri, PATHINFO_EXTENSION);

if (in_array($extension, $staticExtensions)) {
    $filePath = __DIR__ . $uri;
    if (file_exists($filePath)) {
        return false;
    }
}

// Costmap app - redirect to dev server (in production, nginx handles /map)
if (str_starts_with($uri, '/map')) {
    $devPort = getenv('COSTMAP_PORT') ?: '4200';
    header("Location: http://localhost:$devPort$uri", true, 302);
    exit;
}

// Routes
$routes = [
    '/'        => 'home',
    '/about'   => 'about',
    '/api'     => 'api',
    '/roadmap' => 'roadmap',
];

// Match route
$page = $routes[$uri] ?? '404';
$pagePath = __DIR__ . '/pages/' . $page . '.php';

if (!file_exists($pagePath)) {
    http_response_code(404);
    $pagePath = __DIR__ . '/pages/404.php';
}

require $pagePath;
