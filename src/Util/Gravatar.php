<?php namespace App\Util;

final class Gravatar
{
    private const BASE_URL = 'https://secure.gravatar.com/avatar/';

    public static function create(string $email, int $size = 80, string $default = 'identicon', string $rating = 'pg'): string
    {
        $hash     = md5(strtolower(trim($email)));
        $gravatar = self::BASE_URL.$hash;
        $options  = http_build_query([
            's' => $size,
            'd' => $default,
            'r' => $rating
        ]);

        if (!empty($options))
        {
            $gravatar .= '?'.$options;
        }

        return $gravatar;
    }
}
