<?php
/**
 * Simple view/template helpers
 */

/**
 * Render a partial template
 */
function partial(string $name, array $data = []): void {
    extract($data);
    require __DIR__ . '/../partials/' . $name . '.php';
}

/**
 * Start output buffering for layout
 */
function startContent(): void {
    ob_start();
}

/**
 * End buffering and get content
 */
function endContent(): string {
    return ob_get_clean();
}

/**
 * Render page with layout
 */
function render(string $view, array $data = [], string $layout = 'default'): void {
    extract($data);

    // Capture view content
    ob_start();
    require __DIR__ . '/../views/' . $view . '.php';
    $content = ob_get_clean();

    // Render layout with content
    require __DIR__ . '/../layouts/' . $layout . '.php';
}
