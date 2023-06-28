<?php namespace App\Util;

use Exception;

class CspNonce
{
    private static ?string $nonce = null;

    /**
     * @throws Exception
     */
    public static function getNonce(): string
    {
        if (is_null(self::$nonce))
        {
            self::$nonce = base64_encode(random_bytes(24));
        }

        return self::$nonce;
    }
}
