<?php

if (!defined('ABSPATH')) {
    exit;
}

class QuoteBuilder_Admin {
    public static function init() {
        add_action('admin_menu', [self::class, 'menu'], 9);
        add_action('admin_init', [self::class, 'activation_redirect']);
        add_action('admin_notices', [self::class, 'plugins_notice']);
        add_action('admin_bar_menu', [self::class, 'admin_bar'], 80);
        add_action('admin_enqueue_scripts', [self::class, 'assets']);
        add_action('admin_head', [self::class, 'menu_icon']);
        add_action('admin_head', [self::class, 'hide_notices']);
        add_filter('plugin_action_links_' . plugin_basename(QUOTEBUILDER_FILE), [self::class, 'action_links']);
    }

    public static function menu() {
        $cap = quotebuilder_capability();
        add_menu_page(
            'QuoteBuilder',
            'QuoteBuilder',
            $cap,
            'quotebuilder',
            [self::class, 'render'],
            QUOTEBUILDER_URL . 'assets/quotebuilder-mark.png',
            3
        );
        add_submenu_page(
            'quotebuilder',
            'QuoteBuilder',
            'Tableau de bord',
            $cap,
            'quotebuilder',
            [self::class, 'render']
        );
        add_options_page(
            'QuoteBuilder',
            'QuoteBuilder',
            $cap,
            'quotebuilder-settings',
            [self::class, 'redirect_from_settings']
        );
        if (class_exists('WooCommerce')) {
            add_submenu_page(
                'woocommerce',
                'QuoteBuilder',
                'QuoteBuilder',
                $cap,
                'quotebuilder-woo',
                [self::class, 'redirect_from_settings']
            );
        }
    }

    public static function redirect_from_settings() {
        wp_safe_redirect(admin_url('admin.php?page=quotebuilder'));
        exit;
    }

    public static function activation_redirect() {
        if (!get_transient('quotebuilder_activation_redirect')) {
            return;
        }
        delete_transient('quotebuilder_activation_redirect');
        if (isset($_GET['activate-multi']) || wp_doing_ajax() || !quotebuilder_user_can()) {
            return;
        }
        wp_safe_redirect(admin_url('admin.php?page=quotebuilder'));
        exit;
    }

    public static function action_links($links) {
        array_unshift(
            $links,
            '<a href="' . esc_url(admin_url('admin.php?page=quotebuilder')) . '"><strong>Ouvrir QuoteBuilder</strong></a>'
        );
        return $links;
    }

    public static function plugins_notice() {
        $screen = function_exists('get_current_screen') ? get_current_screen() : null;
        if (QuoteBuilder_Settings::connected() || !$screen || $screen->id !== 'plugins' || !quotebuilder_user_can()) {
            return;
        }
        echo '<div class="notice notice-info"><p><strong>QuoteBuilder</strong> v' . esc_html(QUOTEBUILDER_VERSION) . ' est actif. <a href="' . esc_url(admin_url('admin.php?page=quotebuilder')) . '">Créez un compte pour collecter les demandes</a>.</p></div>';
    }

    public static function admin_bar($bar) {
        if (!quotebuilder_user_can() || !is_admin_bar_showing()) {
            return;
        }
        $bar->add_node([
            'id' => 'quotebuilder',
            'title' => 'QuoteBuilder',
            'href' => admin_url('admin.php?page=quotebuilder'),
        ]);
    }

    public static function assets($hook) {
        if ($hook !== 'toplevel_page_quotebuilder') {
            return;
        }
        wp_enqueue_style('quotebuilder-admin', QUOTEBUILDER_URL . 'assets/admin.css', [], QUOTEBUILDER_VERSION);
        wp_enqueue_script('quotebuilder-admin', QUOTEBUILDER_URL . 'assets/admin.js', [], QUOTEBUILDER_VERSION, true);
        $settings = QuoteBuilder_Settings::storefront();
        $funnel = QuoteBuilder_Settings::funnel();
        wp_localize_script('quotebuilder-admin', 'QuoteBuilderAdmin', [
            'ajax' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('quotebuilder_admin'),
            'storefront' => $settings,
            'connected' => QuoteBuilder_Settings::connected(),
            'origin' => QuoteBuilder_Settings::origin(),
            'funnel' => $funnel,
            'quoteUrl' => QuoteBuilder_Quote::page_url(),
        ]);
    }

