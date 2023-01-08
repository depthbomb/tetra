<?php namespace App\Http\Controllers;

use Response;
use Illuminate\Http\Request;

class HealthController extends Controller
{
    public function __invoke(): \Illuminate\Http\Response
    {
        return Response::noContent();
    }
}
