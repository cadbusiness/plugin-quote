<?php

if (!defined('ABSPATH')) {
    exit;
}

class QuoteBuilder_Settings {
    private static $storefront = null;
    private static $connected = null;
    private static $funnel = null;

    public static function init() {
        add_action('wp_ajax_quotebuilder_save_storefront', [self::class, 'ajax_save_storefront']);
        add_action('wp_ajax_quotebuilder_search_products', [self::class, 'ajax_search_products']);
        add_action('wp_ajax_quotebuilder_search_categories', [self::class, 'ajax_search_categories']);
        add_action('wp_ajax_quotebuilder_search_tags', [self::class, 'ajax_search_tags']);
        add_action('wp_ajax_quotebuilder_create_quote_page', [self::class, 'ajax_create_quote_page']);
        add_action('wp_ajax_quotebuilder_refresh', [self::class, 'ajax_refresh']);
        add_action('wp_ajax_quotebuilder_sync', [self::class, 'ajax_sync']);
    }

    public static function origin() {
        $origin = get_option('quotebuilder_origin', '');
        if (!$origin || strpos($origin, 'example.com') !== false) {
            return QUOTEBUILDER_DEFAULT_ORIGIN;
        }
        return untrailingslashit($origin);
    }

    public static function flags() {
        return [
            'hidePrices',
            'hideAddToCart',
            'hideSaleFlash',
            'hideCheckout',
            'showFloatingButton',
            'showOnShop',
            'showOnProduct',
            'showOnBlocks',
            'showOnCart',
            'showOnCheckout',
            'outOfStockOnly',
            'showFormWhenEmpty',
            'showImages',
            'showSku',
            'showQty',
            'showPrice',
            'showLineTotal',
            'showGrandTotal',
            'showTaxes',
            'showUniqueCount',
            'showBackToShop',
            'showUpdateList',
            'showClearList',
            'showComplements',
        ];
    }

    public static function defaults() {
        return [
            'hidePrices' => true,
            'hideAddToCart' => true,
            'hideSaleFlash' => true,
            'hideCheckout' => false,
            'priceLabel' => 'Sur devis',
            'buttonLabel' => 'Ajouter au devis',
            'buttonStyle' => 'button',
            'buttonBg' => '#E85D04',
            'buttonBgHover' => '#C2410C',
            'buttonBorder' => '#E85D04',
            'buttonBorderHover' => '#C2410C',
            'buttonColor' => '#FFFFFF',
            'buttonColorHover' => '#FFFFFF',
            'requestQuoteLabel' => 'Demander un devis',
            'requestButtonStyle' => 'button',
            'requestBg' => '#E85D04',
            'requestBgHover' => '#C2410C',
            'requestBorder' => '#E85D04',
            'requestBorderHover' => '#C2410C',
            'requestColor' => '#FFFFFF',
            'requestColorHover' => '#FFFFFF',
            'afterAdd' => 'drawer',
            'addedLabel' => 'Produit ajouté à la liste',
            'alreadyInListLabel' => 'Ce produit figure déjà dans votre liste de devis.',
            'browseListLabel' => 'Consulter la liste',
            'showFloatingButton' => true,
            'showOnShop' => true,
            'showOnProduct' => true,
            'showOnBlocks' => true,
            'showOnCart' => true,
            'showOnCheckout' => false,
            'productButtonPosition' => 'inline',
            'audience' => 'all',
            'roles' => [],
            'stockMode' => 'all',
            'outOfStockOnly' => false,
            'scope' => 'all',
            'productIds' => [],
            'categoryIds' => [],
            'tagIds' => [],
            'listTitle' => 'Demande de devis',
            'emptyMessage' => 'Votre liste est vide. Ajoutez des produits depuis la boutique.',
            'funnelCta' => 'Envoyer ma demande',
            'formTitle' => 'Envoyer la demande',
            'pageLayout' => 'split',
            'showFormWhenEmpty' => false,
            'showImages' => true,
            'showSku' => false,
            'showQty' => true,
            'showPrice' => false,
            'showLineTotal' => false,
            'showGrandTotal' => false,
            'showTaxes' => false,
            'showUniqueCount' => false,
            'showBackToShop' => true,
            'continueShoppingLabel' => 'Retour à la boutique',
            'continueShoppingUrlMode' => 'shop',
            'continueShoppingCustomUrl' => '',
            'showUpdateList' => true,
            'updateListLabel' => 'Mettre à jour la liste',
            'showClearList' => true,
            'clearListLabel' => 'Effacer la liste',
            'quotePageId' => '',
            'quotePageUrl' => '',
            'showComplements' => true,
            'complementsTitle' => 'Souvent demandé avec',
            'complementsLimit' => 4,
        ];
    }