    public static function menu_icon() {
        echo '<style>
#adminmenu #toplevel_page_quotebuilder .wp-menu-image img{width:20px;height:20px;padding:6px 0;object-fit:contain}
#adminmenu li#toplevel_page_quotebuilder:hover,
#adminmenu li#toplevel_page_quotebuilder:hover>a.menu-top,
#adminmenu li#toplevel_page_quotebuilder.opensub>a.menu-top,
#adminmenu li#toplevel_page_quotebuilder>a.menu-top:focus,
#adminmenu li#toplevel_page_quotebuilder.current>a.menu-top,
#adminmenu li#toplevel_page_quotebuilder.current:hover>a.menu-top,
#adminmenu li#toplevel_page_quotebuilder.wp-has-current-submenu>a.wp-has-current-submenu,
#adminmenu li#toplevel_page_quotebuilder.wp-has-current-submenu>a.menu-top,
#adminmenu li#toplevel_page_quotebuilder.wp-has-current-submenu:hover>a.menu-top{
background:#c2410c!important;color:#fff!important}
#adminmenu li#toplevel_page_quotebuilder:hover .wp-menu-name,
#adminmenu li#toplevel_page_quotebuilder>a.menu-top:focus .wp-menu-name,
#adminmenu li#toplevel_page_quotebuilder.current .wp-menu-name,
#adminmenu li#toplevel_page_quotebuilder.wp-has-current-submenu .wp-menu-name{
color:#fff!important}
</style>';
    }

    public static function hide_notices() {
        $screen = get_current_screen();
        if (!$screen || $screen->id !== 'toplevel_page_quotebuilder') {
            return;
        }
        remove_all_actions('admin_notices');
        remove_all_actions('all_admin_notices');
    }

