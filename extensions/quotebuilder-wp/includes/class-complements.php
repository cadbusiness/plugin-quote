<?php

if (!defined('ABSPATH')) {
    exit;
}

class QuoteBuilder_Complements {
    const UPSELL_SCORE = 3;
    const CROSS_SELL_SCORE = 2;
    const RELATED_SCORE = 1;

    public static function html($product_ids) {
        if (!QuoteBuilder_Settings::connected() || !function_exists('wc_get_product')) {
            return '';
        }
        $settings = QuoteBuilder_Settings::storefront();
        if (empty($settings['showComplements'])) {
            return '';
        }
        $products = self::rank($product_ids, (int) $settings['complementsLimit']);
        if (!$products) {
            return '';
        }
        $title = $settings['complementsTitle'] ?: 'Souvent demandé avec';
        $hide_prices = $settings['hidePrices'];
        ob_start();
        ?>
        <section class="qb-complements">
            <p class="qb-kicker">Pour aller plus loin</p>
            <h3><?php echo esc_html($title); ?></h3>
            <ul class="qb-complements-list">
                <?php foreach ($products as $product) : ?>
                    <?php
                    $image_id = $product->get_image_id();
                    $image = $image_id ? wp_get_attachment_image_url($image_id, 'woocommerce_thumbnail') : '';
                    ?>
                    <li>
                        <?php if ($image) : ?>
                            <img src="<?php echo esc_url($image); ?>" alt="">
                        <?php endif; ?>
                        <div>
                            <strong><?php echo esc_html($product->get_name()); ?></strong>
                            <?php if (!$hide_prices && $settings['showPrice']) : ?>
                                <span><?php echo wp_kses_post(QuoteBuilder_Quote::money($product->get_price())); ?></span>
                            <?php endif; ?>
                            <?php echo QuoteBuilder_Storefront::button($product); ?>
                        </div>
                    </li>
                <?php endforeach; ?>
            </ul>
        </section>
        <?php
        return ob_get_clean();
    }

    public static function product_page() {
        global $product;
        if (!$product || !QuoteBuilder_Storefront::applies($product)) {
            return;
        }
        echo self::html([$product->get_id()]);
    }

    public static function rank($product_ids, $limit = 4) {
        if (!function_exists('wc_get_product')) {
            return [];
        }
        $limit = max(1, min(8, (int) $limit));
        $ids = [];
        foreach ((array) $product_ids as $id) {
            $id = (int) $id;
            if ($id) {
                $ids[] = $id;
            }
        }
        if (!$ids) {
            return [];
        }

        $exclude = [];
        foreach ($ids as $id) {
            $product = wc_get_product($id);
            if (!$product) {
                continue;
            }
            $exclude[(int) $product->get_id()] = true;
            if ($product->is_type('variation')) {
                $exclude[(int) $product->get_parent_id()] = true;
            }
        }
        if (class_exists('QuoteBuilder_Quote')) {
            foreach (QuoteBuilder_Quote::items() as $item) {
                $exclude[(int) $item['id']] = true;
                if (!empty($item['variation_id'])) {
                    $exclude[(int) $item['variation_id']] = true;
                }
            }
        }

        $scores = [];
        foreach ($ids as $id) {
            $product = wc_get_product($id);
            if (!$product) {
                continue;
            }
            $parent = $product->is_type('variation') ? wc_get_product($product->get_parent_id()) : $product;
            if (!$parent) {
                continue;
            }
            foreach ((array) $parent->get_upsell_ids() as $uid) {
                $scores[(int) $uid] = ($scores[(int) $uid] ?? 0) + self::UPSELL_SCORE;
            }
            foreach ((array) $parent->get_cross_sell_ids() as $cid) {
                $scores[(int) $cid] = ($scores[(int) $cid] ?? 0) + self::CROSS_SELL_SCORE;
            }
            $related = function_exists('wc_get_related_products')
                ? wc_get_related_products($parent->get_id(), 8, array_keys($exclude))
                : [];
            foreach ((array) $related as $rid) {
                $scores[(int) $rid] = ($scores[(int) $rid] ?? 0) + self::RELATED_SCORE;
            }
        }

        $ranked = [];
        foreach ($scores as $id => $score) {
            if (isset($exclude[$id]) || $score < 1) {
                continue;
            }
            $product = wc_get_product($id);
            if (!$product || !QuoteBuilder_Storefront::applies($product)) {
                continue;
            }
            $ranked[] = ['product' => $product, 'score' => $score, 'name' => $product->get_name()];
        }

        usort($ranked, function ($a, $b) {
            if ($a['score'] === $b['score']) {
                return strcasecmp($a['name'], $b['name']);
            }
            return $b['score'] <=> $a['score'];
        });

        $out = [];
        foreach (array_slice($ranked, 0, $limit) as $row) {
            $out[] = $row['product'];
        }
        return $out;
    }
}
