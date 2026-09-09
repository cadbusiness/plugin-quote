<?php

if (!defined('ABSPATH')) {
    exit;
}

class QuoteBuilder_Pairing {
    public static function init() {
        add_action('admin_init', [self::class, 'handle_connect']);
        add_action('wp_ajax_quotebuilder_pair', [self::class, 'ajax_pair']);
        add_action('wp_ajax_quotebuilder_unpair', [self::class, 'ajax_unpair']);
        add_action('wp_ajax_quotebuilder_save_origin', [self::class, 'ajax_save_origin']);
    }

    public static function state_key() {
        return 'quotebuilder_oauth_' . get_current_user_id();
    }

    public static function flash($message = null) {
        $key = 'quotebuilder_flash_' . get_current_user_id();
        if ($message !== null) {
            set_transient($key, $message, 120);
            return $message;
        }
        $saved = get_transient($key);
        if ($saved) {
            delete_transient($key);
        }
        return $saved;
    }

    public static function authorize_url() {
        $state = wp_generate_password(24, false, false);
        set_transient(self::state_key(), $state, 20 * MINUTE_IN_SECONDS);
        $query = [
            'site_url' => home_url(),
            'site_name' => wp_specialchars_decode(get_bloginfo('name'), ENT_QUOTES),
            'return' => admin_url('admin.php?page=quotebuilder'),
            'state' => $state,
        ];
        return QuoteBuilder_Settings::origin() . '/integrations/plugin/connect?' . http_build_query($query, '', '&', PHP_QUERY_RFC3986);
    }

    public static function start_url($intent = 'connect') {
        $intent = $intent === 'signup' ? 'signup' : 'connect';
        return wp_nonce_url(
            admin_url('admin.php?page=quotebuilder&qb_connect=start&intent=' . $intent),
            'quotebuilder_connect'
        );
    }

    public static function handle_connect() {
        if (!is_admin() || !isset($_GET['page']) || $_GET['page'] !== 'quotebuilder') {
            return;
        }
        if (!quotebuilder_user_can()) {
            return;
        }
        $action = sanitize_key($_GET['qb_connect'] ?? '');
        if ($action === 'start') {
            check_admin_referer('quotebuilder_connect');
            if (!self::woocommerce_ready()) {
                self::flash("Activez WooCommerce avant de connecter le catalogue.");
                wp_safe_redirect(admin_url('admin.php?page=quotebuilder'));
                exit;
            }
            $connect = self::authorize_url();
            $intent = sanitize_key($_GET['intent'] ?? 'connect');
            if ($intent === 'signup') {
                $parts = wp_parse_url($connect);
                $path = ($parts['path'] ?? '/integrations/plugin/connect');
                if (!empty($parts['query'])) {
                    $path .= '?' . $parts['query'];
                }
                wp_redirect(QuoteBuilder_Settings::origin() . '/signup?next=' . rawurlencode($path));
                exit;
            }
            wp_redirect($connect);
            exit;
        }
        if ($action !== 'done') {
            return;
        }
        $state = sanitize_text_field(wp_unslash($_GET['state'] ?? ''));
        $code = sanitize_text_field(wp_unslash($_GET['code'] ?? ''));
        $saved = get_transient(self::state_key());
        if (!$saved || !$state || !hash_equals((string) $saved, $state)) {
            self::flash("La session de connexion a expiré. Cliquez à nouveau sur Connecter.");
            wp_safe_redirect(admin_url('admin.php?page=quotebuilder'));
            exit;
        }
        delete_transient(self::state_key());
        $result = self::pair($code);
        if (is_wp_error($result)) {
            self::flash($result->get_error_message());
            wp_safe_redirect(admin_url('admin.php?page=quotebuilder'));
            exit;
        }
        $imported = isset($result['imported']) ? (int) $result['imported'] : 0;
        $syncing = !empty($result['syncing']);
        if ($imported) {
            self::flash("Boutique connectée. {$imported} produits importés.");
        } elseif ($syncing) {
            self::flash("Boutique connectée. L’import du catalogue continue en arrière-plan.");
        } else {
            self::flash('Boutique connectée.');
        }
        wp_safe_redirect(admin_url('admin.php?page=quotebuilder&connected=1'));
        exit;
    }


