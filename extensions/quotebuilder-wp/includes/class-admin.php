<?php

if (!defined('ABSPATH')) {
    exit;
}

class QuoteBuilder_Admin {
    public static function init() {
        add_action('admin_menu', [self::class, 'menu']);
        add_action('admin_enqueue_scripts', [self::class, 'assets']);
        add_action('admin_head', [self::class, 'hide_notices']);
    }

    public static function menu() {
        add_menu_page(
            'QuoteBuilder',
            'QuoteBuilder',
            'manage_options',
            'quotebuilder',
            [self::class, 'render'],
            'dashicons-clipboard',
            56
        );
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

    public static function hide_notices() {
        $screen = get_current_screen();
        if (!$screen || $screen->id !== 'toplevel_page_quotebuilder') {
            return;
        }
        remove_all_actions('admin_notices');
        remove_all_actions('all_admin_notices');
    }

    public static function render() {
        if (!current_user_can('manage_options')) {
            return;
        }
        $tab = sanitize_key($_GET['tab'] ?? 'accueil');
        $tabs = [
            'accueil' => 'Accueil',
            'boutique' => 'Boutique',
            'bouton' => 'Bouton',
            'visibilite' => 'Où l’afficher',
            'funnel' => 'Funnel',
        ];
        if (!isset($tabs[$tab])) {
            $tab = 'accueil';
        }
        $connected = QuoteBuilder_Settings::connected();
        $funnel = QuoteBuilder_Settings::funnel();
        $settings = QuoteBuilder_Settings::storefront();
        $quotes = $tab === 'accueil' ? QuoteBuilder_Pairing::quotes() : [];
        $woo = QuoteBuilder_Pairing::woocommerce_ready();
        ?>
        <div class="qb-shell">
            <aside class="qb-nav">
                <div class="qb-brand">
                    <span class="qb-mark"></span>
                    <div>
                        <strong>QuoteBuilder</strong>
                        <em><?php echo $connected ? 'Connecté' : 'À appairer'; ?></em>
                    </div>
                </div>
                <nav>
                    <?php foreach ($tabs as $key => $label) : ?>
                        <a class="<?php echo $tab === $key ? 'is-active' : ''; ?>" href="<?php echo esc_url(admin_url('admin.php?page=quotebuilder&tab=' . $key)); ?>">
                            <?php echo esc_html($label); ?>
                        </a>
                    <?php endforeach; ?>
                </nav>
                <a class="qb-nav-link" href="<?php echo esc_url(QuoteBuilder_Quote::page_url()); ?>" target="_blank" rel="noopener">Page devis</a>
            </aside>
            <main class="qb-main">
                <?php
                if ($tab === 'accueil') {
                    self::view_home($connected, $woo, $funnel, $quotes, $settings);
                } elseif ($tab === 'boutique') {
                    self::view_catalog($settings);
                } elseif ($tab === 'bouton') {
                    self::view_button($settings);
                } elseif ($tab === 'visibilite') {
                    self::view_visibility($settings);
                } else {
                    self::view_funnel($connected, $funnel);
                }
                ?>
            </main>
        </div>
        <?php
    }

    private static function view_home($connected, $woo, $funnel, $quotes, $settings) {
        $imported = (int) get_option('quotebuilder_last_imported', 0);
        $paired = get_option('quotebuilder_paired_at', '');
        ?>
        <header class="qb-hero">
            <p class="qb-kicker">Vitrine devis</p>
            <h1>La boutique demande un devis, QuoteBuilder le traite.</h1>
            <p>Masquez les prix, remplacez le panier, envoyez la liste dans votre funnel. Les relances, le PDF et le suivi restent dans QuoteBuilder.</p>
        </header>
        <section class="qb-kpis">
            <div>
                <span>Espace</span>
                <strong><?php echo $connected ? esc_html($funnel['name'] ?: 'Connecté') : 'Non connecté'; ?></strong>
            </div>
            <div>
                <span>Produits importés</span>
                <strong><?php echo esc_html((string) $imported); ?></strong>
            </div>
            <div>
                <span>Appairé le</span>
                <strong><?php echo $paired ? esc_html($paired) : '—'; ?></strong>
            </div>
            <div>
                <span>WooCommerce</span>
                <strong><?php echo $woo ? 'Actif' : 'Absent'; ?></strong>
            </div>
        </section>
        <?php if (!$connected) : ?>
            <section class="qb-card qb-pair-card">
                <p class="qb-kicker">Première étape</p>
                <h2>Connecter cet espace QuoteBuilder</h2>
                <p>Dans QuoteBuilder, ouvrez <strong>Boutiques</strong>, générez un code, collez-le ici. Le plugin crée la clé WooCommerce, les webhooks, et récupère le funnel.</p>
                <label>Adresse de l’espace
                    <input id="qb-origin" type="url" value="<?php echo esc_attr(QuoteBuilder_Settings::origin()); ?>" placeholder="https://app.quotebuilder.fr">
                </label>
                <label>Code d’appairage
                    <input id="qb-code" type="text" placeholder="XXXXXXXXXXXX" autocomplete="off">
                </label>
                <button type="button" class="qb-primary" id="qb-pair">Connecter le catalogue</button>
                <p class="qb-status" id="qb-pair-status" hidden></p>
            </section>
        <?php else : ?>
            <section class="qb-grid">
                <article class="qb-card">
                    <p class="qb-kicker">Vitrine</p>
                    <h2><?php echo $settings['hidePrices'] ? 'Prix masqués' : 'Prix visibles'; ?></h2>
                    <p><?php echo $settings['hideAddToCart'] ? 'Le panier est remplacé par le bouton devis.' : 'Le panier WooCommerce reste actif.'; ?></p>
                    <a href="<?php echo esc_url(admin_url('admin.php?page=quotebuilder&tab=boutique')); ?>">Régler la boutique</a>
                </article>
                <article class="qb-card">
                    <p class="qb-kicker">Funnel</p>
                    <h2><?php echo esc_html($funnel['name'] ?: $funnel['id']); ?></h2>
                    <p>Les produits de la liste arrivent déjà sélectionnés dans le configurateur.</p>
                    <a href="<?php echo esc_url(QuoteBuilder_Settings::origin() . '/devis'); ?>" target="_blank" rel="noopener">Ouvrir les demandes</a>
                </article>
            </section>
        <?php endif; ?>
        <section class="qb-card">
            <div class="qb-row">
                <div>
                    <p class="qb-kicker">Demandes</p>
                    <h2>Dernières demandes QuoteBuilder</h2>
                </div>
                <button type="button" class="qb-ghost" id="qb-refresh">Actualiser</button>
            </div>
            <?php if (!$connected) : ?>
                <p class="qb-empty">Connectez le plugin pour voir les demandes ici, sans quitter WordPress.</p>
            <?php elseif (!$quotes) : ?>
                <p class="qb-empty">Aucune demande pour l’instant. Dès qu’un prospect envoie le funnel, elle apparaît ici.</p>
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
        <header class="qb-hero">
            <p class="qb-kicker">Boutique</p>
            <h1>Transformez WooCommerce en catalogue devis.</h1>
            <p>Deux interrupteurs suffisent : plus de prix affichés, plus de bouton panier. Le prospect constitue une liste puis envoie une demande.</p>
        </header>
        <form class="qb-form" data-qb-form>
            <section class="qb-toggles">
                <?php self::toggle('hidePrices', 'Masquer les prix', 'Remplace le tarif par « Sur devis » sur toute la boutique.', $settings['hidePrices']); ?>
                <?php self::toggle('hideAddToCart', 'Masquer Ajouter au panier', 'Empêche l’achat immédiat. Le bouton devis prend la place.', $settings['hideAddToCart']); ?>
                <?php self::toggle('outOfStockOnly', 'Uniquement les ruptures', 'Le devis n’apparaît que sur les produits en rupture de stock.', $settings['outOfStockOnly']); ?>
            </section>
            <button type="submit" class="qb-primary">Enregistrer</button>
        </form>
        <?php
    }

    private static function view_button($settings) {
        ?>
        <header class="qb-hero">
            <p class="qb-kicker">Bouton</p>
            <h1>Le même orange que QuoteBuilder, ou le vôtre.</h1>
        </header>
        <form class="qb-form qb-split" data-qb-form>
            <div class="qb-fields">
                <label>Libellé
                    <input name="buttonLabel" value="<?php echo esc_attr($settings['buttonLabel']); ?>">
                </label>
                <label>Style
                    <select name="buttonStyle">
                        <option value="button" <?php selected($settings['buttonStyle'], 'button'); ?>>Bouton</option>
                        <option value="link">Lien texte</option>
                    </select>
                </label>
                <label>Couleur
                    <input name="buttonBg" type="color" value="<?php echo esc_attr($settings['buttonBg']); ?>">
                </label>
                <label>Texte
                    <input name="buttonColor" type="color" value="<?php echo esc_attr($settings['buttonColor']); ?>">
                </label>
                <button type="submit" class="qb-primary">Enregistrer</button>
            </div>
            <aside class="qb-preview">
                <p class="qb-kicker">Aperçu fiche produit</p>
                <div class="qb-fake-product">
                    <div class="qb-swatch"></div>
                    <p>Étagère industrielle 3 m</p>
                    <span class="qb-price-hidden">Sur devis</span>
                    <button type="button" id="qb-preview-btn" class="qb-atq"><?php echo esc_html($settings['buttonLabel']); ?></button>
                </div>
            </aside>
        </form>
        <?php
    }

    private static function view_visibility($settings) {
        $product_labels = self::labels('product', $settings['productIds']);
        $category_labels = self::labels('product_cat', $settings['categoryIds']);
        ?>
        <header class="qb-hero">
            <p class="qb-kicker">Visibilité</p>
            <h1>Choisissez où et pour qui le devis apparaît.</h1>
        </header>
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

    private static function view_funnel($connected, $funnel) {
        ?>
        <header class="qb-hero">
            <p class="qb-kicker">Funnel</p>
            <h1>Le plugin n’est pas un second logiciel. C’est la vitrine du vôtre.</h1>
            <p>Le shortcode, le bloc Gutenberg et la page devis chargent le même configurateur que l’URL publique.</p>
        </header>
        <section class="qb-card">
            <label>Adresse de l’espace QuoteBuilder
                <input id="qb-origin" type="url" value="<?php echo esc_attr(QuoteBuilder_Settings::origin()); ?>">
            </label>
            <button type="button" class="qb-ghost" id="qb-save-origin">Enregistrer l’adresse</button>
        </section>
        <?php if ($connected) : ?>
            <section class="qb-card">
                <p class="qb-kicker">Connecté</p>
                <h2><?php echo esc_html($funnel['name'] ?: $funnel['id']); ?></h2>
                <p>Organisation <code><?php echo esc_html($funnel['org']); ?></code> · Funnel <code><?php echo esc_html($funnel['id']); ?></code></p>
                <p>Shortcode : <code>[quotebuilder]</code> · Page liste : <code>[quotebuilder_quote]</code></p>
                <button type="button" class="qb-danger" id="qb-unpair">Déconnecter le catalogue</button>
            </section>
        <?php else : ?>
            <section class="qb-card qb-pair-card">
                <label>Code d’appairage
                    <input id="qb-code" type="text" placeholder="XXXXXXXXXXXX" autocomplete="off">
                </label>
                <button type="button" class="qb-primary" id="qb-pair">Connecter</button>
                <p class="qb-status" id="qb-pair-status" hidden></p>
            </section>
        <?php endif; ?>
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
