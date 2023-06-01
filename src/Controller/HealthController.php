<?php namespace App\Controller;

use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class HealthController extends BaseController
{
    #[Route('/health', name: 'health', methods: ['GET'])]
    public function health(): Response
    {
        return new Response(status: 204);
    }
}
