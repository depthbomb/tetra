<?php namespace App\Repositories;

use App\Models\Link;
use App\Enums\LinkDuration;
use Illuminate\Database\Eloquent\Collection;

interface LinksRepositoryInterface
{
    /**
     * Creates a new link record.
     *
     * @param string            $creator     The identifier of the link creator, usually their IP address
     * @param string            $destination The HTTP URL that this link redirects to
     * @param LinkDuration|null $duration    The duration before this link expires
     *
     * @return Link
     */
    public function create(string $creator, string $destination, ?LinkDuration $duration): Link;

    /**
     * Returns a link by its shortcode if it exists.
     *
     * @param string $shortcode The shortcode of the link to retrieve
     * @param array  $columns   The table columns to select
     *
     * @return Link|null
     */
    public function getLinkByShortcode(string $shortcode, array $columns = []): ?Link;

    /**
     * Returns an array of links by their creator, if they exist.
     *
     * @param string $creator The identifier of the links creator, usually their IP address
     * @param array  $columns The table columns to select
     * @param int    $limit   The maximum number of records to retrieve
     *
     * @return array|Collection
     */
    public function getLinksByCreator(string $creator, array $columns = [], int $limit = 0): array|Collection;

    /**
     * Toggles the `disabled` property value of a link record.
     *
     * @param string|Link $shortcode_or_link A resolvable string representation of the link or the link object itself.
     *                                       Examples of string representations include the shortcode or the shortlink
     *                                       URL itself.
     * @param bool        $value             The value to set the `disabled` property to
     *
     * @return bool Whether the record has been saved
     *
     * @throws \InvalidArgumentException
     */
    public function toggleDisabled(string|Link $shortcode_or_link, bool $value): bool;

    /**
     * Generates a shortcode that is guaranteed to not be taken.
     *
     * @return string
     */
    public function generateShortcode(): string;
}
