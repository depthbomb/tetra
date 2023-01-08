<?php namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Illuminate\Foundation\Bus\DispatchesJobs;
use Illuminate\Routing\Controller as BaseController;
use Illuminate\Foundation\Validation\ValidatesRequests;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;

class Controller extends BaseController
{
    use AuthorizesRequests, DispatchesJobs, ValidatesRequests;

    public int $initTime;

    public function __construct()
    {
        $this->initTime = time();
    }

    public function generateApiResponse(bool $success, string $message = null, mixed $results = null): array
    {
        return [
            'success' => $success,
            'message' => $message,
            'results' => $results,
            'timings' => [
                'start' => $this->initTime,
                'completed' => time()
            ]
        ];
    }
}