    public static function render() {
        if (!quotebuilder_user_can()) {
            wp_die('Vous n’avez pas les droits pour ouvrir QuoteBuilder.');
        }
        $legacy = [
            'accueil' => 'demandes',
            'boutique' => 'reglages',
            'bouton' => 'reglages',
            'liste' => 'reglages',
            'visibilite' => 'reglages',
        ];
        $tab = sanitize_key($_GET['tab'] ?? 'demandes');
        if (isset($legacy[$tab])) {
            $tab = $legacy[$tab];
        }
        $tabs = [
            'demandes' => 'Demandes',
            'reglages' => 'Réglages',
            'compte' => 'Compte',
        ];
        if (!isset($tabs[$tab])) {
            $tab = 'demandes';
        }
        $connected = QuoteBuilder_Settings::connected();
        $funnel = QuoteBuilder_Settings::funnel();
        $settings = QuoteBuilder_Settings::storefront();
        $quotes = ($connected && $tab === 'demandes') ? QuoteBuilder_Pairing::quotes() : [];
        $woo = QuoteBuilder_Pairing::woocommerce_ready();
        $flash = QuoteBuilder_Pairing::flash();
        $logo = QUOTEBUILDER_URL . 'assets/quotebuilder-mark.png';
        ?>
        <div class="qb-wrap<?php echo $connected ? '' : ' is-setup'; ?>">
            <header class="qb-header">
                <div class="qb-brand">
                    <img class="qb-logo" src="<?php echo esc_url($logo); ?>" alt="QuoteBuilder" width="32" height="32">
                    <strong>QuoteBuilder</strong>
                    <?php if ($connected) : ?>
                        <span class="qb-ver">v<?php echo esc_html(QUOTEBUILDER_VERSION); ?></span>
                    <?php endif; ?>
                </div>
                <?php if ($connected) : ?>
                <nav class="qb-tabs">
                    <?php foreach ($tabs as $key => $label) : ?>
                        <a class="<?php echo $tab === $key ? 'is-active' : ''; ?>" href="<?php echo esc_url(admin_url('admin.php?page=quotebuilder&tab=' . $key)); ?>">
                            <?php echo esc_html($label); ?>
                        </a>
                    <?php endforeach; ?>
                </nav>
                <?php endif; ?>
                <div class="qb-header-actions">
                    <?php if ($connected) : ?>
                        <span class="qb-pill is-on">Connecté</span>
                        <a class="qb-ghost" href="<?php echo esc_url(QuoteBuilder_Settings::origin() . '/devis'); ?>" target="_blank" rel="noopener">Ouvrir QuoteBuilder</a>
                    <?php endif; ?>
                </div>
            </header>
            <div class="qb-body">
                <?php if ($flash) : ?>
                    <p class="qb-banner"><?php echo esc_html($flash); ?></p>
                <?php endif; ?>
                <?php
                if (!$connected) {
                    self::view_setup($woo);
                } elseif ($tab === 'demandes') {
                    self::view_home($woo, $funnel, $quotes, $settings);
                } elseif ($tab === 'reglages') {
                    self::view_settings($settings);
                } else {
                    self::view_account($connected, $funnel, $woo);
                }
                ?>
            </div>
            <footer class="qb-footer">
                <img src="<?php echo esc_url($logo); ?>" alt="" width="18" height="18">
                <span>© <?php echo esc_html(gmdate('Y')); ?> QuoteBuilder. Tous droits réservés.</span>
            </footer>
        </div>
        <?php
    }

    private static function view_setup($woo) {
        ?>
        <div class="qb-setup">
            <img class="qb-setup-logo" src="<?php echo esc_url(QUOTEBUILDER_URL . 'assets/quotebuilder-mark.png'); ?>" alt="QuoteBuilder" width="72" height="72">
            <h1>Un compte QuoteBuilder est obligatoire</h1>
            <p>Sans espace connecté, WordPress ne peut pas collecter les demandes. Le plugin n’active la vitrine devis qu’après connexion : prix, liste et funnel restent dans QuoteBuilder.</p>
            <?php if (!$woo) : ?>
                <p class="qb-banner is-warn">Activez WooCommerce, puis créez votre compte.</p>
            <?php endif; ?>
            <div class="qb-setup-actions">
                <a class="qb-primary qb-primary-lg" href="<?php echo esc_url(QuoteBuilder_Pairing::start_url('signup')); ?>">Créer un compte</a>
                <a class="qb-ghost qb-primary-lg" href="<?php echo esc_url(QuoteBuilder_Pairing::start_url('connect')); ?>">J’ai déjà un compte</a>
            </div>
        </div>
        <?php
    }

