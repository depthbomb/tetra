<?php namespace App\Util;

use Exception;

class IdGenerator
{
    /**
     * @throws Exception
     */
    public static function generate(int $length): string
    {
        $bytes  = random_bytes($length);
        $base64 = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($bytes));

        return substr($base64, 0, $length);
    }
}
