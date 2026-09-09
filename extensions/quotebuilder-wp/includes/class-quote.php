<?php

if (!defined('ABSPATH')) {
    exit;
}

class QuoteBuilder_Quote {
    public static function init() {
        add_shortcode('quotebuilder_quote', [self::class, 'render_page']);
        add_action('wp_ajax_quotebuilder_quote', [self::class, 'ajax']);
        add_action('wp_ajax_nopriv_quotebuilder_quote', [self::class, 'ajax']);
    }

    public static function key() {
        return 'quotebuilder_quote';
    }

    public static function items() {
        $items = [];
        if (function_exists('WC') && WC()->session) {
            $items = WC()->session->get(self::key(), []);
        }
        if (!is_array($items) || !$items) {
            $cookie = isset($_COOKIE[self::key()]) ? wp_unslash($_COOKIE[self::key()]) : '';
            $decoded = json_decode($cookie, true);
            $items = is_array($decoded) ? $decoded : [];
        }
        return array_values(array_filter($items, function ($item) {
            return is_array($item) && !empty($item['id']);
        }));
    }

    public static function persist($items) {
        $items = array_values($items);
        if (function_exists('WC') && WC()->session) {
            WC()->session->set(self::key(), $items);
        }
        setcookie(self::key(), wp_json_encode($items), time() + WEEK_IN_SECONDS, COOKIEPATH ?: '/', '', is_ssl(), false);
        $_COOKIE[self::key()] = wp_json_encode($items);
        return $items;
    }

    public static function count() {
        $total = 0;
        foreach (self::items() as $item) {
            $total += max(1, (int) ($item['qty'] ?? 1));
        }
        return $total;
    }

    public static function ensure_page() {
        $page_id = (int) get_option('quotebuilder_quote_page_id');
        if ($page_id && get_post($page_id)) {
            return $page_id;
        }
        $existing = get_page_by_path('demande-de-devis');
        if ($existing) {
            update_option('quotebuilder_quote_page_id', $existing->ID);
            return $existing->ID;
        }
        $page_id = wp_insert_post([
            'post_title' => 'Demande de devis',
            'post_name' => 'demande-de-devis',
            'post_status' => 'publish',
            'post_type' => 'page',
            'post_content' => '[quotebuilder_quote]',
        ]);
        if (!is_wp_error($page_id)) {
            update_option('quotebuilder_quote_page_id', $page_id);
            return $page_id;
        }
        return 0;
    }

    public static function page_url() {
        $page_id = (int) get_option('quotebuilder_quote_page_id');
        return $page_id ? get_permalink($page_id) : home_url('/demande-de-devis');
    }

    public static function add_item($product_id, $qty = 1, $variation_id = 0, $options = []) {
        $product = function_exists('wc_get_product') ? wc_get_product($variation_id ?: $product_id) : null;
        $parent = $product && $product->is_type('variation') ? wc_get_product($product->get_parent_id()) : $product;
        $name = $product ? $product->get_name() : get_the_title($product_id);
        $image = '';
        if ($product) {
            $image_id = $product->get_image_id() ?: ($parent ? $parent->get_image_id() : 0);
            $image = $image_id ? wp_get_attachment_image_url($image_id, 'woocommerce_thumbnail') : '';
        }
        $variation = '';
        if ($product && $product->is_type('variation')) {
            $variation = wc_get_formatted_variation($product, true, false, true);
        }
        $items = self::items();
        $key = (string) ($variation_id ?: $product_id);
        $found = false;
        foreach ($items as &$item) {
            if ((string) $item['id'] === (string) $product_id && (string) ($item['variation_id'] ?? '') === (string) $variation_id) {
                $item['qty'] = max(1, (int) $item['qty'] + $qty);
                $found = true;
                break;
            }
        }
        unset($item);
        if (!$found) {
            $items[] = [
                'id' => (string) $product_id,
                'variation_id' => $variation_id ? (string) $variation_id : '',
                'qty' => max(1, (int) $qty),
                'name' => $name,
                'sku' => $product ? $product->get_sku() : '',
                'variation' => $variation,
                'image' => $image,
                'options' => $options,
                'url' => get_permalink($product_id),
            ];
        }
        return self::persist($items);
    }

    public static function from_cart() {
        if (function_exists('wc_load_cart')) {
            wc_load_cart();
        }
        if (!function_exists('WC') || !WC()->cart) {
            return self::items();
        }
        foreach (WC()->cart->get_cart() as $cart_item) {
            $product = $cart_item['data'];
            $parent_id = $product && $product->is_type('variation') ? $product->get_parent_id() : $cart_item['product_id'];
            self::add_item(
                $parent_id,
                (int) $cart_item['quantity'],
                $product && $product->is_type('variation') ? $product->get_id() : 0,
                $cart_item['variation'] ?? []
            );
        }
        WC()->cart->empty_cart();
        return self::items();
    }

