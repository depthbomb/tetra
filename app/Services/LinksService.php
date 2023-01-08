<?php namespace App\Services;


use App\Models\Link;
use Illuminate\Support\Str;

class LinksService
{
    public function generateUniqueShortcode(): string
    {
        $tries = 15;

        do
        {
            if ($tries-- === 0)
            {
                abort(500, 'Gave up trying to generate a unique shortcode.');
            }

            $shortcode = Str::random(3);

            $exists = Link::where('shortcode', $shortcode)->exists();
        } while ($exists);

        return $shortcode;
    }
}
