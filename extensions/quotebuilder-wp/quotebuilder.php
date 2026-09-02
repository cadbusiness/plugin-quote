<?php
/**
 * Plugin Name: QuoteBuilder
 * Description: Embed le configurateur QuoteBuilder via shortcode ou bloc Gutenberg.
 * Version: 1.0.0
 * Author: Vinci Liberta LTD
 */

if (!defined('ABSPATH')) {
    exit;
}

function quotebuilder_app_origin() {
    $origin = get_option('quotebuilder_origin', 'https://quotebuilder.example.com');
    return untrailingslashit($origin);
}

function quotebuilder_render($atts = []) {
    $atts = shortcode_atts([
        'org' => 'quickly',
        'id' => 'rayonnage',
        'height' => '720px',
    ], $atts, 'quotebuilder');

    $origin = esc_url(quotebuilder_app_origin());
    $org = esc_attr($atts['org']);
    $id = esc_attr($atts['id']);
    $height = esc_attr($atts['height']);

    wp_enqueue_script(
        'quotebuilder-widget',
        $origin . '/widget.js',
        [],
        null,
        true
    );

    return sprintf(
        '<div class="quotebuilder-embed" data-quotebuilder data-org="%s" data-id="%s" data-height="%s"></div>',
        $org,
        $id,
        $height
    );
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
        '1.0.0',
        true
    );
    register_block_type('quotebuilder/embed', [
        'editor_script' => 'quotebuilder-block',
        'render_callback' => function ($attributes) {
            return quotebuilder_render([
                'org' => $attributes['org'] ?? 'quickly',
                'id' => $attributes['id'] ?? 'rayonnage',
                'height' => $attributes['height'] ?? '720px',
            ]);
        },
        'attributes' => [
            'org' => ['type' => 'string', 'default' => 'quickly'],
            'id' => ['type' => 'string', 'default' => 'rayonnage'],
            'height' => ['type' => 'string', 'default' => '720px'],
        ],
    ]);
}
add_action('init', 'quotebuilder_register_block');

function quotebuilder_settings_page() {
    add_options_page('QuoteBuilder', 'QuoteBuilder', 'manage_options', 'quotebuilder', function () {
        if (isset($_POST['quotebuilder_origin']) && check_admin_referer('quotebuilder_settings')) {
            update_option('quotebuilder_origin', esc_url_raw(wp_unslash($_POST['quotebuilder_origin'])));
            echo '<div class="updated"><p>Enregistré.</p></div>';
        }
        $origin = esc_attr(get_option('quotebuilder_origin', 'https://quotebuilder.example.com'));
        echo '<div class="wrap"><h1>QuoteBuilder</h1>';
        echo '<form method="post">';
        wp_nonce_field('quotebuilder_settings');
        echo '<p><label>Origine SaaS<br><input class="regular-text" name="quotebuilder_origin" value="' . $origin . '"></label></p>';
        echo '<p>Shortcode : <code>[quotebuilder org="quickly" id="rayonnage"]</code></p>';
        submit_button();
        echo '</form></div>';
    });
}
add_action('admin_menu', 'quotebuilder_settings_page');
