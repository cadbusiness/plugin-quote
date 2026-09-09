<?php

if (!defined('ABSPATH')) {
    exit;
}

class QuoteBuilder_Updater {
    public static function init() {
        add_filter('pre_set_site_transient_update_plugins', [self::class, 'check']);
        add_filter('site_transient_update_plugins', [self::class, 'decorate']);
        add_filter('plugins_api', [self::class, 'info'], 10, 3);
        add_action('upgrader_process_complete', [self::class, 'clear_cache'], 10, 2);
    }

    public static function plugin_file() {
        return plugin_basename(QUOTEBUILDER_FILE);
    }

    public static function endpoints() {
        $urls = [];
        $origin = QuoteBuilder_Settings::origin();
        if ($origin && strpos($origin, 'example.com') === false) {
            $urls[] = untrailingslashit($origin) . '/api/public/plugin/wordpress';
        }
        $urls[] = 'https://quotebuilder-weld.vercel.app/api/public/plugin/wordpress';
        return array_values(array_unique($urls));
    }

    public static function icon_url($remote = null) {
        $icons = is_array($remote) && isset($remote['icons']) && is_array($remote['icons']) ? $remote['icons'] : [];
        foreach (['2x', '1x', 'default', 'svg'] as $key) {
            if (!empty($icons[$key]) && is_string($icons[$key])) {
                return $icons[$key];
            }
        }
        $origin = QuoteBuilder_Settings::origin() ?: QUOTEBUILDER_DEFAULT_ORIGIN;
        return untrailingslashit($origin) . '/brand/quotebuilder-mark.png';
    }

    public static function icons($remote = null) {
        $url = self::icon_url($remote);
        $icons = [
            '1x' => $url,
            '2x' => $url,
            'default' => $url,
        ];
        if (is_array($remote) && isset($remote['icons']['svg'])) {
            $icons['svg'] = $remote['icons']['svg'];
        }
        return $icons;
    }

    public static function remote() {
        $cached = get_transient('quotebuilder_update_payload');
        if (is_array($cached) && !empty($cached['version'])) {
            return $cached;
        }
        foreach (self::endpoints() as $url) {
            $response = wp_remote_get($url, [
                'timeout' => 8,
                'headers' => ['Accept' => 'application/json'],
            ]);
            if (is_wp_error($response)) {
                continue;
            }
            if (wp_remote_retrieve_response_code($response) !== 200) {
                continue;
            }
            $body = json_decode(wp_remote_retrieve_body($response), true);
            if (!is_array($body) || empty($body['version'])) {
                continue;
            }
            set_transient('quotebuilder_update_payload', $body, HOUR_IN_SECONDS);
            return $body;
        }
        return null;
    }

    public static function package($remote) {
        $payload = [
            'slug' => 'quotebuilder-wp',
            'plugin' => self::plugin_file(),
            'id' => self::plugin_file(),
            'new_version' => $remote['version'] ?? QUOTEBUILDER_VERSION,
            'url' => $remote['homepage'] ?? QUOTEBUILDER_DEFAULT_ORIGIN,
            'package' => $remote['package'] ?? ($remote['download_url'] ?? ''),
            'requires' => $remote['requires'] ?? '6.0',
            'requires_php' => $remote['requires_php'] ?? '7.4',
            'tested' => $remote['tested'] ?? '',
            'icons' => self::icons($remote),
        ];
        return (object) $payload;
    }

    public static function check($transient) {
        if (!is_object($transient)) {
            return $transient;
        }
        $remote = self::remote();
        if (!$remote) {
            return $transient;
        }
        $file = self::plugin_file();
        $package = self::package($remote);
        if (version_compare(QUOTEBUILDER_VERSION, $remote['version'], '<')) {
            $transient->response[$file] = $package;
        } else {
            $transient->no_update[$file] = $package;
        }
        return $transient;
    }

    public static function decorate($transient) {
        if (!is_object($transient)) {
            return $transient;
        }
        $file = self::plugin_file();
        $cached = get_transient('quotebuilder_update_payload');
        $icons = self::icons(is_array($cached) ? $cached : null);
        foreach (['response', 'no_update'] as $bucket) {
            if (!empty($transient->{$bucket}[$file]) && is_object($transient->{$bucket}[$file])) {
                $transient->{$bucket}[$file]->icons = $icons;
            }
        }
        return $transient;
    }

    public static function info($result, $action, $args) {
        if ($action !== 'plugin_information' || empty($args->slug) || $args->slug !== 'quotebuilder-wp') {
            return $result;
        }
        $remote = self::remote();
        if (!$remote) {
            return $result;
        }
        $sections = isset($remote['sections']) && is_array($remote['sections']) ? $remote['sections'] : [];
        $homepage = $remote['homepage'] ?? QUOTEBUILDER_DEFAULT_ORIGIN;
        $author = $remote['author'] ?? 'QuoteBuilder';
        if ($author && strpos($author, '<a ') !== 0) {
            $author = '<a href="' . esc_url($homepage) . '">QuoteBuilder</a>';
        }
        return (object) [
            'name' => $remote['name'] ?? 'QuoteBuilder',
            'slug' => 'quotebuilder-wp',
            'version' => $remote['version'],
            'author' => $author,
            'homepage' => $homepage,
            'requires' => $remote['requires'] ?? '6.0',
            'requires_php' => $remote['requires_php'] ?? '7.4',
            'tested' => $remote['tested'] ?? '',
            'last_updated' => $remote['last_updated'] ?? '',
            'download_link' => $remote['package'] ?? ($remote['download_url'] ?? ''),
            'sections' => $sections,
            'icons' => self::icons($remote),
        ];
    }

    public static function clear_cache($upgrader, $options) {
        if (!is_array($options) || ($options['type'] ?? '') !== 'plugin') {
            return;
        }
        delete_transient('quotebuilder_update_payload');
    }
}
