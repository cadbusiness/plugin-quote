<?php

if (!defined('ABSPATH')) {
    exit;
}

class QuoteBuilder_Storefront {
    public static function init() {
        add_action('wp_enqueue_scripts', [self::class, 'assets']);
        add_filter('woocommerce_get_price_html', [self::class, 'price_html'], 20, 2);
        add_filter('woocommerce_sale_flash', [self::class, 'sale_flash'], 20, 3);
        add_filter('woocommerce_order_button_html', [self::class, 'order_button']);
        add_filter('woocommerce_loop_add_to_cart_link', [self::class, 'loop_button'], 20, 2);
        add_action('woocommerce_after_add_to_cart_button', [self::class, 'product_button']);
        add_action('woocommerce_proceed_to_checkout', [self::class, 'cart_button'], 20);
        add_action('woocommerce_review_order_before_submit', [self::class, 'checkout_button']);
        add_action('wp_footer', [self::class, 'drawer']);
        add_filter('body_class', [self::class, 'body_class']);
    }

    public static function assets() {
        if (is_admin() || !QuoteBuilder_Settings::connected()) {
            return;
        }
        wp_enqueue_style(
            'quotebuilder-storefront',
            QUOTEBUILDER_URL . 'assets/storefront.css',
            [],
            QUOTEBUILDER_VERSION
        );
        wp_enqueue_script(
            'quotebuilder-storefront',
            QUOTEBUILDER_URL . 'assets/storefront.js',
            [],
            QUOTEBUILDER_VERSION,
            true
        );
        $funnel = QuoteBuilder_Settings::funnel();
        wp_localize_script('quotebuilder-storefront', 'QuoteBuilderStore', [
            'ajax' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('quotebuilder_storefront'),
            'quoteUrl' => QuoteBuilder_Quote::page_url(),
            'count' => QuoteBuilder_Quote::count(),
            'label' => QuoteBuilder_Settings::storefront()['buttonLabel'],
            'afterAdd' => QuoteBuilder_Settings::storefront()['afterAdd'],
            'origin' => QuoteBuilder_Settings::origin(),
            'org' => $funnel['org'],
            'funnel' => $funnel['id'],
        ]);
    }

    public static function body_class($classes) {
        if (!QuoteBuilder_Settings::connected()) {
            return $classes;
        }
        $settings = QuoteBuilder_Settings::storefront();
        if ($settings['hidePrices']) {
            $classes[] = 'qb-hide-prices';
        }
        if ($settings['hideAddToCart']) {
            $classes[] = 'qb-hide-cart';
        }
        if ($settings['hideCheckout']) {
            $classes[] = 'qb-hide-checkout';
        }
        if ($settings['hideSaleFlash']) {
            $classes[] = 'qb-hide-sale';
        }
        return $classes;
    }

    public static function applies($product = null) {
        $settings = QuoteBuilder_Settings::storefront();
        if (!QuoteBuilder_Settings::connected() || ($settings['audience'] === 'logged_in' && !is_user_logged_in())) {
            return false;
        }
        if (!$product && function_exists('wc_get_product')) {
            $product = wc_get_product(get_the_ID());
        }
        if (!$product) {
            return true;
        }
        if ($settings['outOfStockOnly'] && $product->is_in_stock()) {
            return false;
        }
        $product_id = (string) $product->get_id();
        $parent_id = $product->is_type('variation') ? (string) $product->get_parent_id() : $product_id;
        $in_products = in_array($product_id, $settings['productIds'], true) || in_array($parent_id, $settings['productIds'], true);
        $in_cats = false;
        if ($settings['categoryIds']) {
            $terms = wp_get_post_terms($parent_id, 'product_cat', ['fields' => 'ids']);
            if (!is_wp_error($terms)) {
                foreach ($terms as $term_id) {
                    if (in_array((string) $term_id, $settings['categoryIds'], true)) {
                        $in_cats = true;
                        break;
                    }
                }
            }
        }
        $listed = $in_products || $in_cats;
        if ($settings['scope'] === 'include') {
            return $listed;
        }
        if ($settings['scope'] === 'exclude') {
            return !$listed;
        }
        return true;
    }

    public static function sale_flash($html, $post, $product) {
        $settings = QuoteBuilder_Settings::storefront();
        if ($settings['hideSaleFlash'] && self::applies($product)) {
            return '';
        }
        return $html;
    }

    public static function order_button($html) {
        if (QuoteBuilder_Settings::storefront()['hideCheckout']) {
            return '';
        }
        return $html;
    }

