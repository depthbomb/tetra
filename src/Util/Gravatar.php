<?php namespace App\Util;

/**
 * Utility class for creating Gravatar URLs
 */
class Gravatar
{
    private const BASE_URL        = 'https:/gravatar.com/avatar/';
    private const SECURE_BASE_URL = 'https://secure.gravatar.com/avatar/';

    /**
     * Creates a Gravatar URL
     *
     * @param string $email
     * @param int    $size
     * @param string $default
     * @param string $rating
     * @param bool   $secure
     *
     * @return string
     */
    public static function create(string $email, int $size = 80, string $default = 'identicon', string $rating = 'pg', bool $secure = true): string
    {
        $email    = strtolower(trim($email));
        $hash     = md5($email);
        $gravatar = self::BASE_URL.$hash;

        if ($secure)
        {
            $hash     = hash('sha256', $email);
            $gravatar = self::SECURE_BASE_URL.$hash;
        }

        $options = http_build_query([
            's' => $size,
            'd' => $default,
            'r' => $rating,
        ]);

        if (!empty($options))
        {
            $gravatar .= '?'.$options;
        }

        return $gravatar;
    }
}
