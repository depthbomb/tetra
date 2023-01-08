<?php namespace App\Http\Controllers;

use Illuminate\Contracts\View\View;
use Illuminate\Http\Request;

class SpaController extends Controller
{
    public function __invoke(Request $request): View
    {
        $spa_config = urlencode(json_encode([
            'csrfToken' => csrf_token(),
            'requestIp' => $request->ip(),
            'initTime' => time(),
            'initTimeFloat' => microtime(true)
        ]));

        return view('spa', compact('spa_config'));
    }
}