    private static function view_home($woo, $funnel, $quotes, $settings) {
        $imported = (int) get_option('quotebuilder_last_imported', 0);
        $space = $funnel['orgName'] ?: $funnel['org'] ?: 'Connecté';
        ?>
        <section class="qb-kpis">
            <div>
                <span>Espace</span>
                <strong><?php echo esc_html($space); ?></strong>
            </div>
            <div>
                <span>Produits</span>
                <strong><?php echo esc_html((string) $imported); ?></strong>
            </div>
            <div>
                <span>Funnel</span>
                <strong><?php echo esc_html($funnel['name'] ?: $funnel['id'] ?: '—'); ?></strong>
            </div>
            <div>
                <span>WooCommerce</span>
                <strong><?php echo $woo ? 'Actif' : 'Absent'; ?></strong>
            </div>
        </section>
        <section class="qb-panel">
            <div class="qb-row">
                <div>
                    <p class="qb-kicker">Demandes</p>
                    <h2><?php echo $settings['hidePrices'] ? 'Prix masqués · ' : ''; ?>Dernières demandes</h2>
                </div>
                <div class="qb-row">
                    <a class="qb-ghost" href="<?php echo esc_url(admin_url('admin.php?page=quotebuilder&tab=reglages')); ?>">Réglages vitrine</a>
                    <button type="button" class="qb-ghost" id="qb-refresh">Actualiser</button>
                </div>
            </div>
            <?php if (!$quotes) : ?>
                <p class="qb-empty">Aucune demande pour l’instant.</p>
            <?php else : ?>
                <table class="qb-table">
                    <thead>
                        <tr><th>Prospect</th><th>Société</th><th>Statut</th><th>Score</th><th>Date</th></tr>
                    </thead>
                    <tbody>
                        <?php foreach ($quotes as $quote) : ?>
                            <tr>
                                <td>
                                    <strong><?php echo esc_html($quote['name']); ?></strong>
                                    <span><?php echo esc_html($quote['email']); ?></span>
                                </td>
                                <td><?php echo esc_html($quote['company'] ?: '—'); ?></td>
                                <td><span class="qb-chip qb-chip-<?php echo esc_attr($quote['status']); ?>"><?php echo esc_html($quote['status']); ?></span></td>
                                <td><?php echo esc_html($quote['score'] ?: '—'); ?></td>
                                <td><?php echo esc_html(date_i18n('d/m/Y H:i', strtotime($quote['createdAt']))); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
        </section>
        <?php
    }

