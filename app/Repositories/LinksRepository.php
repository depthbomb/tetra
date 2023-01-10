<?php namespace App\Repositories;

use App\Models\Link;
use App\Enums\LinkDuration;
use Illuminate\Support\Str;

class LinksRepository implements LinksRepositoryInterface
{
    /**
     * @inheritDoc
     */
    public function create(string $creator, string $destination, ?LinkDuration $duration): Link
    {
        $link = new Link;
        $link->creator = $creator;
        $link->shortcode = $this->generateShortcode();
        $link->destination = $destination;

        if ($duration !== null)
        {
            $link->expires_at = $duration->toCarbon();
        }

        $link->save();

        return $link;
    }

    /**
     * @inheritDoc
     */
    public function getLinkByShortcode(string $shortcode, array $columns = []): ?Link
    {
        $link_builder = Link::where('shortcode', $shortcode);

        if (count($columns) > 0)
        {
            $link_builder = $link_builder->select($columns);
        }

        return $link_builder->first();
    }

    /**
     * @inheritDoc
     */
    public function getLinksByCreator(string $creator, array $columns = [], int $limit = 0): array
    {
        $links_builder = Link::where(['expires_at', '!=', null]);

        if ($limit > 0)
        {
            $links_builder = $links_builder->limit($limit);
        }

        return $links_builder->get();
    }

    /**
     * @inheritDoc
     */
    public function toggleDisabled(string|Link $shortcode_or_link, bool $value): bool
    {
        $link = $this->resolve($shortcode_or_link, ['disabled']);

        // This can only happen if a link object is provided
        if (!property_exists($link, 'disabled'))
        {
            throw new \InvalidArgumentException('Link record does not have the "disabled" property');
        }

        $link->disabled = $value;

        return $link->save();
    }

    /**
     * @inheritDoc
     */
    public function generateShortcode(): string
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

    /**
     * Attempts to resolve a shortlink string representation or link object to a link object.
     *
     * @param string|Link $resolvable The value that resolves to a link object
     * @param array       $columns    The table columns to select, ignored if {@link $resolvable} is a {@link Link}
     *
     * @return Link|null
     */
    private function resolve(string|Link $resolvable, array $columns = []): ?Link
    {
        if ($resolvable instanceof Link)
        {
            return $resolvable;
        }

        $shortcode = $resolvable;
        if (filter_var($resolvable, FILTER_VALIDATE_URL))
        {
            $parsed_url = parse_url($resolvable);
            if ($parsed_url['host'] === parse_url(url(), PHP_URL_HOST))
            {
                $shortcode = str_replace(['/', '+'], '', $parsed_url['path']);
            }
        }

        $link_builder = Link::where('shortcode', $shortcode);
        if (count($columns) > 0)
        {
            $link_builder = $link_builder->select($columns);
        }

        return $link_builder->first();
    }
}