    public static function storefront() {
        if (self::$storefront !== null) {
            return self::$storefront;
        }
        $saved = get_option('quotebuilder_storefront', []);
        if (!is_array($saved)) {
            $saved = [];
        }
        $settings = array_merge(self::defaults(), $saved);
        foreach (['productIds', 'categoryIds', 'tagIds', 'roles'] as $list) {
            $settings[$list] = array_values(array_filter(array_map('strval', (array) $settings[$list])));
        }
        foreach (self::flags() as $flag) {
            $settings[$flag] = (bool) $settings[$flag];
        }
        if (empty($settings['stockMode']) && !empty($settings['outOfStockOnly'])) {
            $settings['stockMode'] = 'oos_only';
        }
        if (!in_array($settings['stockMode'], ['all', 'oos_only', 'hide_oos'], true)) {
            $settings['stockMode'] = 'all';
        }
        $settings['outOfStockOnly'] = $settings['stockMode'] === 'oos_only';
        if (!in_array($settings['afterAdd'], ['drawer', 'notice', 'list', 'stay'], true)) {
            $settings['afterAdd'] = 'drawer';
        }
        if (!in_array($settings['audience'], ['all', 'logged_in', 'guests', 'roles'], true)) {
            $settings['audience'] = 'all';
        }
        if (!in_array($settings['scope'], ['all', 'include', 'exclude'], true)) {
            $settings['scope'] = 'all';
        }
        if ($settings['productButtonPosition'] !== 'below') {
            $settings['productButtonPosition'] = 'inline';
        }
        if ($settings['pageLayout'] !== 'stack') {
            $settings['pageLayout'] = 'split';
        }
        if ($settings['continueShoppingUrlMode'] !== 'custom') {
            $settings['continueShoppingUrlMode'] = 'shop';
        }
        if ($settings['buttonStyle'] !== 'link') {
            $settings['buttonStyle'] = 'button';
        }
        if ($settings['requestButtonStyle'] !== 'link') {
            $settings['requestButtonStyle'] = 'button';
        }
        $limit = (int) $settings['complementsLimit'];
        if ($limit < 1) {
            $limit = 1;
        }
        if ($limit > 8) {
            $limit = 8;
        }
        $settings['complementsLimit'] = $limit;
        $page_id = (int) get_option('quotebuilder_quote_page_id');
        if ($page_id && empty($settings['quotePageId'])) {
            $settings['quotePageId'] = (string) $page_id;
        }
        $settings['quotePageUrl'] = QuoteBuilder_Quote::page_url();
        self::$storefront = $settings;
        return $settings;
    }

    public static function flush_runtime_cache() {
        self::$storefront = null;
        self::$connected = null;
        self::$funnel = null;
    }

