<?php

if (!defined('ABSPATH')) {
    exit;
}

class QuoteBuilder_Settings {
    public static function init() {
        add_action('wp_ajax_quotebuilder_save_storefront', [self::class, 'ajax_save_storefront']);
        add_action('wp_ajax_quotebuilder_search_products', [self::class, 'ajax_search_products']);
        add_action('wp_ajax_quotebuilder_search_categories', [self::class, 'ajax_search_categories']);
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
            'showOnCart',
            'showOnCheckout',
            'outOfStockOnly',
            'showImages',
            'showSku',
            'showQty',
        ];
    }

    public static function defaults() {
        return [
            'hidePrices' => true,
            'hideAddToCart' => true,
            'hideSaleFlash' => true,
            'hideCheckout' => false,
            'priceLabel' => 'Sur devis',
            'buttonLabel' => 'Demander un devis',
            'buttonStyle' => 'button',
            'buttonBg' => '#E85D04',
            'buttonColor' => '#FFFFFF',
            'afterAdd' => 'drawer',
            'showFloatingButton' => true,
            'showOnShop' => true,
            'showOnProduct' => true,
            'showOnCart' => true,
            'showOnCheckout' => true,
            'audience' => 'all',
            'outOfStockOnly' => false,
            'scope' => 'all',
            'productIds' => [],
            'categoryIds' => [],
            'listTitle' => 'Demande de devis',
            'emptyMessage' => 'Votre liste est vide. Ajoutez des produits depuis la boutique.',
            'funnelCta' => 'Envoyer ma demande',
            'continueShoppingLabel' => 'Retour à la boutique',
            'showImages' => true,
            'showSku' => false,
            'showQty' => true,
        ];
    }

    public static function storefront() {
        $saved = get_option('quotebuilder_storefront', []);
        if (!is_array($saved)) {
            $saved = [];
        }
        $settings = array_merge(self::defaults(), $saved);
        $settings['productIds'] = array_values(array_map('strval', (array) $settings['productIds']));
        $settings['categoryIds'] = array_values(array_map('strval', (array) $settings['categoryIds']));
        foreach (self::flags() as $flag) {
            $settings[$flag] = (bool) $settings[$flag];
        }
        if (!in_array($settings['afterAdd'], ['drawer', 'stay', 'list'], true)) {
            $settings['afterAdd'] = 'drawer';
        }
        return $settings;
    }

    public static function save_storefront($incoming) {
        $current = self::storefront();
        $next = array_merge($current, is_array($incoming) ? $incoming : []);
        foreach (self::flags() as $flag) {
            if (is_array($incoming) && array_key_exists($flag, $incoming)) {
                $next[$flag] = (bool) $incoming[$flag];
            }
        }
        if (isset($incoming['productIds'])) {
            $next['productIds'] = array_values(array_filter(array_map('strval', (array) $incoming['productIds'])));
        }
        if (isset($incoming['categoryIds'])) {
            $next['categoryIds'] = array_values(array_filter(array_map('strval', (array) $incoming['categoryIds'])));
        }
        $next['priceLabel'] = sanitize_text_field($next['priceLabel']);
        $next['buttonLabel'] = sanitize_text_field($next['buttonLabel']);
        $next['listTitle'] = sanitize_text_field($next['listTitle']);
        $next['emptyMessage'] = sanitize_text_field($next['emptyMessage']);
        $next['funnelCta'] = sanitize_text_field($next['funnelCta']);
        $next['continueShoppingLabel'] = sanitize_text_field($next['continueShoppingLabel']);
        $next['buttonStyle'] = $next['buttonStyle'] === 'link' ? 'link' : 'button';
        $next['afterAdd'] = in_array($next['afterAdd'], ['drawer', 'stay', 'list'], true) ? $next['afterAdd'] : 'drawer';
        $next['audience'] = $next['audience'] === 'logged_in' ? 'logged_in' : 'all';
        $next['scope'] = in_array($next['scope'], ['all', 'include', 'exclude'], true) ? $next['scope'] : 'all';
        $next['buttonBg'] = sanitize_hex_color($next['buttonBg']) ?: '#E85D04';
        $next['buttonColor'] = sanitize_hex_color($next['buttonColor']) ?: '#FFFFFF';
        update_option('quotebuilder_storefront', $next);
        QuoteBuilder_Pairing::push_storefront($next);
        return $next;
    }

    public static function connected() {
        return (bool) get_option('quotebuilder_connection_id') && get_option('quotebuilder_plugin_token');
    }

    public static function funnel() {
        return [
            'org' => get_option('quotebuilder_org_slug', ''),
            'orgName' => get_option('quotebuilder_org_name', ''),
            'id' => get_option('quotebuilder_funnel_slug', ''),
            'name' => get_option('quotebuilder_funnel_name', ''),
        ];
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
        check_ajax_referer('quotebuilder_admin');
        if (!quotebuilder_user_can()) {
            wp_send_json_error(['message' => 'Droits insuffisants.'], 403);
        }
        $term = sanitize_text_field(wp_unslash($_GET['q'] ?? ''));
        $terms = get_terms([
            'taxonomy' => 'product_cat',
            'hide_empty' => false,
            'search' => $term,
            'number' => 12,
        ]);
        $items = [];
        if (!is_wp_error($terms)) {
            foreach ($terms as $cat) {
                $items[] = ['id' => (string) $cat->term_id, 'name' => $cat->name];
            }
        }
        wp_send_json_success(['items' => $items]);
    }
}
