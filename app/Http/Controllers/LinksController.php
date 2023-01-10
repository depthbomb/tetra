<?php namespace App\Http\Controllers;

use App\Models\Link;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Illuminate\Http\RedirectResponse;
use App\Repositories\LinksRepositoryInterface;

/**
 * TODO rewrite all of this and maybe split it up
 */
class LinksController extends Controller
{
    public function __construct(private readonly LinksRepositoryInterface $links)
    {
        parent::__construct();
    }

    public function create(Request $request): array|string
    {
        try
        {
            $destination = $request->get('destination');
            $link = $this->links->create($request->ip(), $destination, null);

            return $this->generateApiResponse(true, results: $link->shortLink());
        }
        catch (\Exception $e)
        {
            return $this->generateApiResponse(false, $e->getMessage());
        }
    }

    public function tryProcess(string $shortcode): Response|RedirectResponse
    {
        $show_info_page = str_ends_with($shortcode, '+');
        $shortcode = str_replace('+', '', $shortcode);

        $link = $this->links->getLinkByShortcode($shortcode, ['id', 'shortcode', 'destination', 'disabled', 'expires_at']);;

        abort_if($link->disabled, 410);
        abort_if(($link === null OR $link->hasExpired()), 404);

        if ($show_info_page)
        {
            return response("The shortened URL <pre>{$link->shortLink()}</pre> goes to <pre>{$link->destination}</pre> In a future release this will be an actual page.");
        }

        return redirect()->away($link->destination, 301);
    }
}
