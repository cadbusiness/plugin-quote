<?php
/**
 * Auto-update type BeautyHub : le zip + info.json vivent dans Supabase Storage.
 * Dès qu’une nouvelle version est publiée, WordPress la propose dans Extensions.
 */

if (!defined('ABSPATH')) {
    exit;
}

/** URL publique du manifeste (bucket Supabase `wp-plugin`). */
define(
    'QUOTEBUILDER_UPDATE_INFO_URL',
    'https://spgskgtycqxjziwjpjol.supabase.co/storage/v1/object/public/wp-plugin/info.json'
);

/** Secours si le bucket n’est pas encore peuplé. */
define(
    'QUOTEBUILDER_UPDATE_INFO_FALLBACK_URL',
    'https://quotebuilder-weld.vercel.app/api/public/wp-plugin'
);

function quotebuilder_plugin_basename() {
    return plugin_basename(QUOTEBUILDER_PLUGIN_FILE);
}

/**
 * @return object|null
 */
function quotebuilder_remote_info($force = false) {
    $cache_key = 'quotebuilder_remote_info';
    if (!$force) {
        $cached = get_transient($cache_key);
        if (is_object($cached)) {
            return $cached;
        }
    }

    $urls = [QUOTEBUILDER_UPDATE_INFO_URL, QUOTEBUILDER_UPDATE_INFO_FALLBACK_URL];
    $info = null;

    foreach ($urls as $url) {
        $response = wp_remote_get($url, [
            'timeout' => 12,
            'headers' => ['Accept' => 'application/json'],
        ]);
        if (is_wp_error($response)) {
            continue;
        }
        $code = wp_remote_retrieve_response_code($response);
        if ($code < 200 || $code >= 300) {
            continue;
        }
        $body = json_decode(wp_remote_retrieve_body($response));
        if (is_object($body) && !empty($body->version) && !empty($body->download_url)) {
            $info = $body;
            break;
        }
    }

    if ($info) {
        set_transient($cache_key, $info, 6 * HOUR_IN_SECONDS);
        return $info;
    }

    return null;
}

function quotebuilder_check_update($transient) {
    if (empty($transient) || !is_object($transient)) {
        return $transient;
    }

    $info = quotebuilder_remote_info();
    if (!$info) {
        return $transient;
    }

    $plugin = quotebuilder_plugin_basename();
    if (version_compare(QUOTEBUILDER_VERSION, $info->version, '>=')) {
        return $transient;
    }

    $transient->response[$plugin] = (object) [
        'slug' => 'quotebuilder-wp',
        'plugin' => $plugin,
        'new_version' => $info->version,
        'url' => isset($info->homepage) ? $info->homepage : 'https://quotebuilder-weld.vercel.app',
        'package' => $info->download_url,
        'tested' => isset($info->tested) ? $info->tested : '',
        'requires' => isset($info->requires) ? $info->requires : '',
        'requires_php' => isset($info->requires_php) ? $info->requires_php : '',
    ];

    return $transient;
}
add_filter('pre_set_site_transient_update_plugins', 'quotebuilder_check_update');

function quotebuilder_plugins_api($result, $action, $args) {
    if ($action !== 'plugin_information' || empty($args->slug) || $args->slug !== 'quotebuilder-wp') {
        return $result;
    }

    $info = quotebuilder_remote_info();
    if (!$info) {
        return $result;
    }

    return (object) [
        'name' => isset($info->name) ? $info->name : 'QuoteBuilder',
        'slug' => 'quotebuilder-wp',
        'version' => $info->version,
        'author' => '<a href="https://quotebuilder-weld.vercel.app">Vinci Liberta LTD</a>',
        'homepage' => isset($info->homepage) ? $info->homepage : 'https://quotebuilder-weld.vercel.app',
        'requires' => isset($info->requires) ? $info->requires : '6.0',
        'tested' => isset($info->tested) ? $info->tested : '6.7',
        'requires_php' => isset($info->requires_php) ? $info->requires_php : '8.0',
        'download_link' => $info->download_url,
        'sections' => [
            'description' => isset($info->sections->description)
                ? $info->sections->description
                : 'Embed QuoteBuilder et sync catalogue WooCommerce.',
            'changelog' => isset($info->sections->changelog)
                ? $info->sections->changelog
                : '',
        ],
        'banners' => isset($info->banners) ? (array) $info->banners : [],
    ];
}
add_filter('plugins_api', 'quotebuilder_plugins_api', 10, 3);

function quotebuilder_purge_update_cache($upgrader, $options) {
    if (($options['type'] ?? '') === 'plugin') {
        delete_transient('quotebuilder_remote_info');
    }
}
add_action('upgrader_process_complete', 'quotebuilder_purge_update_cache', 10, 2);
