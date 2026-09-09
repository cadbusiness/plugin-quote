<?php
/**
 * Plugin Name: QuoteBuilder
 * Description: Transforme WooCommerce en boutique devis : masquer les prix, liste de devis, funnel QuoteBuilder.
 * Version: 2.3.0
 * Author: Vinci Liberta LTD
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Update URI: https://quotebuilder-weld.vercel.app
 * Text Domain: quotebuilder
 */

if (!defined('ABSPATH')) {
    exit;
}

define('QUOTEBUILDER_VERSION', '2.3.0');
define('QUOTEBUILDER_FILE', __FILE__);
define('QUOTEBUILDER_DIR', plugin_dir_path(__FILE__));
define('QUOTEBUILDER_URL', plugin_dir_url(__FILE__));
define('QUOTEBUILDER_KEY_DESCRIPTION', 'QuoteBuilder (lecture catalogue)');
define('QUOTEBUILDER_DEFAULT_ORIGIN', 'https://quotebuilder-weld.vercel.app');

$quotebuilder_required = [
    'includes/class-settings.php',
    'includes/class-pairing.php',
    'includes/class-quote.php',
    'includes/class-storefront.php',
    'includes/class-admin.php',
    'includes/class-updater.php',
];
foreach ($quotebuilder_required as $quotebuilder_file) {
    $quotebuilder_path = QUOTEBUILDER_DIR . $quotebuilder_file;
    if (!is_readable($quotebuilder_path)) {
        add_action('admin_notices', static function () use ($quotebuilder_file) {
            echo '<div class="notice notice-error"><p>QuoteBuilder : fichier manquant <code>' . esc_html($quotebuilder_file) . '</code>. Installez le zip du plugin (<code>quotebuilder-wp.zip</code>), pas l’archive du dépôt.</p></div>';
        });
        return;
    }
    require_once $quotebuilder_path;
}

function quotebuilder_capability() {
    return class_exists('WooCommerce') ? 'manage_woocommerce' : 'manage_options';
}

function quotebuilder_user_can() {
    return current_user_can('manage_options') || current_user_can('manage_woocommerce');
}

function quotebuilder_boot() {
    QuoteBuilder_Settings::init();
    QuoteBuilder_Pairing::init();
    QuoteBuilder_Quote::init();
    QuoteBuilder_Storefront::init();
}
add_action('plugins_loaded', 'quotebuilder_boot');
QuoteBuilder_Admin::init();
QuoteBuilder_Updater::init();

function quotebuilder_activate() {
    if (class_exists('QuoteBuilder_Quote')) {
        QuoteBuilder_Quote::ensure_page();
    }
    set_transient('quotebuilder_activation_redirect', 1, 60);
}
register_activation_hook(__FILE__, 'quotebuilder_activate');

function quotebuilder_render($atts = []) {
    return QuoteBuilder_Storefront::render_funnel($atts);
}
add_shortcode('quotebuilder', 'quotebuilder_render');

function quotebuilder_register_block() {
    if (!function_exists('register_block_type')) {
        return;
    }
    wp_register_script(
        'quotebuilder-block',
        plugins_url('block.js', __FILE__),
        ['wp-blocks', 'wp-element', 'wp-block-editor', 'wp-components'],
        QUOTEBUILDER_VERSION,
        true
    );
    register_block_type('quotebuilder/embed', [
        'editor_script' => 'quotebuilder-block',
        'render_callback' => function ($attributes) {
            return QuoteBuilder_Storefront::render_funnel([
                'org' => $attributes['org'] ?? '',
                'id' => $attributes['id'] ?? '',
                'height' => $attributes['height'] ?? '720px',
            ]);
        },
        'attributes' => [
            'org' => ['type' => 'string', 'default' => ''],
            'id' => ['type' => 'string', 'default' => ''],
            'height' => ['type' => 'string', 'default' => '720px'],
        ],
    ]);
}
add_action('init', 'quotebuilder_register_block');
