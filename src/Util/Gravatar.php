<?php namespace App\Util;

final class Gravatar
{
    private const BASE_URL = 'https://secure.gravatar.com/avatar/';

    public static function create(string $email): string
    {
        $hash = md5(strtolower(trim($email)));

        return self::BASE_URL.$hash;
    }
}
