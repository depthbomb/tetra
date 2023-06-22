<?php namespace App\Controller;

use Psr\Log\LoggerInterface;
use Laminas\Diagnostics\Runner\Runner;
use Laminas\Diagnostics\Check\ClassExists;
use Laminas\Diagnostics\Check\OpCacheMemory;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class HealthCheckController extends Controller
{
    #[Route('/health', name: 'health', methods: ['GET'])]
    public function health(LoggerInterface $logger): Response
    {
        $runner = new Runner;
        $runner->addCheck(new ClassExists('App\Util\Assets'));

        if (function_exists('opcache_get_status'))
        {
            $status = opcache_get_status();
            if ($status and in_array('opcache_enabled', $status) and $status['opcache_enabled'])
            {
                $runner->addCheck(new OpCacheMemory(70, 90));
            }
        }

        $results = $runner->run();
        if (!$results->getFailureCount())
        {
            if ($results->getWarningCount())
            {
                $logger->warning('Health Check concluded with warnings', compact('results'));
            }

            return new Response(status: Response::HTTP_NO_CONTENT);
        }

        $logger->emergency('Health Check concluded with errors', compact('results'));

        return new Response(status: Response::HTTP_INTERNAL_SERVER_ERROR);
    }
}