    public static function price_html($html, $product) {
        $settings = QuoteBuilder_Settings::storefront();
        if ($settings['hidePrices'] && self::applies($product)) {
            return '<span class="qb-price-hidden">' . esc_html($settings['priceLabel']) . '</span>';
        }
        return $html;
    }

    public static function loop_button($html, $product) {
        $settings = QuoteBuilder_Settings::storefront();
        if (!$settings['showOnShop'] || !self::applies($product)) {
            return $html;
        }
        if ($settings['hideAddToCart']) {
            return self::button($product);
        }
        return $html . self::button($product);
    }

    public static function product_button() {
        global $product;
        $settings = QuoteBuilder_Settings::storefront();
        if (!$settings['showOnProduct'] || !$product || !self::applies($product)) {
            return;
        }
        echo self::button($product);
    }

    public static function cart_button() {
        if (!QuoteBuilder_Settings::storefront()['showOnCart']) {
            return;
        }
        echo '<button type="button" class="qb-atq qb-from-cart">' . esc_html(QuoteBuilder_Settings::storefront()['buttonLabel']) . '</button>';
    }

    public static function checkout_button() {
        if (!QuoteBuilder_Settings::storefront()['showOnCheckout']) {
            return;
        }
        echo '<button type="button" class="qb-atq qb-from-cart">' . esc_html(QuoteBuilder_Settings::storefront()['buttonLabel']) . '</button>';
    }

    public static function button($product) {
        $settings = QuoteBuilder_Settings::storefront();
        $style = sprintf(
            '--qb-btn-bg:%s;--qb-btn-color:%s;',
            esc_attr($settings['buttonBg']),
            esc_attr($settings['buttonColor'])
        );
        $class = $settings['buttonStyle'] === 'link' ? 'qb-atq qb-atq-link' : 'qb-atq';
        return sprintf(
            '<button type="button" class="%s" style="%s" data-product="%s" data-type="%s">%s</button>',
            esc_attr($class),
            $style,
            esc_attr($product->get_id()),
            esc_attr($product->get_type()),
            esc_html($settings['buttonLabel'])
        );
    }

    public static function drawer() {
        if (is_admin() || !QuoteBuilder_Settings::connected()) {
            return;
        }
        $count = QuoteBuilder_Quote::count();
        $items = QuoteBuilder_Quote::items();
        $settings = QuoteBuilder_Settings::storefront();
        ?>
        <aside class="qb-drawer" hidden>
            <button type="button" class="qb-drawer-close" aria-label="Fermer">×</button>
            <p class="qb-kicker">Liste de devis</p>
            <h2><?php echo esc_html($settings['listTitle']); ?></h2>
            <ul class="qb-drawer-items">
                <?php foreach ($items as $item) : ?>
                    <li>
                        <span><?php echo esc_html($item['name']); ?></span>
                        <em>×<?php echo esc_html((int) $item['qty']); ?></em>
                    </li>
                <?php endforeach; ?>
            </ul>
            <a class="qb-atq" href="<?php echo esc_url(QuoteBuilder_Quote::page_url()); ?>"><?php echo esc_html($settings['funnelCta']); ?></a>
        </aside>
        <?php if ($settings['showFloatingButton']) : ?>
        <button type="button" class="qb-fab" data-count="<?php echo esc_attr($count); ?>" <?php echo $count ? '' : 'hidden'; ?>>
            <span><?php echo esc_html($count); ?></span>
            Devis
        </button>
        <?php endif; ?>
        <?php
    }

    public static function render_funnel($atts = []) {
        $funnel = QuoteBuilder_Settings::funnel();
        $atts = shortcode_atts([
            'org' => $funnel['org'],
            'id' => $funnel['id'],
            'height' => '720px',
            'cart' => '',
        ], $atts, 'quotebuilder');

        $origin = esc_url(QuoteBuilder_Settings::origin());
        if (!$atts['org'] || !$atts['id'] || !QuoteBuilder_Settings::connected()) {
            return '<p class="qb-empty">Connectez QuoteBuilder dans WordPress pour afficher le funnel et collecter les demandes.</p>';
        }
        wp_enqueue_script(
            'quotebuilder-widget',
            $origin . '/widget.js',
            [],
            null,
            true
        );

        $cart = $atts['cart'] ?: (QuoteBuilder_Quote::items() ? wp_json_encode(QuoteBuilder_Quote::cart_payload()) : '');

        return sprintf(
            '<div class="quotebuilder-embed" data-quotebuilder data-org="%s" data-id="%s" data-height="%s"%s></div>',
            esc_attr($atts['org']),
            esc_attr($atts['id']),
            esc_attr($atts['height']),
            $cart ? ' data-cart="' . esc_attr($cart) . '"' : ''
        );
    }
}
