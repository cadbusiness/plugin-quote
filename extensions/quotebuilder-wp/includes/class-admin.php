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
        echo '<style>#adminmenu #toplevel_page_quotebuilder .wp-menu-image img{width:20px;height:20px;padding:6px 0;object-fit:contain}</style>';
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
        $tab = sanitize_key($_GET['tab'] ?? 'accueil');
        $tabs = [
            'accueil' => 'Tableau de bord',
            'boutique' => 'Boutique',
            'bouton' => 'Bouton',
            'liste' => 'Liste',
            'visibilite' => 'Visibilité',
            'compte' => 'Compte',
        ];
        if (!isset($tabs[$tab])) {
            $tab = 'accueil';
        }
        $connected = QuoteBuilder_Settings::connected();
        $funnel = QuoteBuilder_Settings::funnel();
        $settings = QuoteBuilder_Settings::storefront();
        $quotes = ($connected && $tab === 'accueil') ? QuoteBuilder_Pairing::quotes() : [];
        $woo = QuoteBuilder_Pairing::woocommerce_ready();
        $flash = QuoteBuilder_Pairing::flash();
        $logo = QUOTEBUILDER_URL . 'assets/quotebuilder-mark.png';
        ?>
        <div class="qb-wrap">
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
                    <?php else : ?>
                        <a class="qb-primary" href="<?php echo esc_url(QuoteBuilder_Pairing::start_url('signup')); ?>">Créer un compte</a>
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
                } elseif ($tab === 'accueil') {
                    self::view_home($connected, $woo, $funnel, $quotes, $settings);
                } elseif ($tab === 'boutique') {
                    self::view_catalog($settings);
                } elseif ($tab === 'bouton') {
                    self::view_button($settings);
                } elseif ($tab === 'liste') {
                    self::view_list($settings);
                } elseif ($tab === 'visibilite') {
                    self::view_visibility($settings);
                } else {
                    self::view_account($connected, $funnel, $woo);
                }
                ?>
            </div>
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

    private static function view_home($connected, $woo, $funnel, $quotes, $settings) {
        $imported = (int) get_option('quotebuilder_last_imported', 0);
        $space = $connected ? ($funnel['orgName'] ?: $funnel['org'] ?: 'Connecté') : 'Non connecté';
        ?>
        <div class="qb-title">
            <h1>Tableau de bord</h1>
            <p>WooCommerce envoie le catalogue, QuoteBuilder traite les demandes.</p>
        </div>
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
                <strong><?php echo $connected ? esc_html($funnel['name'] ?: $funnel['id'] ?: '—') : '—'; ?></strong>
            </div>
            <div>
                <span>WooCommerce</span>
                <strong><?php echo $woo ? 'Actif' : 'Absent'; ?></strong>
            </div>
        </section>
            <section class="qb-grid">
                <article>
                    <p class="qb-kicker">Vitrine</p>
                    <h2><?php echo $settings['hidePrices'] ? 'Prix masqués' : 'Prix visibles'; ?></h2>
                    <p><?php echo $settings['hideAddToCart'] ? 'Le panier est remplacé par le bouton devis.' : 'Le panier WooCommerce reste actif.'; ?></p>
                    <a href="<?php echo esc_url(admin_url('admin.php?page=quotebuilder&tab=boutique')); ?>">Régler la boutique</a>
                </article>
                <article>
                    <p class="qb-kicker">Funnel</p>
                    <h2><?php echo esc_html($funnel['name'] ?: $funnel['id']); ?></h2>
                    <p>Les produits de la liste arrivent déjà sélectionnés dans le configurateur.</p>
                    <button type="button" class="qb-ghost" id="qb-sync">Synchroniser les produits</button>
                </article>
            </section>
        <section class="qb-panel">
            <div class="qb-row">
                <div>
                    <p class="qb-kicker">Demandes</p>
                    <h2>Dernières demandes</h2>
                </div>
                <button type="button" class="qb-ghost" id="qb-refresh">Actualiser</button>
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

    private static function view_catalog($settings) {
        ?>
        <div class="qb-title">
            <h1>Boutique</h1>
            <p>Prix, panier, promo : ce que le visiteur voit avant de demander un devis.</p>
        </div>
        <form class="qb-form" data-qb-form>
            <section class="qb-toggles">
                <?php self::toggle('hidePrices', 'Masquer les prix', 'Remplace le tarif par le texte ci-dessous.', $settings['hidePrices']); ?>
                <?php self::toggle('hideAddToCart', 'Masquer Ajouter au panier', 'Empêche l’achat immédiat. Le bouton devis prend la place.', $settings['hideAddToCart']); ?>
                <?php self::toggle('hideSaleFlash', 'Masquer les badges promo', 'Cache « Promo » sur les fiches et les grilles.', $settings['hideSaleFlash']); ?>
                <?php self::toggle('hideCheckout', 'Masquer Commander', 'Retire le bouton de paiement WooCommerce.', $settings['hideCheckout']); ?>
                <?php self::toggle('outOfStockOnly', 'Uniquement les ruptures', 'Le devis n’apparaît que sur les produits en rupture de stock.', $settings['outOfStockOnly']); ?>
            </section>
            <label>Texte à la place du prix
                <input name="priceLabel" value="<?php echo esc_attr($settings['priceLabel']); ?>">
            </label>
            <button type="submit" class="qb-primary">Enregistrer</button>
        </form>
        <?php
    }

    private static function view_button($settings) {
        ?>
        <div class="qb-title">
            <h1>Bouton devis</h1>
            <p>Libellé, couleurs, et ce qui se passe après un ajout à la liste.</p>
        </div>
        <form class="qb-form qb-split" data-qb-form>
            <div class="qb-fields">
                <label>Libellé
                    <input name="buttonLabel" value="<?php echo esc_attr($settings['buttonLabel']); ?>">
                </label>
                <label>Style
                    <select name="buttonStyle">
                        <option value="button" <?php selected($settings['buttonStyle'], 'button'); ?>>Bouton</option>
                        <option value="link" <?php selected($settings['buttonStyle'], 'link'); ?>>Lien texte</option>
                    </select>
                </label>
                <label>Après l’ajout
                    <select name="afterAdd">
                        <option value="drawer" <?php selected($settings['afterAdd'], 'drawer'); ?>>Ouvrir le tiroir</option>
                        <option value="stay" <?php selected($settings['afterAdd'], 'stay'); ?>>Rester sur la page</option>
                        <option value="list" <?php selected($settings['afterAdd'], 'list'); ?>>Aller à la liste de devis</option>
                    </select>
                </label>
                <label>Couleur
                    <input name="buttonBg" type="color" value="<?php echo esc_attr($settings['buttonBg']); ?>">
                </label>
                <label>Texte
                    <input name="buttonColor" type="color" value="<?php echo esc_attr($settings['buttonColor']); ?>">
                </label>
                <?php self::toggle('showFloatingButton', 'Bouton flottant', 'Pastille en bas à droite avec le nombre de produits.', $settings['showFloatingButton']); ?>
                <button type="submit" class="qb-primary">Enregistrer</button>
            </div>
            <aside class="qb-preview">
                <p class="qb-kicker">Aperçu fiche produit</p>
                <div class="qb-fake-product">
                    <div class="qb-swatch"></div>
                    <p>Étagère industrielle 3 m</p>
                    <span class="qb-price-hidden"><?php echo esc_html($settings['priceLabel']); ?></span>
                    <button type="button" id="qb-preview-btn" class="qb-atq"><?php echo esc_html($settings['buttonLabel']); ?></button>
                </div>
            </aside>
        </form>
        <?php
    }

    private static function view_list($settings) {
        ?>
        <div class="qb-title">
            <h1>Liste de devis</h1>
            <p>Page [quotebuilder_quote] : ce que le prospect voit avant le funnel.</p>
        </div>
        <form class="qb-form" data-qb-form>
            <label>Titre
                <input name="listTitle" value="<?php echo esc_attr($settings['listTitle']); ?>">
            </label>
            <label>Liste vide
                <input name="emptyMessage" value="<?php echo esc_attr($settings['emptyMessage']); ?>">
            </label>
            <label>Bouton d’envoi
                <input name="funnelCta" value="<?php echo esc_attr($settings['funnelCta']); ?>">
            </label>
            <label>Retour boutique
                <input name="continueShoppingLabel" value="<?php echo esc_attr($settings['continueShoppingLabel']); ?>">
            </label>
            <section class="qb-toggles">
                <?php self::toggle('showImages', 'Photos produits', 'Affiche l’image dans la liste et le tiroir.', $settings['showImages']); ?>
                <?php self::toggle('showSku', 'Référence (SKU)', 'Montre le SKU WooCommerce sous le nom.', $settings['showSku']); ?>
                <?php self::toggle('showQty', 'Quantité modifiable', 'Le prospect peut changer les quantités avant d’envoyer.', $settings['showQty']); ?>
            </section>
            <button type="submit" class="qb-primary">Enregistrer</button>
        </form>
        <?php
    }

    private static function view_visibility($settings) {
        $product_labels = self::labels('product', $settings['productIds']);
        $category_labels = self::labels('product_cat', $settings['categoryIds']);
        ?>
        <div class="qb-title">
            <h1>Visibilité</h1>
            <p>Où le bouton apparaît, pour qui, et sur quels produits.</p>
        </div>
        <form class="qb-form" data-qb-form>
            <section class="qb-toggles">
                <?php self::toggle('showOnProduct', 'Fiche produit', 'Bouton sous le titre, à la place du panier.', $settings['showOnProduct']); ?>
                <?php self::toggle('showOnShop', 'Boutique et catégories', 'Bouton dans les grilles WooCommerce.', $settings['showOnShop']); ?>
                <?php self::toggle('showOnCart', 'Page panier', 'Convertit le panier en liste de devis.', $settings['showOnCart']); ?>
                <?php self::toggle('showOnCheckout', 'Page commande', 'Propose le devis avant le paiement.', $settings['showOnCheckout']); ?>
            </section>
            <label>Qui voit le bouton
                <select name="audience">
                    <option value="all" <?php selected($settings['audience'], 'all'); ?>>Tous les visiteurs</option>
                    <option value="logged_in" <?php selected($settings['audience'], 'logged_in'); ?>>Clients connectés seulement</option>
                </select>
            </label>
            <label>Périmètre produits
                <select name="scope">
                    <option value="all" <?php selected($settings['scope'], 'all'); ?>>Tous les produits</option>
                    <option value="include" <?php selected($settings['scope'], 'include'); ?>>Seulement une liste</option>
                    <option value="exclude" <?php selected($settings['scope'], 'exclude'); ?>>Tous sauf une liste</option>
                </select>
            </label>
            <div class="qb-picker">
                <p>Produits</p>
                <input type="search" data-search="products" placeholder="Rechercher un produit">
                <div class="qb-chips" data-chips="productIds">
                    <?php foreach ($product_labels as $id => $name) : ?>
                        <button type="button" data-id="<?php echo esc_attr($id); ?>"><?php echo esc_html($name); ?></button>
                    <?php endforeach; ?>
                </div>
            </div>
            <div class="qb-picker">
                <p>Catégories</p>
                <input type="search" data-search="categories" placeholder="Rechercher une catégorie">
                <div class="qb-chips" data-chips="categoryIds">
                    <?php foreach ($category_labels as $id => $name) : ?>
                        <button type="button" data-id="<?php echo esc_attr($id); ?>"><?php echo esc_html($name); ?></button>
                    <?php endforeach; ?>
                </div>
            </div>
            <button type="submit" class="qb-primary">Enregistrer</button>
        </form>
        <?php
    }

    private static function view_account($connected, $funnel, $woo) {
        ?>
        <div class="qb-title">
            <h1>Compte</h1>
            <p>Connexion QuoteBuilder, funnel et catalogue WooCommerce.</p>
        </div>
        <?php if ($connected) : ?>
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
        <?php else : ?>
            <section class="qb-connect">
                <div>
                    <h2>Connecter WooCommerce</h2>
                    <p><?php echo $woo ? 'Ouvre QuoteBuilder, choisit l’espace, importe le catalogue.' : 'WooCommerce doit être actif.'; ?></p>
                </div>
                <?php if ($woo) : ?>
                    <a class="qb-primary qb-primary-lg" href="<?php echo esc_url(QuoteBuilder_Pairing::start_url()); ?>">Connecter QuoteBuilder</a>
                <?php endif; ?>
            </section>
        <?php endif; ?>
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
    }

    private static function toggle($name, $title, $help, $on) {
        ?>
        <label class="qb-toggle">
            <input type="checkbox" name="<?php echo esc_attr($name); ?>" <?php checked($on); ?>>
            <span>
                <strong><?php echo esc_html($title); ?></strong>
                <em><?php echo esc_html($help); ?></em>
            </span>
        </label>
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
                $term = get_term((int) $id, 'product_cat');
                if ($term && !is_wp_error($term)) {
                    $out[$id] = $term->name;
                }
            }
        }
        return $out;
    }
}