    public static function woocommerce_ready() {
        return class_exists('WooCommerce') && function_exists('wc_rand_hash') && function_exists('wc_api_hash');
    }

    public static function remove_previous_keys() {
        global $wpdb;
        $wpdb->delete(
            $wpdb->prefix . 'woocommerce_api_keys',
            ['description' => QUOTEBUILDER_KEY_DESCRIPTION],
            ['%s']
        );
    }

    public static function create_api_key() {
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

    public static function register_webhooks($delivery_url, $secret) {
        if (!class_exists('WC_Webhook') || empty($delivery_url) || empty($secret)) {
            return 0;
        }
        self::remove_previous_webhooks();
        $created = 0;
        foreach (['product.created', 'product.updated', 'product.deleted'] as $topic) {
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

    public static function remove_previous_webhooks() {
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
            // Rien à nettoyer.
        }
    }

    public static function apply_payload($body) {
        if (!empty($body['connection_id'])) {
            update_option('quotebuilder_connection_id', sanitize_text_field($body['connection_id']));
        }
        $token = $body['plugin_token'] ?? ($body['webhook_secret'] ?? '');
        if ($token) {
            update_option('quotebuilder_plugin_token', sanitize_text_field($token));
        }
        if (!empty($body['org_slug'])) {
            update_option('quotebuilder_org_slug', sanitize_title($body['org_slug']));
        }
        if (!empty($body['org_name'])) {
            update_option('quotebuilder_org_name', sanitize_text_field($body['org_name']));
        }
        if (!empty($body['funnel_slug'])) {
            update_option('quotebuilder_funnel_slug', sanitize_title($body['funnel_slug']));
        }
        if (!empty($body['funnel_name'])) {
            update_option('quotebuilder_funnel_name', sanitize_text_field($body['funnel_name']));
        }
        if (!empty($body['storefront']) && is_array($body['storefront'])) {
            update_option('quotebuilder_storefront', array_merge(QuoteBuilder_Settings::storefront(), $body['storefront']));
        }
        if (isset($body['product_count'])) {
            update_option('quotebuilder_last_imported', (int) $body['product_count']);
        } elseif (isset($body['imported'])) {
            update_option('quotebuilder_last_imported', (int) $body['imported']);
        }
        if (!empty($body['last_sync_at'])) {
            update_option('quotebuilder_last_sync_at', sanitize_text_field($body['last_sync_at']));
        }
        update_option('quotebuilder_paired_at', current_time('mysql'));
    }

    public static function pair($code) {
        if (!self::woocommerce_ready()) {
            return new WP_Error('quotebuilder_woo', "WooCommerce n'est pas actif sur ce site.");
        }
        $origin = QuoteBuilder_Settings::origin();
        if (empty($origin) || strpos($origin, 'http') !== 0) {
            return new WP_Error('quotebuilder_origin', "Renseignez d'abord l'adresse de votre espace QuoteBuilder.");
        }

        self::remove_previous_keys();
        $keys = self::create_api_key();
        if (is_wp_error($keys)) {
            return $keys;
        }

        $response = wp_remote_post($origin . '/api/integrations/pair', [
            'timeout' => 25,
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
            self::remove_previous_keys();
            return $response;
        }

        $code_http = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);
        if ($code_http < 200 || $code_http >= 300) {
            self::remove_previous_keys();
            $message = is_array($body) && !empty($body['error']) ? $body['error'] : 'Appairage refusé.';
            return new WP_Error('quotebuilder_pair', $message);
        }

        self::register_webhooks($body['webhook_url'] ?? '', $body['webhook_secret'] ?? '');
        self::apply_payload($body);
        QuoteBuilder_Quote::ensure_page();

        return [
            'imported' => isset($body['imported']) ? (int) $body['imported'] : 0,
            'funnel' => $body['funnel_name'] ?? '',
            'error' => $body['error'] ?? null,
            'syncing' => !empty($body['syncing']),
        ];
    }

    public static function unpair() {
        self::remove_previous_keys();
        self::remove_previous_webhooks();
        delete_option('quotebuilder_connection_id');
        delete_option('quotebuilder_plugin_token');
        delete_option('quotebuilder_org_slug');
        delete_option('quotebuilder_org_name');
        delete_option('quotebuilder_funnel_slug');
        delete_option('quotebuilder_funnel_name');
        delete_option('quotebuilder_paired_at');
        delete_option('quotebuilder_last_imported');
        delete_option('quotebuilder_last_sync_at');
    }

    public static function refresh() {
        if (!QuoteBuilder_Settings::connected()) {
            return new WP_Error('quotebuilder_pair', 'Plugin non connecté.');
        }
        $response = QuoteBuilder_Settings::request('/api/integrations/plugin', ['method' => 'GET']);
        if (is_wp_error($response)) {
            return $response;
        }
        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);
        if ($code < 200 || $code >= 300 || !is_array($body)) {
            return new WP_Error('quotebuilder_refresh', is_array($body) && !empty($body['error']) ? $body['error'] : 'Espace injoignable.');
        }
        self::apply_payload($body);
        return $body;
    }

    public static function sync_catalog() {
        if (!QuoteBuilder_Settings::connected()) {
            return new WP_Error('quotebuilder_pair', 'Plugin non connecté.');
        }
        $response = QuoteBuilder_Settings::request('/api/integrations/plugin', [
            'method' => 'PATCH',
            'timeout' => 120,
            'body' => wp_json_encode(['sync' => true]),
        ]);
        if (is_wp_error($response)) {
            return $response;
        }
        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);
        if ($code < 200 || $code >= 300 || !is_array($body)) {
            return new WP_Error('quotebuilder_sync', is_array($body) && !empty($body['error']) ? $body['error'] : 'Synchronisation impossible.');
        }
        self::apply_payload($body);
        return $body;
    }