    public static function save_storefront($incoming) {
        $current = self::storefront();
        $next = array_merge($current, is_array($incoming) ? $incoming : []);
        foreach (self::flags() as $flag) {
            if (is_array($incoming) && array_key_exists($flag, $incoming)) {
                $next[$flag] = (bool) $incoming[$flag];
            }
        }
        foreach (['productIds', 'categoryIds', 'tagIds', 'roles'] as $list) {
            if (isset($incoming[$list])) {
                $next[$list] = array_values(array_filter(array_map('strval', (array) $incoming[$list])));
            }
        }
        $text_keys = [
            'priceLabel', 'buttonLabel', 'requestQuoteLabel', 'addedLabel', 'alreadyInListLabel',
            'browseListLabel', 'listTitle', 'emptyMessage', 'funnelCta', 'formTitle',
            'continueShoppingLabel', 'updateListLabel', 'clearListLabel', 'quotePageId',
            'complementsTitle',
        ];
        foreach ($text_keys as $key) {
            $next[$key] = sanitize_text_field($next[$key] ?? '');
        }
        $next['continueShoppingCustomUrl'] = esc_url_raw($next['continueShoppingCustomUrl'] ?? '');
        $next['buttonStyle'] = $next['buttonStyle'] === 'link' ? 'link' : 'button';
        $next['requestButtonStyle'] = $next['requestButtonStyle'] === 'link' ? 'link' : 'button';
        $next['afterAdd'] = in_array($next['afterAdd'], ['drawer', 'notice', 'list', 'stay'], true) ? $next['afterAdd'] : 'drawer';
        $next['audience'] = in_array($next['audience'], ['all', 'logged_in', 'guests', 'roles'], true) ? $next['audience'] : 'all';
        $next['scope'] = in_array($next['scope'], ['all', 'include', 'exclude'], true) ? $next['scope'] : 'all';
        $next['stockMode'] = in_array($next['stockMode'], ['all', 'oos_only', 'hide_oos'], true) ? $next['stockMode'] : 'all';
        $next['outOfStockOnly'] = $next['stockMode'] === 'oos_only';
        $next['productButtonPosition'] = $next['productButtonPosition'] === 'below' ? 'below' : 'inline';
        $next['pageLayout'] = $next['pageLayout'] === 'stack' ? 'stack' : 'split';
        $next['continueShoppingUrlMode'] = $next['continueShoppingUrlMode'] === 'custom' ? 'custom' : 'shop';
        $limit = (int) ($next['complementsLimit'] ?? 4);
        if ($limit < 1) {
            $limit = 1;
        }
        if ($limit > 8) {
            $limit = 8;
        }
        $next['complementsLimit'] = $limit;
        $colors = [
            'buttonBg' => '#E85D04',
            'buttonBgHover' => '#C2410C',
            'buttonBorder' => '#E85D04',
            'buttonBorderHover' => '#C2410C',
            'buttonColor' => '#FFFFFF',
            'buttonColorHover' => '#FFFFFF',
            'requestBg' => '#E85D04',
            'requestBgHover' => '#C2410C',
            'requestBorder' => '#E85D04',
            'requestBorderHover' => '#C2410C',
            'requestColor' => '#FFFFFF',
            'requestColorHover' => '#FFFFFF',
        ];
        foreach ($colors as $key => $fallback) {
            $next[$key] = sanitize_hex_color($next[$key] ?? '') ?: $fallback;
        }
        $page_id = (int) $next['quotePageId'];
        if ($page_id) {
            update_option('quotebuilder_quote_page_id', $page_id);
        }
        $next['quotePageId'] = $page_id ? (string) $page_id : '';
        QuoteBuilder_Quote::flush_page_cache();
        $next['quotePageUrl'] = esc_url_raw(QuoteBuilder_Quote::page_url());
        update_option('quotebuilder_storefront', $next, true);
        self::$storefront = null;
        QuoteBuilder_Pairing::push_storefront($next);
        return $next;
    }

    public static function connected() {
        if (self::$connected !== null) {
            return self::$connected;
        }
        self::$connected = (bool) get_option('quotebuilder_connection_id') && get_option('quotebuilder_plugin_token');
        return self::$connected;
    }

    public static function funnel() {
        if (self::$funnel !== null) {
            return self::$funnel;
        }
        self::$funnel = [
            'org' => get_option('quotebuilder_org_slug', ''),
            'orgName' => get_option('quotebuilder_org_name', ''),
            'id' => get_option('quotebuilder_funnel_slug', ''),
            'name' => get_option('quotebuilder_funnel_name', ''),
        ];
        return self::$funnel;
    }

    public static function request($path, $args = []) {
        $origin = self::origin();
        $connection = get_option('quotebuilder_connection_id');
        $token = get_option('quotebuilder_plugin_token');
        $defaults = [
            'timeout' => 30,
            'headers' => [
                'Content-Type' => 'application/json',
                'Authorization' => 'Bearer ' . $token,
                'X-QuoteBuilder-Connection' => $connection,
            ],
        ];
        return wp_remote_request($origin . $path, array_merge($defaults, $args));
    }

