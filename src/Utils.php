<?php namespace App;

class Utils
{
    public static function generateRandomId(int $length): string
    {
        $bytes  = random_bytes($length);
        $base64 = str_replace(['+', '/', '='], ['-', '_', ''], base64_encode($bytes));

        return substr($base64, 0, $length);
    }

    public static function createGravatar(string $email): string
    {
        $gravatar = 'https://www.gravatar.com/avatar/';
        $gravatar .= md5(strtolower(trim($email)));

        return $gravatar;
    }
}
