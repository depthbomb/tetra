<?php namespace App\Http\Controllers;

use App\Models\Link;

class StatsController extends Controller
{
    public function __invoke(): array
    {
        $links_count = Link::where('disabled', false)->count();

        return $this->generateApiResponse(true, results: $links_count);
    }
}
