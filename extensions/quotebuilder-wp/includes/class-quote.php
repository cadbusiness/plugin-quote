<?php

if (!defined('ABSPATH')) {
    exit;
}

class QuoteBuilder_Quote {
    private static $cached_items = null;
    private static $cached_page_url = null;

    public static function init() {
        add_shortcode('quotebuilder_quote', [self::class, 'render_page']);
        add_action('wp_ajax_quotebuilder_quote', [self::class, 'ajax']);
        add_action('wp_ajax_nopriv_quotebuilder_quote', [self::class, 'ajax']);
    }

    public static function key() {
        return 'quotebuilder_quote';
    }

    public static function items() {
        if (self::$cached_items !== null) {
            return self::$cached_items;
        }
        $cookie = isset($_COOKIE[self::key()]) ? wp_unslash($_COOKIE[self::key()]) : '';
        $decoded = json_decode($cookie, true);
        $items = is_array($decoded) ? $decoded : [];
        self::$cached_items = array_values(array_filter($items, function ($item) {
            return is_array($item) && !empty($item['id']);
        }));
        return self::$cached_items;
    }

    public static function persist($items) {
        $items = array_values(array_filter($items, function ($item) {
            return is_array($item) && !empty($item['id']);
        }));
        $payload = wp_json_encode($items);
        setcookie(self::key(), $payload, time() + WEEK_IN_SECONDS, COOKIEPATH ?: '/', '', is_ssl(), false);
        $_COOKIE[self::key()] = $payload;
        self::$cached_items = $items;
        return $items;
    }

    public static function count() {
        $total = 0;
        foreach (self::items() as $item) {
            $total += max(1, (int) ($item['qty'] ?? 1));
        }
        return $total;
    }

    /**
     * Simple products arrive as 0 / "0". The list stores "".
     */
    public static function variation_key($value) {
        $number = (int) $value;
        return $number > 0 ? (string) $number : '';
    }

