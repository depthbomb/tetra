<?php namespace App\Util;

class CspNonce
{
    private static ?string $nonce = null;

    public static function getNonce(): string
    {
        if (is_null(self::$nonce))
        {
            self::$nonce = base64_encode(random_bytes(24));
        }

        return self::$nonce;
    }
}