    private static function view_settings($settings) {
        $product_labels = self::labels('product', $settings['productIds']);
        $category_labels = self::labels('product_cat', $settings['categoryIds']);
        $tag_labels = self::labels('product_tag', $settings['tagIds']);
        $pages = get_pages(['sort_column' => 'post_title', 'sort_order' => 'ASC']);
        $roles = function_exists('get_editable_roles') ? get_editable_roles() : [];
        $section = sanitize_key($_GET['section'] ?? 'bouton');
        if (!in_array($section, ['bouton', 'produits', 'page', 'style'], true)) {
            $section = 'bouton';
        }
        ?>
        <nav class="qb-subnav" data-qb-subnav>
            <a href="#bouton" class="<?php echo $section === 'bouton' ? 'is-active' : ''; ?>">Bouton</a>
            <a href="#produits" class="<?php echo $section === 'produits' ? 'is-active' : ''; ?>">Produits</a>
            <a href="#page" class="<?php echo $section === 'page' ? 'is-active' : ''; ?>">Page</a>
            <a href="#style" class="<?php echo $section === 'style' ? 'is-active' : ''; ?>">Style</a>
        </nav>
        <form class="qb-settings" data-qb-form>
            <section class="qb-card" id="bouton">
                <header>
                    <h2>Bouton « Ajouter au devis »</h2>
                    <p>Qui le voit, où il apparaît, ce qui se passe ensuite.</p>
                </header>
                <?php
                self::row('Visible pour', 'Tous, comptes, invités, ou rôles WordPress.', function () use ($settings) {
                    self::pills('audience', [
                        'all' => 'Tous',
                        'logged_in' => 'Connectés',
                        'guests' => 'Invités',
                        'roles' => 'Rôles',
                    ], $settings['audience']);
                });
                ?>
                <div class="qb-set-row" data-show-when="audience:roles">
                    <div class="qb-set-label"><strong>Rôles autorisés</strong><span>Le bouton n’apparaît que pour ces rôles.</span></div>
                    <div class="qb-set-control qb-checks">
                        <?php foreach ($roles as $key => $role) : ?>
                            <label>
                                <input type="checkbox" name="roles[]" value="<?php echo esc_attr($key); ?>" <?php checked(in_array($key, $settings['roles'], true)); ?>>
                                <?php echo esc_html(translate_user_role($role['name'])); ?>
                            </label>
                        <?php endforeach; ?>
                    </div>
                </div>
                <?php
                self::row('Emplacements', 'Fiche, grilles, blocs Gutenberg, panier, paiement.', function () use ($settings) {
                    echo '<div class="qb-checks">';
                    self::check('showOnProduct', 'Fiche produit', $settings['showOnProduct']);
                    self::check('showOnShop', 'Boutique / catégories', $settings['showOnShop']);
                    self::check('showOnBlocks', 'Blocs WooCommerce', $settings['showOnBlocks']);
                    self::check('showOnCart', 'Page panier', $settings['showOnCart']);
                    self::check('showOnCheckout', 'Page paiement', $settings['showOnCheckout']);
                    self::check('showFloatingButton', 'Bouton flottant', $settings['showFloatingButton']);
                    echo '</div>';
                });
                self::row('Position sur la fiche', 'À côté ou sous « Ajouter au panier ».', function () use ($settings) {
                    self::pills('productButtonPosition', [
                        'inline' => 'En ligne',
                        'below' => 'En dessous',
                    ], $settings['productButtonPosition']);
                });
                self::row('Rupture de stock', 'Afficher, limiter, ou masquer le bouton.', function () use ($settings) {
                    self::pills('stockMode', [
                        'all' => 'Tous les produits',
                        'oos_only' => 'Ruptures seulement',
                        'hide_oos' => 'Masquer en rupture',
                    ], $settings['stockMode']);
                });
                self::row('Après un ajout', 'Tiroir, lien vers la liste, ou redirection.', function () use ($settings) {
                    self::pills('afterAdd', [
                        'drawer' => 'Ouvrir le tiroir',
                        'notice' => 'Afficher un lien',
                        'list' => 'Aller à la liste',
                        'stay' => 'Rester sur la page',
                    ], $settings['afterAdd']);
                });
                ?>
                <div class="qb-switches">
                    <?php self::switch_row('hideAddToCart', 'Masquer « Ajouter au panier »', $settings['hideAddToCart']); ?>
                    <?php self::switch_row('hidePrices', 'Masquer les prix', $settings['hidePrices']); ?>
                    <?php self::switch_row('hideSaleFlash', 'Masquer les badges promo', $settings['hideSaleFlash']); ?>
                    <?php self::switch_row('hideCheckout', 'Masquer « Commander »', $settings['hideCheckout']); ?>
                </div>
                <?php
                self::row('Texte à la place du prix', '', function () use ($settings) {
                    self::input('priceLabel', $settings['priceLabel']);
                });
                self::row('Libellé panier / paiement', 'Bouton « Demander un devis » sur le panier Woo.', function () use ($settings) {
                    self::input('requestQuoteLabel', $settings['requestQuoteLabel']);
                });
                ?>
            </section>

            <section class="qb-card" id="produits">
                <header>
                    <h2>Produits concernés</h2>
                    <p>Tous sauf une liste, ou uniquement la liste (produits, catégories, étiquettes).</p>
                </header>
                <?php
                self::row('Périmètre', '', function () use ($settings) {
                    self::pills('scope', [
                        'all' => 'Tous les produits',
                        'exclude' => 'Tous sauf la liste',
                        'include' => 'Liste uniquement',
                    ], $settings['scope']);
                });
                ?>
                <div data-show-when="scope:include|exclude">
                    <?php self::picker('Produits', 'products', 'productIds', $product_labels, 'Rechercher un produit'); ?>
                    <?php self::picker('Catégories', 'categories', 'categoryIds', $category_labels, 'Rechercher une catégorie'); ?>
                    <?php self::picker('Étiquettes', 'tags', 'tagIds', $tag_labels, 'Rechercher une étiquette'); ?>
                </div>
            </section>

            <section class="qb-card" id="page">
                <header>
                    <h2>Page « Demander un devis »</h2>
                    <p>Liste des produits + funnel. Shortcode <code>[quotebuilder_quote]</code>.</p>
                </header>
                <div class="qb-set-row">
                    <div class="qb-set-label"><strong>Page</strong><span>Les visiteurs y voient leur liste et envoient la demande.</span></div>
                    <div class="qb-set-control qb-page-pick">
                        <select name="quotePageId">
                            <?php foreach ($pages as $page) : ?>
                                <option value="<?php echo esc_attr((string) $page->ID); ?>" <?php selected((string) $settings['quotePageId'], (string) $page->ID); ?>>
                                    <?php echo esc_html($page->post_title); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <button type="button" class="qb-ghost" id="qb-create-page">Créer une page</button>
                    </div>
                </div>
                <?php
                self::row('Mise en page', '', function () use ($settings) {
                    self::pills('pageLayout', [
                        'split' => 'Liste à gauche, formulaire à droite',
                        'stack' => 'Liste au-dessus, formulaire en dessous',
                    ], $settings['pageLayout']);
                });
                self::row('Titre de la liste', '', function () use ($settings) {
                    self::input('listTitle', $settings['listTitle']);
                });
                self::row('Message liste vide', '', function () use ($settings) {
                    self::input('emptyMessage', $settings['emptyMessage']);
                });
                self::row('Titre avant le formulaire', 'Laissé vide = pas de titre.', function () use ($settings) {
                    self::input('formTitle', $settings['formTitle']);
                });
                self::row('Bouton d’envoi', '', function () use ($settings) {
                    self::input('funnelCta', $settings['funnelCta']);
                });
                ?>
                <div class="qb-switches">
                    <?php self::switch_row('showFormWhenEmpty', 'Montrer le formulaire même si la liste est vide', $settings['showFormWhenEmpty']); ?>
                </div>
                <?php
                self::row('Colonnes du tableau', 'Le PDF se génère dans QuoteBuilder après envoi.', function () use ($settings) {
                    echo '<div class="qb-checks">';
                    self::check('showImages', 'Images', $settings['showImages']);
                    self::check('showPrice', 'Prix', $settings['showPrice']);
                    self::check('showSku', 'UGS', $settings['showSku']);
                    self::check('showQty', 'Quantité', $settings['showQty']);
                    self::check('showUniqueCount', 'Nombre de produits', $settings['showUniqueCount']);
                    self::check('showLineTotal', 'Total ligne', $settings['showLineTotal']);
                    self::check('showGrandTotal', 'Montant total', $settings['showGrandTotal']);
                    self::check('showTaxes', 'Taxes', $settings['showTaxes']);
                    echo '</div>';
                });
                ?>
                <div class="qb-switches">
                    <?php self::switch_row('showBackToShop', 'Bouton « Retour à la boutique »', $settings['showBackToShop']); ?>
                    <?php self::switch_row('showUpdateList', 'Bouton « Mettre à jour la liste »', $settings['showUpdateList']); ?>
                    <?php self::switch_row('showClearList', 'Bouton « Effacer la liste »', $settings['showClearList']); ?>
                </div>
                <?php
                self::row('Libellé retour boutique', '', function () use ($settings) {
                    self::input('continueShoppingLabel', $settings['continueShoppingLabel']);
                });
                self::row('URL retour boutique', '', function () use ($settings) {
                    self::pills('continueShoppingUrlMode', [
                        'shop' => 'Page boutique Woo',
                        'custom' => 'URL personnalisée',
                    ], $settings['continueShoppingUrlMode']);
                });
                ?>
                <div class="qb-set-row" data-show-when="continueShoppingUrlMode:custom">
                    <div class="qb-set-label"><strong>URL personnalisée</strong></div>
                    <div class="qb-set-control">
                        <input name="continueShoppingCustomUrl" type="url" value="<?php echo esc_attr($settings['continueShoppingCustomUrl']); ?>" placeholder="https://">
                    </div>
                </div>
                <?php
                self::row('Libellé mise à jour', '', function () use ($settings) {
                    self::input('updateListLabel', $settings['updateListLabel']);
                });
                self::row('Libellé effacer', '', function () use ($settings) {
                    self::input('clearListLabel', $settings['clearListLabel']);
                });
                ?>
            </section>

            <section class="qb-card" id="style">
                <header>
                    <h2>Style et libellés</h2>
                    <p>Bouton ou lien, couleurs, textes affichés au visiteur.</p>
                </header>
                <div class="qb-style-grid">
                    <div>
                        <?php
                        self::row('Style « Ajouter au devis »', '', function () use ($settings) {
                            self::pills('buttonStyle', ['button' => 'Bouton', 'link' => 'Lien texte'], $settings['buttonStyle']);
                        });
                        ?>
                        <div class="qb-colors">
                            <?php self::color('buttonBg', 'Fond', $settings['buttonBg']); ?>
                            <?php self::color('buttonBgHover', 'Fond survol', $settings['buttonBgHover']); ?>
                            <?php self::color('buttonBorder', 'Bordure', $settings['buttonBorder']); ?>
                            <?php self::color('buttonBorderHover', 'Bordure survol', $settings['buttonBorderHover']); ?>
                            <?php self::color('buttonColor', 'Texte', $settings['buttonColor']); ?>
                            <?php self::color('buttonColorHover', 'Texte survol', $settings['buttonColorHover']); ?>
                        </div>
                    </div>
                    <div>
                        <?php
                        self::row('Style « Demander un devis »', 'Panier et paiement.', function () use ($settings) {
                            self::pills('requestButtonStyle', ['button' => 'Bouton', 'link' => 'Lien texte'], $settings['requestButtonStyle']);
                        });
                        ?>
                        <div class="qb-colors">
                            <?php self::color('requestBg', 'Fond', $settings['requestBg']); ?>
                            <?php self::color('requestBgHover', 'Fond survol', $settings['requestBgHover']); ?>
                            <?php self::color('requestBorder', 'Bordure', $settings['requestBorder']); ?>
                            <?php self::color('requestBorderHover', 'Bordure survol', $settings['requestBorderHover']); ?>
                            <?php self::color('requestColor', 'Texte', $settings['requestColor']); ?>
                            <?php self::color('requestColorHover', 'Texte survol', $settings['requestColorHover']); ?>
                        </div>
                    </div>
                    <aside class="qb-preview">
                        <p class="qb-kicker">Aperçu</p>
                        <div class="qb-fake-product">
                            <div class="qb-swatch"></div>
                            <p>Étagère industrielle 3 m</p>
                            <span class="qb-price-hidden"><?php echo esc_html($settings['priceLabel']); ?></span>
                            <button type="button" id="qb-preview-btn" class="qb-atq"><?php echo esc_html($settings['buttonLabel']); ?></button>
                        </div>
                    </aside>
                </div>
                <?php
                self::row('Libellé « Ajouter au devis »', '', function () use ($settings) {
                    self::input('buttonLabel', $settings['buttonLabel']);
                });
                self::row('Produit ajouté', '', function () use ($settings) {
                    self::input('addedLabel', $settings['addedLabel']);
                });
                self::row('Déjà dans la liste', '', function () use ($settings) {
                    self::input('alreadyInListLabel', $settings['alreadyInListLabel']);
                });
                self::row('Lien vers la liste', '', function () use ($settings) {
                    self::input('browseListLabel', $settings['browseListLabel']);
                });
                ?>
            </section>
            <div class="qb-savebar">
                <button type="submit" class="qb-primary">Enregistrer</button>
            </div>
        </form>
        <?php
    }

