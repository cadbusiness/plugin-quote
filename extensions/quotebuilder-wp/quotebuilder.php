<?php
/**
 * Plugin Name: QuoteBuilder
 * Description: Transforme WooCommerce en boutique devis : masquer les prix, liste de devis, funnel QuoteBuilder.
 * Version: 2.0.0
 * Author: Vinci Liberta LTD
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Text Domain: quotebuilder
 */

if (!defined('ABSPATH')) {
    exit;
}

define('QUOTEBUILDER_VERSION', '2.0.0');
define('QUOTEBUILDER_FILE', __FILE__);
define('QUOTEBUILDER_DIR', plugin_dir_path(__FILE__));
define('QUOTEBUILDER_URL', plugin_dir_url(__FILE__));
define('QUOTEBUILDER_KEY_DESCRIPTION', 'QuoteBuilder (lecture catalogue)');

require_once QUOTEBUILDER_DIR . 'includes/class-settings.php';
require_once QUOTEBUILDER_DIR . 'includes/class-pairing.php';
require_once QUOTEBUILDER_DIR . 'includes/class-quote.php';
require_once QUOTEBUILDER_DIR . 'includes/class-storefront.php';
require_once QUOTEBUILDER_DIR . 'includes/class-admin.php';

function quotebuilder_boot() {
    QuoteBuilder_Settings::init();
    QuoteBuilder_Pairing::init();
    QuoteBuilder_Quote::init();
    QuoteBuilder_Storefront::init();
    QuoteBuilder_Admin::init();
}
add_action('plugins_loaded', 'quotebuilder_boot');

function quotebuilder_activate() {
    QuoteBuilder_Quote::ensure_page();
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
