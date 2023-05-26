<?php namespace App\Controller;

use App\Attribute\RateLimited;
use App\Service\FormatService;
use App\Repository\UserRepository;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[RateLimited('public_api')]
#[Route('/api/v1/users')]
class UsersV1Controller extends BaseController
{
    public function __construct(
        private readonly FormatService  $format,
        private readonly UserRepository $users,
    ) {}

    #[Route('/api-key-status', name: 'users_api_key_status_v1', methods: 'GET')]
    public function getApiKey(Request $request): Response
    {
        $query = $request->query;

        $this->abortUnless($query->has('api_key'), 400, 'Missing api_key');

        $api_key = $query->get('api_key');

        $user = $this->users->findOneByApiKey($api_key);

        $this->abortUnless(!!$user, 400, 'Invalid api_key');

        $regeneration_available = $user->canApiKeyBeRegenerated();
        $next_api_key_available = $user->getNextApiKeyAvailable();

        return $this->format->createFormattedResponse(compact('regeneration_available', 'next_api_key_available'));
    }

    #[Route('/regenerate-api-key', name: 'users_regenerate_api_key_v1', methods: 'POST')]
    public function regenerateApiKey(Request $request): Response
    {
        $form = $request->request;

        $this->abortUnless($form->has('api_key'), 400, 'Missing api_key');

        $api_key = $form->get('api_key');
        $user    = $this->users->findOneByApiKey($api_key);

        $this->abortUnless(!!$user, 400, 'Invalid api_key');
        $this->abortUnless($user->canApiKeyBeRegenerated(), 403, 'A new API key cannot be regenerated at this time. Please try again later.');

        $user->regenerateApiKey();
        $this->users->save($user, true);

        $api_key                = $user->getApiKey();
        $next_api_key_available = $user->getNextApiKeyAvailable();

        return $this->format->createFormattedResponse(compact('api_key', 'next_api_key_available'));
    }
}