    private static function view_account($connected, $funnel, $woo) {
        ?>
        <section class="qb-panel">
            <p class="qb-kicker">Connecté</p>
            <h2><?php echo esc_html($funnel['orgName'] ?: $funnel['org']); ?></h2>
            <p>Funnel <strong><?php echo esc_html($funnel['name'] ?: $funnel['id']); ?></strong></p>
            <p>Shortcode funnel : <code>[quotebuilder]</code> · Liste : <code>[quotebuilder_quote]</code></p>
            <div class="qb-row">
                <button type="button" class="qb-ghost" id="qb-sync">Synchroniser les produits</button>
                <button type="button" class="qb-danger" id="qb-unpair">Déconnecter</button>
            </div>
        </section>
        <details class="qb-advanced">
            <summary>Connexion avancée</summary>
            <p>Adresse de l’espace si vous n’utilisez pas l’instance par défaut, et code manuel si le clic ne peut pas s’ouvrir.</p>
            <label>Adresse QuoteBuilder
                <input id="qb-origin" type="url" value="<?php echo esc_attr(QuoteBuilder_Settings::origin()); ?>">
            </label>
            <button type="button" class="qb-ghost" id="qb-save-origin">Enregistrer l’adresse</button>
            <?php if (!$connected) : ?>
                <label>Code manuel
                    <input id="qb-code" type="text" placeholder="XXXXXXXXXXXX" autocomplete="off">
                </label>
                <button type="button" class="qb-ghost" id="qb-pair">Connecter avec un code</button>
                <p class="qb-status" id="qb-pair-status" hidden></p>
            <?php endif; ?>
        </details>
        <?php
        unset($woo);
    }