    public static function cart_payload() {
        $lines = [];
        foreach (self::items() as $item) {
            $lines[] = [
                'id' => (string) $item['id'],
                'qty' => max(1, (int) ($item['qty'] ?? 1)),
                'name' => $item['name'] ?? '',
                'sku' => $item['sku'] ?? null,
                'variation' => $item['variation'] ?? '',
                'options' => $item['options'] ?? new stdClass(),
            ];
        }
        return $lines;
    }

    public static function render_page() {
        $settings = QuoteBuilder_Settings::storefront();
        $funnel = QuoteBuilder_Settings::funnel();
        $items = self::items();
        ob_start();
        ?>
        <div class="qb-quote-page">
            <div class="qb-quote-list">
                <p class="qb-kicker">Votre liste</p>
                <h2>Demande de devis</h2>
                <?php if (!$items) : ?>
                    <p class="qb-empty">Votre liste est vide. Ajoutez des produits depuis la boutique.</p>
                    <a class="qb-atq" href="<?php echo esc_url(function_exists('wc_get_page_permalink') ? wc_get_page_permalink('shop') : home_url('/')); ?>">Retour à la boutique</a>
                <?php else : ?>
                    <ul class="qb-quote-items">
                        <?php foreach ($items as $item) : ?>
                            <li data-id="<?php echo esc_attr($item['id']); ?>" data-variation="<?php echo esc_attr($item['variation_id'] ?? ''); ?>">
                                <?php if (!empty($item['image'])) : ?>
                                    <img src="<?php echo esc_url($item['image']); ?>" alt="">
                                <?php endif; ?>
                                <div>
                                    <strong><?php echo esc_html($item['name']); ?></strong>
                                    <?php if (!empty($item['variation'])) : ?>
                                        <span><?php echo esc_html($item['variation']); ?></span>
                                    <?php endif; ?>
                                </div>
                                <input type="number" min="1" class="qb-qty" value="<?php echo esc_attr((int) $item['qty']); ?>">
                                <button type="button" class="qb-remove" aria-label="Retirer">Retirer</button>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                <?php endif; ?>
            </div>
            <div class="qb-quote-funnel">
                <?php
                echo QuoteBuilder_Storefront::render_funnel([
                    'org' => $funnel['org'],
                    'id' => $funnel['id'],
                    'height' => '820px',
                    'cart' => $items ? wp_json_encode(self::cart_payload()) : '',
                ]);
                ?>
            </div>
        </div>
        <?php
        unset($settings);
        return ob_get_clean();
    }

    public static function ajax() {
        check_ajax_referer('quotebuilder_storefront', 'nonce');
        if (function_exists('WC') && WC()->session && !WC()->session->has_session()) {
            WC()->session->set_customer_session_cookie(true);
        }
        $action = sanitize_key($_POST['quote_action'] ?? '');
        if ($action === 'add') {
            $items = self::add_item(
                (int) ($_POST['product_id'] ?? 0),
                (int) ($_POST['qty'] ?? 1),
                (int) ($_POST['variation_id'] ?? 0)
            );
        } elseif ($action === 'update') {
            $id = sanitize_text_field(wp_unslash($_POST['product_id'] ?? ''));
            $variation = sanitize_text_field(wp_unslash($_POST['variation_id'] ?? ''));
            $qty = max(1, (int) ($_POST['qty'] ?? 1));
            $items = [];
            foreach (self::items() as $item) {
                if ((string) $item['id'] === $id && (string) ($item['variation_id'] ?? '') === $variation) {
                    $item['qty'] = $qty;
                }
                $items[] = $item;
            }
            $items = self::persist($items);
        } elseif ($action === 'remove') {
            $id = sanitize_text_field(wp_unslash($_POST['product_id'] ?? ''));
            $variation = sanitize_text_field(wp_unslash($_POST['variation_id'] ?? ''));
            $items = array_values(array_filter(self::items(), function ($item) use ($id, $variation) {
                return !((string) $item['id'] === $id && (string) ($item['variation_id'] ?? '') === $variation);
            }));
            $items = self::persist($items);
        } elseif ($action === 'from_cart') {
            $items = self::from_cart();
        } elseif ($action === 'clear') {
            $items = self::persist([]);
        } else {
            $items = self::items();
        }
        wp_send_json_success([
            'items' => $items,
            'count' => self::count(),
            'cart' => self::cart_payload(),
            'url' => self::page_url(),
        ]);
    }
}
