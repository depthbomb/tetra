<?php namespace App\Util;

class Features
{
    private static array $enabledFeatures = [
        'USER_LOGIN' => true,
        'SHORTLINK_CREATION' => true,
        'SHORTLINK_REDIRECTION' => true,
        'RENDERED_HTML_MINIFICATION' => true,
    ];

    public static function getEnabledFeatures(): array
    {
        return array_keys(array_filter(self::$enabledFeatures));
    }

    public static function isFeatureEnabled(string $feature): bool
    {
        return isset(self::$enabledFeatures[$feature]) and self::$enabledFeatures[$feature];
    }
}