    private static function row($label, $hint, $control) {
        echo '<div class="qb-set-row"><div class="qb-set-label"><strong>' . esc_html($label) . '</strong>';
        if ($hint) {
            echo '<span>' . esc_html($hint) . '</span>';
        }
        echo '</div><div class="qb-set-control">';
        $control();
        echo '</div></div>';
    }

    private static function pills($name, $options, $value) {
        echo '<div class="qb-choice">';
        foreach ($options as $val => $label) {
            echo '<label><input type="radio" name="' . esc_attr($name) . '" value="' . esc_attr($val) . '"' . checked($value, $val, false) . '> ' . esc_html($label) . '</label>';
        }
        echo '</div>';
    }

    private static function input($name, $value) {
        echo '<input name="' . esc_attr($name) . '" value="' . esc_attr($value) . '">';
    }

    private static function check($name, $label, $on) {
        echo '<label><input type="checkbox" name="' . esc_attr($name) . '"' . checked($on, true, false) . '> ' . esc_html($label) . '</label>';
    }

    private static function switch_row($name, $label, $on) {
        echo '<label class="qb-switch"><span>' . esc_html($label) . '</span><input type="checkbox" name="' . esc_attr($name) . '"' . checked($on, true, false) . '></label>';
    }

    private static function color($name, $label, $value) {
        echo '<label>' . esc_html($label) . '<input name="' . esc_attr($name) . '" type="color" value="' . esc_attr($value) . '"></label>';
    }

    private static function picker($title, $search, $chips, $labels, $placeholder) {
        ?>
        <div class="qb-picker qb-set-row">
            <div class="qb-set-label"><strong><?php echo esc_html($title); ?></strong></div>
            <div class="qb-set-control">
                <input type="search" data-search="<?php echo esc_attr($search); ?>" placeholder="<?php echo esc_attr($placeholder); ?>">
                <div class="qb-chips" data-chips="<?php echo esc_attr($chips); ?>">
                    <?php foreach ($labels as $id => $name) : ?>
                        <button type="button" data-id="<?php echo esc_attr($id); ?>"><?php echo esc_html($name); ?></button>
                    <?php endforeach; ?>
                </div>
            </div>
        </div>
        <?php
    }

    private static function labels($type, $ids) {
        $out = [];
        foreach ($ids as $id) {
            if ($type === 'product') {
                $title = get_the_title((int) $id);
                if ($title) {
                    $out[$id] = $title;
                }
            } else {
                $term = get_term((int) $id, $type);
                if ($term && !is_wp_error($term)) {
                    $out[$id] = $term->name;
                }
            }
        }
        return $out;
    }
}