    public static function ajax_save_storefront() {
        check_ajax_referer('quotebuilder_admin');
        if (!quotebuilder_user_can()) {
            wp_send_json_error(['message' => 'Droits insuffisants.'], 403);
        }
        $body = json_decode(wp_unslash($_POST['payload'] ?? '{}'), true);
        $saved = self::save_storefront(is_array($body) ? $body : []);
        wp_send_json_success(['storefront' => $saved]);
    }

    public static function ajax_refresh() {
        check_ajax_referer('quotebuilder_admin');
        if (!quotebuilder_user_can()) {
            wp_send_json_error(['message' => 'Droits insuffisants.'], 403);
        }
        $payload = QuoteBuilder_Pairing::refresh();
        if (is_wp_error($payload)) {
            wp_send_json_error(['message' => $payload->get_error_message()], 400);
        }
        wp_send_json_success($payload);
    }

    public static function ajax_sync() {
        check_ajax_referer('quotebuilder_admin');
        if (!quotebuilder_user_can()) {
            wp_send_json_error(['message' => 'Droits insuffisants.'], 403);
        }
        $payload = QuoteBuilder_Pairing::sync_catalog();
        if (is_wp_error($payload)) {
            wp_send_json_error(['message' => $payload->get_error_message()], 400);
        }
        wp_send_json_success($payload);
    }

    public static function ajax_create_quote_page() {
        check_ajax_referer('quotebuilder_admin');
        if (!quotebuilder_user_can()) {
            wp_send_json_error(['message' => 'Droits insuffisants.'], 403);
        }
        $page_id = wp_insert_post([
            'post_title' => 'Demande de devis',
            'post_name' => 'demande-de-devis',
            'post_status' => 'publish',
            'post_type' => 'page',
            'post_content' => '[quotebuilder_quote]',
        ]);
        if (is_wp_error($page_id) || !$page_id) {
            wp_send_json_error(['message' => 'Impossible de créer la page.'], 400);
        }
        update_option('quotebuilder_quote_page_id', $page_id);
        $saved = self::save_storefront(['quotePageId' => (string) $page_id]);
        wp_send_json_success([
            'id' => (string) $page_id,
            'title' => get_the_title($page_id),
            'url' => get_permalink($page_id),
            'storefront' => $saved,
        ]);
    }

    public static function ajax_search_products() {
        check_ajax_referer('quotebuilder_admin');
        if (!quotebuilder_user_can()) {
            wp_send_json_error(['message' => 'Droits insuffisants.'], 403);
        }
        $term = sanitize_text_field(wp_unslash($_GET['q'] ?? ''));
        $query = new WP_Query([
            'post_type' => 'product',
            's' => $term,
            'posts_per_page' => 12,
            'post_status' => 'publish',
        ]);
        $items = [];
        foreach ($query->posts as $post) {
            $items[] = ['id' => (string) $post->ID, 'name' => $post->post_title];
        }
        wp_send_json_success(['items' => $items]);
    }

    public static function ajax_search_categories() {
        self::ajax_search_terms('product_cat');
    }

    public static function ajax_search_tags() {
        self::ajax_search_terms('product_tag');
    }

    private static function ajax_search_terms($taxonomy) {
        check_ajax_referer('quotebuilder_admin');
        if (!quotebuilder_user_can()) {
            wp_send_json_error(['message' => 'Droits insuffisants.'], 403);
        }
        $term = sanitize_text_field(wp_unslash($_GET['q'] ?? ''));
        $terms = get_terms([
            'taxonomy' => $taxonomy,
            'hide_empty' => false,
            'search' => $term,
            'number' => 12,
        ]);
        $items = [];
        if (!is_wp_error($terms)) {
            foreach ($terms as $row) {
                $items[] = ['id' => (string) $row->term_id, 'name' => $row->name];
            }
        }
        wp_send_json_success(['items' => $items]);
    }
}
