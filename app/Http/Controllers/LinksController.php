<?php namespace App\Http\Controllers;

use Exception;
use App\Models\Link;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use App\Services\LinksService;
use Illuminate\Http\RedirectResponse;

/**
 * TODO rewrite all of this and maybe split it up
 */
class LinksController extends Controller
{
    public function __construct(private LinksService $links)
    {
        parent::__construct();
    }

    public function create(Request $request): array|string
    {
        try
        {
            $destination = $request->get('destination');
            $link = $this->generateShortlink($request, $destination);

            return $this->generateApiResponse(true, results: $link->shortLink());
        }
        catch (Exception $e)
        {
            return $this->generateApiResponse(false, $e->getMessage());
        }
    }

    public function tryProcess(string $shortcode): Response|RedirectResponse
    {
        $show_info_page = str_ends_with($shortcode, '+');
        $shortcode = str_replace('+', '', $shortcode);

        /** @var Link $link */
        $link = Link::select(['id', 'shortcode', 'destination', 'disabled', 'expires_at'])
            ->where('shortcode', $shortcode)
            ->first();

        abort_if($link->disabled, 410);
        abort_if(($link === null OR $link->hasExpired()), 404);

        if ($show_info_page)
        {
            return response("The shortened URL <pre>{$link->shortLink()}</pre> goes to <pre>{$link->destination}</pre> In a future release this will be an actual page.");
        }

        return redirect()->away($link->destination, 301);
    }

    /**
     * @param Request $request
     * @param string $destination
     * @return Link
     * @throws Exception if the database record could not be saved
     */
    private function generateShortlink(Request $request, string $destination): Link
    {
        $link = new Link;
        $link->creator = $request->ip();
        $link->destination = $destination;
        $link->shortcode = $this->links->generateUniqueShortcode();
        if ($link->save())
        {
            return $link;
        }

        throw new Exception();
    }
}
