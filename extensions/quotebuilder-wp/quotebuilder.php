<?php
/**
 * Plugin Name: QuoteBuilder
 * Description: Transforme WooCommerce en boutique devis : masquer les prix, liste de devis, funnel QuoteBuilder.
 * Version: 2.3.20
 * Author: QuoteBuilder
 * Author URI: https://quotebuilder-weld.vercel.app
 * Requires at least: 6.0
 * Requires PHP: 7.4
 * Update URI: https://quotebuilder-weld.vercel.app
 * Text Domain: quotebuilder
 */

if (!defined('ABSPATH')) {
    exit;
}

if (defined('QUOTEBUILDER_LOADED')) {
    return;
}
define('QUOTEBUILDER_LOADED', true);

define('QUOTEBUILDER_VERSION', '2.3.20');
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
    'includes/class-complements.php',
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

function quotebuilder_show_form_when_list_empty() {
    if (get_option('quotebuilder_empty_form_v') === '1') {
        return;
    }
    $saved = get_option('quotebuilder_storefront', []);
    if (!is_array($saved)) {
        $saved = [];
    }
    $saved['showFormWhenEmpty'] = true;
    update_option('quotebuilder_storefront', $saved);
    update_option('quotebuilder_empty_form_v', '1');
    if (class_exists('QuoteBuilder_Settings')) {
        QuoteBuilder_Settings::flush_runtime_cache();
    }
}
add_action('plugins_loaded', 'quotebuilder_show_form_when_list_empty', 20);

function quotebuilder_boot() {
    QuoteBuilder_Settings::init();
    QuoteBuilder_Pairing::init();
    QuoteBuilder_Quote::init();
    QuoteBuilder_Storefront::init();
    add_action('admin_init', ['QuoteBuilder_Pairing', 'maybe_refresh_labels']);
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

function quotebuilder_render_capture($atts = []) {
    if (!is_array($atts)) {
        $atts = [];
    }
    $atts['module'] = 'capture';
    if (empty($atts['height'])) {
        $atts['height'] = '240px';
    }
    return QuoteBuilder_Storefront::render_funnel($atts);
}
add_shortcode('quotebuilder_capture', 'quotebuilder_render_capture');

function quotebuilder_render_agent($atts = []) {
    if (!is_array($atts)) {
        $atts = [];
    }
    $atts['module'] = 'agent';
    if (empty($atts['height'])) {
        $atts['height'] = '420px';
    }
    return QuoteBuilder_Storefront::render_funnel($atts);
}
add_shortcode('quotebuilder_agent', 'quotebuilder_render_agent');

function quotebuilder_submit($data) {
    return QuoteBuilder_Pairing::submit($data);
}

function quotebuilder_start($data) {
    return QuoteBuilder_Pairing::start($data);
}

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
    register_block_type('quotebuilder/capture', [
        'editor_script' => 'quotebuilder-block',
        'render_callback' => function ($attributes) {
            return QuoteBuilder_Storefront::render_funnel([
                'org' => $attributes['org'] ?? '',
                'id' => $attributes['id'] ?? '',
                'height' => '240px',
                'module' => 'capture',
                'placeholder' => $attributes['placeholder'] ?? '',
                'promise' => $attributes['promise'] ?? '',
                'phone' => $attributes['phone'] ?? '',
            ]);
        },
        'attributes' => [
            'org' => ['type' => 'string', 'default' => ''],
            'id' => ['type' => 'string', 'default' => ''],
            'placeholder' => ['type' => 'string', 'default' => ''],
            'promise' => ['type' => 'string', 'default' => ''],
            'phone' => ['type' => 'string', 'default' => ''],
        ],
    ]);
    register_block_type('quotebuilder/agent', [
        'editor_script' => 'quotebuilder-block',
        'render_callback' => function ($attributes) {
            return QuoteBuilder_Storefront::render_funnel([
                'org' => $attributes['org'] ?? '',
                'id' => $attributes['id'] ?? '',
                'height' => '420px',
                'module' => 'agent',
            ]);
        },
        'attributes' => [
            'org' => ['type' => 'string', 'default' => ''],
            'id' => ['type' => 'string', 'default' => ''],
        ],
    ]);
}
add_action('init', 'quotebuilder_register_block');
