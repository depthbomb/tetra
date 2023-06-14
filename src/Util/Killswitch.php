<?php namespace App\Util;

class Killswitch
{
    public const USER_LOGIN_ENABLED            = true;
    public const SHORTLINK_CREATION_ENABLED    = true;
    public const SHORTLINK_REDIRECTION_ENABLED = true;

    /**
     * Whether a feature is enabled
     *
     * @param bool $feature
     * @return bool
     */
    public static function isEnabled(string $feature): bool
    {
        return $feature;
    }
}