    public static function has_item($product_id, $variation_id = 0) {
        $wanted = self::variation_key($variation_id);
        foreach (self::items() as $item) {
            if ((string) ($item['id'] ?? '') !== (string) $product_id) {
                continue;
            }
            if (self::variation_key($item['variation_id'] ?? 0) === $wanted) {
                return true;
            }
        }
        return false;
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

    public static function flush_page_cache() {
        self::$cached_page_url = null;
    }

    public static function page_url() {
        if (self::$cached_page_url !== null) {
            return self::$cached_page_url;
        }
        $page_id = (int) get_option('quotebuilder_quote_page_id');
        $permalink = $page_id ? get_permalink($page_id) : false;
        self::$cached_page_url = $permalink ? $permalink : home_url('/demande-de-devis');
        return self::$cached_page_url;
    }

    public static function shop_url() {
        $settings = QuoteBuilder_Settings::storefront();
        if ($settings['continueShoppingUrlMode'] === 'custom' && $settings['continueShoppingCustomUrl']) {
            return $settings['continueShoppingCustomUrl'];
        }
        return function_exists('wc_get_page_permalink') ? wc_get_page_permalink('shop') : home_url('/');
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
        $price = 0;
        $tax = 0;
        if ($product && function_exists('wc_get_price_to_display')) {
            $price = (float) wc_get_price_to_display($product);
            if (function_exists('wc_get_price_including_tax') && function_exists('wc_get_price_excluding_tax')) {
                $tax = (float) wc_get_price_including_tax($product) - (float) wc_get_price_excluding_tax($product);
            }
        }
        $items = self::items();
        $found = false;
        foreach ($items as &$item) {
            if ((string) $item['id'] === (string) $product_id && self::variation_key($item['variation_id'] ?? '') === self::variation_key($variation_id)) {
                $item['qty'] = max(1, (int) $item['qty'] + $qty);
                $found = true;
                break;
            }
        }
        unset($item);
        if (!$found) {
            $items[] = [
                'id' => (string) $product_id,
                'variation_id' => self::variation_key($variation_id),
                'qty' => max(1, (int) $qty),
                'name' => $name,
                'sku' => $product ? $product->get_sku() : '',
                'variation' => $variation,
                'image' => $image,
                'price' => $price,
                'tax' => $tax,
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
                'variation_id' => (string) ($item['variation_id'] ?? ''),
                'qty' => max(1, (int) ($item['qty'] ?? 1)),
                'name' => $item['name'] ?? '',
                'sku' => $item['sku'] ?? null,
                'variation' => $item['variation'] ?? '',
                'options' => $item['options'] ?? new stdClass(),
            ];
        }
        return $lines;
    }

    public static function product_label($name) {
        $name = trim((string) $name);
        if ($name === '') {
            return '';
        }
        $letters = preg_replace('/[^\p{L}]/u', '', $name);
        if (!is_string($letters) || $letters === '') {
            return $name;
        }
        if (mb_strtoupper($letters, 'UTF-8') !== $letters || mb_strtolower($letters, 'UTF-8') === $letters) {
            return $name;
        }
        $lower = mb_strtolower($name, 'UTF-8');
        return mb_strtoupper(mb_substr($lower, 0, 1, 'UTF-8'), 'UTF-8') . mb_substr($lower, 1, null, 'UTF-8');
    }

    public static function variant_text($item) {
        $text = trim(wp_strip_all_tags((string) ($item['variation'] ?? '')));
        if ($text !== '') {
            return str_replace(', ', ' · ', $text);
        }
        $options = $item['options'] ?? [];
        if (!is_array($options)) {
            return '';
        }
        $parts = [];
        foreach ($options as $key => $value) {
            if (!is_scalar($value) || (string) $value === '') {
                continue;
            }
            $label = is_string($key)
                ? trim(str_replace(['attribute_pa_', 'attribute_', '_', '-'], ['', '', ' ', ' '], $key))
                : '';
            $parts[] = $label !== '' ? ucfirst($label) . ' : ' . $value : (string) $value;
        }
        return implode(' · ', $parts);
    }

    public static function line_note($item) {
        $note = trim((string) ($item['note'] ?? ''));
        return $note;
    }

    public static function tally_label($unique, $qty) {
        $products = sprintf(_n('%s produit', '%s produits', $unique, 'quotebuilder'), number_format_i18n($unique));
        $articles = sprintf(_n('%s article', '%s articles', $qty, 'quotebuilder'), number_format_i18n($qty));
        return $products . ' · ' . $articles;
    }

    public static function money($amount) {
        if (function_exists('wc_price')) {
            return wc_price((float) $amount);
        }
        return number_format_i18n((float) $amount, 2);
    }

    public static function response_when() {
        $settings = QuoteBuilder_Settings::storefront();
        $now = current_time('timestamp');
        $day = (int) wp_date('N', $now);
        $minutes = ((int) wp_date('G', $now)) * 60 + (int) wp_date('i', $now);
        $open = self::clock_minutes($settings['opensAt'] ?? '08:00');
        $close = self::clock_minutes($day === 5 ? ($settings['fridayClose'] ?? '13:00') : ($settings['weekdayClose'] ?? '16:45'));
        $open_label = self::clock_label($settings['opensAt'] ?? '08:00');
        if ($day <= 5 && $minutes >= $open && $minutes < $close) {
            return $settings['responseOpen'] ?: "dans l'heure";
        }
        if ($day <= 5 && $minutes < $open) {
            return 'aujourd’hui dès ' . $open_label;
        }
        if ($day === 5 || $day >= 6) {
            return 'lundi dès ' . $open_label;
        }
        return 'demain dès ' . $open_label;
    }

    private static function clock_minutes($value) {
        $parts = explode(':', (string) $value);
        return ((int) ($parts[0] ?? 0)) * 60 + (int) ($parts[1] ?? 0);
    }

    private static function clock_label($value) {
        $parts = explode(':', (string) $value);
        $hour = (int) ($parts[0] ?? 0);
        $minute = (int) ($parts[1] ?? 0);
        return $minute > 0 ? $hour . 'h' . str_pad((string) $minute, 2, '0', STR_PAD_LEFT) : $hour . 'h';
    }

    public static function render_native($settings) {
        $items = self::items();
        $needs = $settings['quoteNeeds'];
        $external = 'wp-' . wp_generate_password(12, false, false);
        ob_start();
        ?>
        <div class="qb-request">
            <form class="qb-request-form" data-qb-request data-start="0">
                <input type="hidden" name="external_id" value="<?php echo esc_attr($external); ?>">
                <p class="qb-hp" aria-hidden="true"><label>Site web<input type="text" name="qb_website" tabindex="-1" autocomplete="off"></label></p>
                <p class="qb-request-progress"><span data-step-num>1</span> sur 3 · <span data-step-name>Votre projet</span></p>
                <div class="qb-request-bar" aria-hidden="true"><span data-step-bar></span></div>
                <fieldset class="qb-request-step" data-name="Votre projet">
                    <legend>Que voulez-vous équiper ?</legend>
                    <p class="qb-request-hint">Plusieurs choix possibles.</p>
                    <div class="qb-tiles">
                        <?php foreach ($needs as $need) : ?>
                            <label class="qb-tile">
                                <input type="checkbox" name="need[]" value="<?php echo esc_attr($need['value']); ?>" data-custom="<?php echo !empty($need['custom']) ? '1' : '0'; ?>" data-example="<?php echo esc_attr($need['example']); ?>">
                                <span><?php echo self::need_icon($need['icon']); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></span>
                                <strong><?php echo esc_html($need['label']); ?></strong>
                                <?php if ($need['hint'] !== '') : ?><em><?php echo esc_html($need['hint']); ?></em><?php endif; ?>
                            </label>
                        <?php endforeach; ?>
                    </div>
                    <button type="button" class="qb-atq" data-next>Continuer</button>
                </fieldset>
                <fieldset class="qb-request-step" data-name="Votre projet" hidden>
                    <legend>Parlez-nous de votre projet</legend>
                    <label class="qb-field">Le projet
                        <textarea name="description" id="qb-request-text" required rows="5" data-default-placeholder="Dimensions, poids, nombre d’exemplaires." placeholder="Dimensions, poids, nombre d’exemplaires."></textarea>
                    </label>
                    <div data-space>
                        <p class="qb-request-hint">Votre espace (une estimation suffit, on mesure lors de la visite)</p>
                        <div class="qb-space">
                            <label>Longueur <input name="length" inputmode="decimal"></label>
                            <label>Largeur <input name="width" inputmode="decimal"></label>
                            <label>Hauteur <input name="height" inputmode="decimal"></label>
                        </div>
                    </div>
                    <div class="qb-request-nav">
                        <button type="button" class="qb-ghost" data-prev>Retour</button>
                        <button type="button" class="qb-atq" data-next>Continuer</button>
                    </div>
                </fieldset>
                <fieldset class="qb-request-step" data-name="Vos coordonnées" hidden>
                    <legend>Où vous envoyer le devis ?</legend>
                    <p class="qb-request-hint">Pas de compte à créer.</p>
                    <div class="qb-space">
                        <label>Nom <input name="name" required autocomplete="name"></label>
                        <label>Téléphone <input name="phone" required autocomplete="tel"></label>
                        <label>E-mail
                            <input name="email" type="email" required autocomplete="email">
                            <small class="qb-email-note"><?php echo esc_html($settings['emailNotice']); ?></small>
                        </label>
                        <label>Entreprise <input name="company" autocomplete="organization"></label>
                        <label>Ville <input name="city" autocomplete="address-level2"></label>
                    </div>
                    <p class="qb-request-error" data-error hidden></p>
                    <div class="qb-request-nav">
                        <button type="button" class="qb-ghost" data-prev>Retour</button>
                        <button type="submit" class="qb-atq" data-submit>Recevoir mon devis</button>
                    </div>
                    <ul class="qb-guarantees">
                        <li><?php echo esc_html($settings['guarantee1']); ?></li>
                        <li><?php echo esc_html($settings['guarantee2']); ?></li>
                        <li><?php echo esc_html($settings['guarantee3']); ?></li>
                    </ul>
                </fieldset>
            </form>
            <aside class="qb-request-side">
                <h2>Votre sélection</h2>
                <?php if (!$items) : ?>
                    <p class="qb-empty">Ajoutez-les depuis le catalogue avec « Ajouter au devis ». Sinon, décrivez simplement votre besoin.</p>
                <?php else : ?>
                    <ul class="qb-request-lines">
                        <?php foreach ($items as $item) : ?>
                            <li><?php echo esc_html(self::product_label($item['name'] ?? '')); ?> · ×<?php echo esc_html((int) ($item['qty'] ?? 1)); ?></li>
                        <?php endforeach; ?>
                    </ul>
                <?php endif; ?>
                <h2>Après l’envoi</h2>
                <ol class="qb-after">
                    <li><strong><?php echo esc_html($settings['after1Title']); ?></strong> <?php echo esc_html($settings['after1Text']); ?></li>
                    <li><strong><?php echo esc_html($settings['after2Title']); ?></strong> <?php echo esc_html($settings['after2Text']); ?></li>
                    <li><strong><?php echo esc_html($settings['after3Title']); ?></strong> <?php echo esc_html($settings['after3Text']); ?></li>
                </ol>
            </aside>
        </div>
        <?php
        return ob_get_clean();
    }

    private static function need_icon($name) {
        $icons = [
            'box' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 7.5 12 3l9 4.5-9 4.5L3 7.5Z"/><path d="M3 7.5V16.5L12 21l9-4.5V7.5"/><path d="M12 12v9"/></svg>',
            'rack' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 3v18M19 3v18M5 8h14M5 13h14M5 18h14"/></svg>',
            'shelf' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h16M4 12h16M4 20h16M8 4v16M16 4v16"/></svg>',
            'floor' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M3 16h18M6 16V8h12v8M9 8V5h6v3"/></svg>',
            'length' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 12h16M7 9l-3 3 3 3M17 9l3 3-3 3"/></svg>',
            'shop' => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10h16l-1 10H5L4 10Z"/><path d="M4 10 6 4h12l2 6M9 14h6"/></svg>',
            'help' => '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="9"/><path d="M9.5 9a2.5 2.5 0 1 1 3.5 2.3c-.8.4-1 1-1 1.7V14"/><path d="M12 17h.01"/></svg>',
        ];
        $svg = $icons[$name] ?? $icons['help'];
        return '<i class="qb-ico">' . $svg . '</i>';
    }

    public static function render_page() {
        if (!QuoteBuilder_Settings::connected()) {
            return '<p class="qb-empty">Connectez QuoteBuilder dans WordPress pour collecter les demandes.</p>';
        }
        $settings = QuoteBuilder_Settings::storefront();
        $funnel = QuoteBuilder_Settings::funnel();
        if (($settings['quotePageMode'] ?? 'native') === 'native') {
            return self::render_native($settings);
        }
        $items = self::items();
        $show_prices = $settings['showPrice'] && !$settings['hidePrices'];
        $unique = count($items);
        $qty_total = self::count();
        $grand = 0;
        $tax_total = 0;
        foreach ($items as $item) {
            $qty = max(1, (int) ($item['qty'] ?? 1));
            $grand += ((float) ($item['price'] ?? 0)) * $qty;
            $tax_total += ((float) ($item['tax'] ?? 0)) * $qty;
        }
        $show_funnel = $items || $settings['showFormWhenEmpty'];
        $layout = $settings['pageLayout'] === 'stack' ? ' is-stack' : '';
        ob_start();
        ?>
        <div class="qb-quote-page<?php echo esc_attr($layout); ?>">
            <div class="qb-quote-list">
                <p class="qb-kicker">Votre liste</p>
                <h2><?php echo esc_html($settings['listTitle']); ?></h2>
                <?php if (!$items) : ?>
                    <p class="qb-empty"><?php echo esc_html($show_funnel
                        ? 'Aucun produit dans la liste. Décrivez le besoin dans le formulaire, ou ajoutez des produits depuis la boutique.'
                        : $settings['emptyMessage']); ?></p>
                    <?php if ($settings['showBackToShop']) : ?>
                        <a class="qb-atq" href="<?php echo esc_url(self::shop_url()); ?>"><?php echo esc_html($settings['continueShoppingLabel']); ?></a>
                    <?php endif; ?>
                <?php else : ?>
                    <ul class="qb-quote-items">
                        <?php foreach ($items as $item) : ?>
                            <?php
                            $qty = max(1, (int) $item['qty']);
                            $line = ((float) ($item['price'] ?? 0)) * $qty;
                            $tax = ((float) ($item['tax'] ?? 0)) * $qty;
                            ?>
                            <li data-id="<?php echo esc_attr($item['id']); ?>" data-variation="<?php echo esc_attr($item['variation_id'] ?? ''); ?>">
                                <?php if ($settings['showImages'] && !empty($item['image'])) : ?>
                                    <img src="<?php echo esc_url($item['image']); ?>" alt="">
                                <?php endif; ?>
                                <div>
                                    <strong><?php echo esc_html(self::product_label($item['name'])); ?></strong>
                                    <?php if (!empty($item['variation'])) : ?>
                                        <span><?php echo esc_html($item['variation']); ?></span>
                                    <?php endif; ?>
                                    <?php if ($settings['showSku'] && !empty($item['sku'])) : ?>
                                        <span><?php echo esc_html($item['sku']); ?></span>
                                    <?php endif; ?>
                                    <?php if ($show_prices) : ?>
                                        <span><?php echo wp_kses_post(self::money($item['price'] ?? 0)); ?></span>
                                    <?php endif; ?>
                                </div>
                                <?php if ($settings['showQty']) : ?>
                                    <input type="number" min="1" class="qb-qty" value="<?php echo esc_attr($qty); ?>">
                                <?php else : ?>
                                    <em>×<?php echo esc_html($qty); ?></em>
                                <?php endif; ?>
                                <?php if ($settings['showLineTotal'] && $show_prices) : ?>
                                    <span class="qb-line-total"><?php echo wp_kses_post(self::money($line)); ?></span>
                                <?php endif; ?>
                                <?php if ($settings['showTaxes'] && $show_prices) : ?>
                                    <span class="qb-line-tax"><?php echo wp_kses_post(self::money($tax)); ?></span>
                                <?php endif; ?>
                                <button type="button" class="qb-remove" aria-label="Retirer">Retirer</button>
                            </li>
                        <?php endforeach; ?>
                    </ul>
                    <?php if ($settings['showUniqueCount'] || ($settings['showGrandTotal'] && $show_prices)) : ?>
                        <p class="qb-quote-totals">
                            <?php if ($settings['showUniqueCount']) : ?>
                                <span><?php echo esc_html(sprintf(_n('%s produit', '%s produits', $unique, 'quotebuilder'), number_format_i18n($unique))); ?> · <?php echo esc_html(sprintf(_n('%s article', '%s articles', $qty_total, 'quotebuilder'), number_format_i18n($qty_total))); ?></span>
                            <?php endif; ?>
                            <?php if ($settings['showGrandTotal'] && $show_prices) : ?>
                                <strong><?php echo wp_kses_post(self::money($grand)); ?></strong>
                            <?php endif; ?>
                            <?php if ($settings['showTaxes'] && $show_prices) : ?>
                                <span>dont taxes <?php echo wp_kses_post(self::money($tax_total)); ?></span>
                            <?php endif; ?>
                        </p>
                    <?php endif; ?>
                    <div class="qb-quote-actions">
                        <?php if ($settings['showUpdateList'] && $settings['showQty']) : ?>
                            <button type="button" class="qb-ghost qb-update-list"><?php echo esc_html($settings['updateListLabel']); ?></button>
                        <?php endif; ?>
                        <?php if ($settings['showClearList']) : ?>
                            <button type="button" class="qb-ghost qb-clear-list"><?php echo esc_html($settings['clearListLabel']); ?></button>
                        <?php endif; ?>
                        <?php if ($settings['showBackToShop']) : ?>
                            <a class="qb-ghost" href="<?php echo esc_url(self::shop_url()); ?>"><?php echo esc_html($settings['continueShoppingLabel']); ?></a>
                        <?php endif; ?>
                    </div>
                <?php endif; ?>
                <?php
                if ($items) {
                    echo QuoteBuilder_Complements::html(array_map(function ($item) {
                        return $item['id'];
                    }, $items));
                }
                ?>
            </div>
            <?php if ($show_funnel) : ?>
            <div class="qb-quote-funnel">
                <?php if ($settings['formTitle']) : ?>
                    <h3><?php echo esc_html($settings['formTitle']); ?></h3>
                <?php endif; ?>
                <?php
                echo QuoteBuilder_Storefront::render_funnel([
                    'org' => $funnel['org'],
                    'id' => $funnel['id'],
                    'height' => '820px',
                    'cart' => $items ? wp_json_encode(self::cart_payload()) : '',
                ]);
                ?>
            </div>
            <?php endif; ?>
        </div>
        <?php
        return ob_get_clean();
    }

    private static function request_payload($consent_ads) {
        $needs = [];
        foreach ((array) ($_POST['need'] ?? []) as $need) {
            $text = sanitize_text_field(wp_unslash($need));
            if ($text !== '') {
                $needs[] = $text;
            }
        }
        $products = [];
        foreach (self::items() as $item) {
            $products[] = [
                'id' => (string) ($item['id'] ?? ''),
                'name' => (string) ($item['name'] ?? ''),
                'qty' => max(1, (int) ($item['qty'] ?? 1)),
                'sku' => (string) ($item['sku'] ?? ''),
                'variation' => (string) ($item['variation'] ?? ''),
                'note' => (string) ($item['note'] ?? ''),
            ];
        }
        $payload = [
            'need' => sanitize_textarea_field(wp_unslash($_POST['description'] ?? '')),
            'name' => sanitize_text_field(wp_unslash($_POST['name'] ?? '')),
            'email' => sanitize_email(wp_unslash($_POST['email'] ?? '')),
            'phone' => sanitize_text_field(wp_unslash($_POST['phone'] ?? '')),
            'company' => sanitize_text_field(wp_unslash($_POST['company'] ?? '')),
            'city' => sanitize_text_field(wp_unslash($_POST['city'] ?? '')),
            'externalId' => sanitize_text_field(wp_unslash($_POST['external_id'] ?? '')),
            'page' => wp_get_referer() ? wp_get_referer() : self::page_url(),
            'needs' => $needs,
            'length' => sanitize_text_field(wp_unslash($_POST['length'] ?? '')),
            'width' => sanitize_text_field(wp_unslash($_POST['width'] ?? '')),
            'height' => sanitize_text_field(wp_unslash($_POST['height'] ?? '')),
            'products' => $products,
        ];
        if ($consent_ads) {
            $payload['consentAds'] = true;
        }
        return $payload;
    }

    public static function ajax_start_lead() {
        if (trim((string) wp_unslash($_POST['qb_website'] ?? '')) !== '') {
            wp_send_json_error(['message' => 'Envoi impossible.'], 400);
        }
        $payload = self::request_payload(false);
        if (!is_email($payload['email'])) {
            wp_send_json_error(['message' => 'L\'e-mail est requis.'], 400);
        }
        $result = QuoteBuilder_Pairing::start($payload);
        if (is_wp_error($result)) {
            $message = $result->get_error_message();
            wp_send_json_error(['message' => $message !== '' ? $message : 'Enregistrement impossible.'], 400);
        }
        wp_send_json_success([
            'quoteId' => (string) ($result['quoteId'] ?? ''),
            'externalId' => (string) ($result['externalId'] ?? ''),
            'status' => (string) ($result['status'] ?? 'started'),
        ]);
    }

    public static function ajax_resume_lead() {
        $token = preg_replace('/[^a-f0-9]/', '', (string) wp_unslash($_POST['token'] ?? ''));
        $result = QuoteBuilder_Pairing::resume($token);
        if (is_wp_error($result)) {
            wp_send_json_error(['message' => $result->get_error_message()], 400);
        }
        wp_send_json_success([
            'email' => (string) ($result['email'] ?? ''),
            'name' => (string) ($result['name'] ?? ''),
            'phone' => (string) ($result['phone'] ?? ''),
            'company' => (string) ($result['company'] ?? ''),
            'city' => (string) ($result['city'] ?? ''),
            'need' => (string) ($result['need'] ?? ''),
            'needs' => is_array($result['needs'] ?? null) ? array_values($result['needs']) : [],
            'length' => (string) ($result['length'] ?? ''),
            'width' => (string) ($result['width'] ?? ''),
            'height' => (string) ($result['height'] ?? ''),
        ]);
    }

    public static function ajax_submit_lead() {
        if (trim((string) wp_unslash($_POST['qb_website'] ?? '')) !== '') {
            wp_send_json_error(['message' => 'Envoi impossible.'], 400);
        }
        $payload = self::request_payload(isset($_POST['consent_ads']) && (string) wp_unslash($_POST['consent_ads']) === '1');
        if (strlen($payload['need']) < 2 || strlen($payload['name']) < 2 || !is_email($payload['email']) || $payload['phone'] === '') {
            wp_send_json_error(['message' => 'Il manque le projet, votre nom, un e-mail valide ou votre téléphone.'], 400);
        }
        $result = QuoteBuilder_Pairing::submit($payload);
        if (is_wp_error($result)) {
            $message = $result->get_error_message();
            wp_send_json_error(['message' => $message !== '' ? $message : 'Envoi impossible.'], 400);
        }
        wp_send_json_success([
            'reference' => (string) ($result['reference'] ?? ''),
            'quoteId' => (string) ($result['quoteId'] ?? ''),
            'when' => self::response_when(),
            'phone' => $payload['phone'],
            'name' => $payload['name'],
        ]);
    }

    public static function ajax() {
        check_ajax_referer('quotebuilder_storefront', 'nonce');
        $action = sanitize_key($_POST['quote_action'] ?? '');
        if ($action === 'submit_lead') {
            self::ajax_submit_lead();
            return;
        }
        if ($action === 'start_lead') {
            self::ajax_start_lead();
            return;
        }
        if ($action === 'resume_lead') {
            self::ajax_resume_lead();
            return;
        }
        $already = false;
        if ($action === 'add') {
            $product_id = (int) ($_POST['product_id'] ?? 0);
            $variation_id = (int) ($_POST['variation_id'] ?? 0);
            $already = self::has_item($product_id, $variation_id);
            if ($already) {
                $items = self::items();
            } else {
                $items = self::add_item($product_id, (int) ($_POST['qty'] ?? 1), $variation_id);
            }
        } elseif ($action === 'update') {
            $id = sanitize_text_field(wp_unslash($_POST['product_id'] ?? ''));
            $variation = self::variation_key(sanitize_text_field(wp_unslash($_POST['variation_id'] ?? '')));
            $qty = max(1, (int) ($_POST['qty'] ?? 1));
            $items = [];
            foreach (self::items() as $item) {
                if ((string) $item['id'] === $id && self::variation_key($item['variation_id'] ?? '') === $variation) {
                    $item['qty'] = $qty;
                }
                $items[] = $item;
            }
            $items = self::persist($items);
        } elseif ($action === 'update_all') {
            $qtys = json_decode(wp_unslash($_POST['qtys'] ?? '[]'), true);
            $map = [];
            if (is_array($qtys)) {
                foreach ($qtys as $row) {
                    if (!is_array($row)) {
                        continue;
                    }
                    $key = (string) ($row['id'] ?? '') . '|' . self::variation_key($row['variation_id'] ?? '');
                    $map[$key] = max(1, (int) ($row['qty'] ?? 1));
                }
            }
            $items = [];
            foreach (self::items() as $item) {
                $key = (string) $item['id'] . '|' . self::variation_key($item['variation_id'] ?? '');
                if (isset($map[$key])) {
                    $item['qty'] = $map[$key];
                }
                $items[] = $item;
            }
            $items = self::persist($items);
        } elseif ($action === 'remove') {
            $id = sanitize_text_field(wp_unslash($_POST['product_id'] ?? ''));
            $variation = self::variation_key(sanitize_text_field(wp_unslash($_POST['variation_id'] ?? '')));
            $items = array_values(array_filter(self::items(), function ($item) use ($id, $variation) {
                return !((string) $item['id'] === $id && self::variation_key($item['variation_id'] ?? '') === $variation);
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
            'already' => $already,
            'drawer' => class_exists('QuoteBuilder_Storefront') ? QuoteBuilder_Storefront::drawer_body() : '',
        ]);
    }
}
