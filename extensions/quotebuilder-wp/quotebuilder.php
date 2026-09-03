<?php
/**
 * Plugin Name: QuoteBuilder
 * Description: Embed le configurateur QuoteBuilder (shortcode / bloc) et connecte le catalogue WooCommerce en un code d'appairage.
 * Version: 1.1.0
 * Author: Vinci Liberta LTD
 */

if (!defined('ABSPATH')) {
    exit;
}

define('QUOTEBUILDER_VERSION', '1.1.0');
define('QUOTEBUILDER_KEY_DESCRIPTION', 'QuoteBuilder (lecture catalogue)');

function quotebuilder_app_origin() {
    $origin = get_option('quotebuilder_origin', 'https://quotebuilder.example.com');
    return untrailingslashit($origin);
}

// ---------------------------------------------------------------------------
// Embed : shortcode + bloc Gutenberg
// ---------------------------------------------------------------------------

function quotebuilder_render($atts = []) {
    $atts = shortcode_atts([
        'org' => 'demo',
        'id' => 'principal',
        'height' => '720px',
        'style' => 'embed',
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
        QUOTEBUILDER_VERSION,
        true
    );
    register_block_type('quotebuilder/embed', [
        'editor_script' => 'quotebuilder-block',
        'render_callback' => function ($attributes) {
            return quotebuilder_render([
                'org' => $attributes['org'] ?? 'demo',
                'id' => $attributes['id'] ?? 'principal',
                'height' => $attributes['height'] ?? '720px',
            ]);
        },
        'attributes' => [
            'org' => ['type' => 'string', 'default' => 'demo'],
            'id' => ['type' => 'string', 'default' => 'principal'],
            'height' => ['type' => 'string', 'default' => '720px'],
        ],
    ]);
}
add_action('init', 'quotebuilder_register_block');

// ---------------------------------------------------------------------------
// Appairage catalogue : clés WooCommerce en lecture seule + webhooks produits
// ---------------------------------------------------------------------------

function quotebuilder_woocommerce_ready() {
    return class_exists('WooCommerce') && function_exists('wc_rand_hash') && function_exists('wc_api_hash');
}

/**
 * Supprime les clés API créées par une précédente tentative d'appairage.
 */
function quotebuilder_remove_previous_keys() {
    global $wpdb;
    $wpdb->delete(
        $wpdb->prefix . 'woocommerce_api_keys',
        ['description' => QUOTEBUILDER_KEY_DESCRIPTION],
        ['%s']
    );
}

/**
 * Crée une clé REST WooCommerce en lecture seule, comme le fait l'écran natif
 * WooCommerce → Réglages → Avancé → API REST.
 */
function quotebuilder_create_api_key() {
    global $wpdb;

    $consumer_key = 'ck_' . wc_rand_hash();
    $consumer_secret = 'cs_' . wc_rand_hash();

    $inserted = $wpdb->insert(
        $wpdb->prefix . 'woocommerce_api_keys',
        [
            'user_id' => get_current_user_id(),
            'description' => QUOTEBUILDER_KEY_DESCRIPTION,
            'permissions' => 'read',
            'consumer_key' => wc_api_hash($consumer_key),
            'consumer_secret' => $consumer_secret,
            'truncated_key' => substr($consumer_key, -7),
        ],
        ['%d', '%s', '%s', '%s', '%s', '%s']
    );

    if (!$inserted) {
        return new WP_Error('quotebuilder_key', "Impossible de créer la clé API WooCommerce.");
    }

    return [
        'consumer_key' => $consumer_key,
        'consumer_secret' => $consumer_secret,
    ];
}

/**
 * Abonne QuoteBuilder aux changements de produits pour que le catalogue
 * reste à jour sans attendre la synchronisation planifiée.
 */
function quotebuilder_register_webhooks($delivery_url, $secret) {
    if (!class_exists('WC_Webhook') || empty($delivery_url) || empty($secret)) {
        return 0;
    }

    quotebuilder_remove_previous_webhooks();

    $topics = ['product.created', 'product.updated', 'product.deleted'];
    $created = 0;

    foreach ($topics as $topic) {
        $webhook = new WC_Webhook();
        $webhook->set_name('QuoteBuilder – ' . $topic);
        $webhook->set_user_id(get_current_user_id());
        $webhook->set_topic($topic);
        $webhook->set_secret($secret);
        $webhook->set_delivery_url($delivery_url);
        $webhook->set_status('active');
        if ($webhook->save()) {
            $created++;
        }
    }

    return $created;
}

function quotebuilder_remove_previous_webhooks() {
    if (!class_exists('WC_Data_Store')) {
        return;
    }
    try {
        $store = WC_Data_Store::load('webhook');
        foreach ($store->get_webhooks_ids() as $webhook_id) {
            $webhook = new WC_Webhook($webhook_id);
            if (strpos($webhook->get_name(), 'QuoteBuilder') === 0) {
                $webhook->delete(true);
            }
        }
    } catch (Exception $e) {
        // Rien à nettoyer : on continue.
    }
}

/**
 * Envoie les clés fraîchement créées à QuoteBuilder en échange du code d'appairage.
 */
function quotebuilder_pair($code) {
    if (!quotebuilder_woocommerce_ready()) {
        return new WP_Error('quotebuilder_woo', "WooCommerce n'est pas actif sur ce site.");
    }

    $origin = quotebuilder_app_origin();
    if (empty($origin) || strpos($origin, 'http') !== 0) {
        return new WP_Error('quotebuilder_origin', "Renseignez d'abord l'adresse de votre espace QuoteBuilder.");
    }

    quotebuilder_remove_previous_keys();
    $keys = quotebuilder_create_api_key();
    if (is_wp_error($keys)) {
        return $keys;
    }

    $response = wp_remote_post($origin . '/api/integrations/pair', [
        'timeout' => 60,
        'headers' => ['Content-Type' => 'application/json'],
        'body' => wp_json_encode([
            'code' => strtoupper(trim($code)),
            'site_url' => home_url(),
            'site_name' => get_bloginfo('name'),
            'consumer_key' => $keys['consumer_key'],
            'consumer_secret' => $keys['consumer_secret'],
        ]),
    ]);

    if (is_wp_error($response)) {
        quotebuilder_remove_previous_keys();
        return $response;
    }

    $code_http = wp_remote_retrieve_response_code($response);
    $body = json_decode(wp_remote_retrieve_body($response), true);

    if ($code_http < 200 || $code_http >= 300) {
        quotebuilder_remove_previous_keys();
        $message = is_array($body) && !empty($body['error']) ? $body['error'] : 'Appairage refusé.';
        return new WP_Error('quotebuilder_pair', $message);
    }

    $webhooks = quotebuilder_register_webhooks(
        isset($body['webhook_url']) ? $body['webhook_url'] : '',
        isset($body['webhook_secret']) ? $body['webhook_secret'] : ''
    );

    update_option('quotebuilder_connection_id', isset($body['connection_id']) ? $body['connection_id'] : '');
    update_option('quotebuilder_paired_at', current_time('mysql'));
    update_option('quotebuilder_last_imported', isset($body['imported']) ? (int) $body['imported'] : 0);

    return [
        'imported' => isset($body['imported']) ? (int) $body['imported'] : 0,
        'webhooks' => $webhooks,
        'error' => isset($body['error']) ? $body['error'] : null,
    ];
}

function quotebuilder_unpair() {
    quotebuilder_remove_previous_keys();
    quotebuilder_remove_previous_webhooks();
    delete_option('quotebuilder_connection_id');
    delete_option('quotebuilder_paired_at');
    delete_option('quotebuilder_last_imported');
}

// ---------------------------------------------------------------------------
// Écran d'administration
// ---------------------------------------------------------------------------

function quotebuilder_settings_page() {
    add_options_page('QuoteBuilder', 'QuoteBuilder', 'manage_options', 'quotebuilder', 'quotebuilder_render_settings');
}
add_action('admin_menu', 'quotebuilder_settings_page');

function quotebuilder_render_settings() {
    if (!current_user_can('manage_options')) {
        return;
    }

    $notices = [];

    if (isset($_POST['quotebuilder_origin']) && check_admin_referer('quotebuilder_settings')) {
        update_option('quotebuilder_origin', esc_url_raw(wp_unslash($_POST['quotebuilder_origin'])));
        $notices[] = ['updated', 'Adresse enregistrée.'];
    }

    if (isset($_POST['quotebuilder_pair_code']) && check_admin_referer('quotebuilder_pair')) {
        $result = quotebuilder_pair(sanitize_text_field(wp_unslash($_POST['quotebuilder_pair_code'])));
        if (is_wp_error($result)) {
            $notices[] = ['error', $result->get_error_message()];
        } elseif (!empty($result['error'])) {
            $notices[] = ['error', 'Catalogue connecté mais import incomplet : ' . $result['error']];
        } else {
            $notices[] = [
                'updated',
                sprintf(
                    'Catalogue connecté : %d produits envoyés, %d webhooks produits actifs.',
                    $result['imported'],
                    $result['webhooks']
                ),
            ];
        }
    }

    if (isset($_POST['quotebuilder_unpair']) && check_admin_referer('quotebuilder_unpair')) {
        quotebuilder_unpair();
        $notices[] = ['updated', 'Connexion catalogue supprimée.'];
    }

    $origin = esc_attr(get_option('quotebuilder_origin', 'https://quotebuilder.example.com'));
    $connection_id = get_option('quotebuilder_connection_id', '');
    $paired_at = get_option('quotebuilder_paired_at', '');
    $imported = (int) get_option('quotebuilder_last_imported', 0);

    echo '<div class="wrap"><h1>QuoteBuilder</h1>';

    foreach ($notices as $notice) {
        printf('<div class="%s notice is-dismissible"><p>%s</p></div>', esc_attr($notice[0]), esc_html($notice[1]));
    }

    echo '<h2>Espace QuoteBuilder</h2>';
    echo '<form method="post">';
    wp_nonce_field('quotebuilder_settings');
    echo '<p><label>Adresse de votre espace<br><input class="regular-text" name="quotebuilder_origin" value="' . $origin . '" placeholder="https://app.quotebuilder.fr"></label></p>';
    echo '<p>Shortcode d’intégration : <code>[quotebuilder org="mon-org" id="mon-funnel"]</code></p>';
    submit_button('Enregistrer');
    echo '</form>';

    echo '<hr><h2>Catalogue WooCommerce</h2>';

    if (!quotebuilder_woocommerce_ready()) {
        echo '<p><strong>WooCommerce n’est pas actif.</strong> Activez WooCommerce pour envoyer votre catalogue à QuoteBuilder.</p>';
        echo '</div>';
        return;
    }

    if ($connection_id) {
        echo '<p>Ce site est connecté à QuoteBuilder.</p>';
        echo '<table class="widefat striped" style="max-width:640px"><tbody>';
        printf('<tr><th scope="row">Connexion</th><td><code>%s</code></td></tr>', esc_html($connection_id));
        printf('<tr><th scope="row">Appairé le</th><td>%s</td></tr>', esc_html($paired_at));
        printf('<tr><th scope="row">Produits envoyés</th><td>%d</td></tr>', $imported);
        echo '</tbody></table>';
        echo '<form method="post" style="margin-top:12px">';
        wp_nonce_field('quotebuilder_unpair');
        echo '<input type="hidden" name="quotebuilder_unpair" value="1">';
        submit_button('Déconnecter le catalogue', 'delete', 'submit', false);
        echo '</form>';
        echo '<p class="description">La déconnexion révoque la clé API et supprime les webhooks créés par QuoteBuilder.</p>';
    } else {
        echo '<p>Dans QuoteBuilder, ouvrez <strong>Boutiques → Connecter une boutique → WordPress</strong> et copiez le code d’appairage. Le plugin crée alors une clé API en lecture seule et abonne QuoteBuilder aux changements de produits.</p>';
    }

    echo '<form method="post" style="margin-top:12px">';
    wp_nonce_field('quotebuilder_pair');
    echo '<p><label>Code d’appairage<br><input class="regular-text" name="quotebuilder_pair_code" placeholder="XXXXXXXXXXXX" autocomplete="off"></label></p>';
    submit_button($connection_id ? 'Réappairer' : 'Connecter le catalogue');
    echo '</form>';

    echo '</div>';
}