    public static function push_storefront($storefront) {
        if (!QuoteBuilder_Settings::connected()) {
            return;
        }
        QuoteBuilder_Settings::request('/api/integrations/plugin', [
            'method' => 'PATCH',
            'body' => wp_json_encode(['storefront' => $storefront]),
        ]);
    }

    public static function quotes() {
        if (!QuoteBuilder_Settings::connected()) {
            return [];
        }
        $response = QuoteBuilder_Settings::request('/api/integrations/plugin/quotes', ['method' => 'GET']);
        if (is_wp_error($response)) {
            return [];
        }
        $body = json_decode(wp_remote_retrieve_body($response), true);
        return is_array($body['quotes'] ?? null) ? $body['quotes'] : [];
    }

    public static function ajax_pair() {
        check_ajax_referer('quotebuilder_admin');
        if (!quotebuilder_user_can()) {
            wp_send_json_error(['message' => 'Droits insuffisants.'], 403);
        }
        $result = self::pair(sanitize_text_field(wp_unslash($_POST['code'] ?? '')));
        if (is_wp_error($result)) {
            wp_send_json_error(['message' => $result->get_error_message()], 400);
        }
        wp_send_json_success($result);
    }

    public static function ajax_unpair() {
        check_ajax_referer('quotebuilder_admin');
        if (!quotebuilder_user_can()) {
            wp_send_json_error(['message' => 'Droits insuffisants.'], 403);
        }
        self::unpair();
        wp_send_json_success();
    }

    public static function ajax_save_origin() {
        check_ajax_referer('quotebuilder_admin');
        if (!quotebuilder_user_can()) {
            wp_send_json_error(['message' => 'Droits insuffisants.'], 403);
        }
        update_option('quotebuilder_origin', esc_url_raw(wp_unslash($_POST['origin'] ?? '')));
        wp_send_json_success(['origin' => QuoteBuilder_Settings::origin()]);
    }
}
