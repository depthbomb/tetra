<?php namespace App\Utils;

use Exception;
use DOMDocument;

class Assets
{
    private static mixed $manifest = null;

    /**
     * Returns the revisioned version of the asset based on the generated manifest.php file.
     *
     * @param string $path    The path to the asset as defined in the generated manifest.php file.
     * @param bool   $use_url Whether to use the fully qualified HTTP URL
     *
     * @return string|null
     */
    public static function getRevisioned(string $path, bool $use_url = false): ?string
    {
        $manifest = self::getManifest();
        $key      = self::cleanInput($path);
        if (array_key_exists($key, $manifest))
        {
            $asset_name = $manifest[$key]['file'];
            if ($use_url)
            {
                return url('/assets/'.$asset_name);
            }

            return '/assets/'.$asset_name;
        }

        return null;
    }

    /**
     * @throws \DOMException
     * @throws Exception
     */
    public static function getAssetTag(string $name): string
    {
        $name      = self::cleanInput($name);
        $split     = explode('.', basename($name));
        $ext       = $split[1];
        $dom       = new DOMDocument(encoding: 'utf-8');
        $asset     = self::getRevisioned($name);
        $hashes    = self::generateSriHashes($asset);
        $asset_url = url($asset);

        switch ($ext)
        {
            case 'js':
            case 'ts':
                $tag = $dom->createElement('script');
                $tag->setAttribute('type', 'module');
//                $tag->setAttribute('defer', '');
                $tag->setAttribute('src', $asset_url);
                break;
            case 'css':
            case 'scss':
                $tag = $dom->createElement('link');
                $tag->setAttribute('rel', 'stylesheet');
                $tag->setAttribute('href', $asset_url);
                break;
            default:
                throw new Exception("Invalid asset type $ext");
        }

        $tag->setAttribute('crossorigin', 'anonymous');
        $tag->setAttribute('integrity', "sha256-{$hashes['256']} sha384-{$hashes['384']} sha512-{$hashes['512']}");
        $dom->appendChild($tag);

        return $dom->saveHTML();
    }

    /**
     * Searches for the vendor chunk and generates the modulepreload tag
     *
     * @return string
     */
    public static function generateModulePreloadTag(): string
    {
        $manifest = self::getManifest();

        foreach ($manifest as $chunk => $chunk_info)
        {
            if (str_starts_with($chunk, '_vendor-'))
            {
                $dom = new DOMDocument(encoding: 'utf-8');
                $tag = $dom->createElement('link');
                $tag->setAttribute('rel', 'modulepreload');
                $tag->setAttribute('as', 'script');
                $tag->setAttribute('href', url("/assets/{$chunk_info['file']}"));
                $dom->appendChild($tag);

                return $dom->saveHTML();
            }
        }

        return '';
    }

    private static function generateSriHashes(string $path): array
    {
        $asset_path = public_path($path);
        return [
            '256' => base64_encode(hash_file('sha256', $asset_path, true)),
            '384' => base64_encode(hash_file('sha384', $asset_path, true)),
            '512' => base64_encode(hash_file('sha512', $asset_path, true)),
        ];
    }

    private static function getManifest()
    {
        if (!self::$manifest)
        {
            self::$manifest = json_decode(file_get_contents(public_path('assets/manifest.json')), true);
        }

        return self::$manifest;
    }

    private static function cleanInput(string $input): string
    {
        return str_replace('\'', '', $input);
    }
}
