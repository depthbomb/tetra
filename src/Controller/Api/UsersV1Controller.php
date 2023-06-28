<?php namespace App\Controller\Api;

use App\Attribute\RateLimited;
use App\Service\FormatService;
use App\Repository\UserRepository;
use App\Controller\Controller;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;
use Symfony\Contracts\Translation\TranslatorInterface;

#[RateLimited('public_api')]
#[Route('/api/v1/users')]
class UsersV1Controller extends Controller
{
    public function __construct(
        private readonly TranslatorInterface $translator,
        private readonly FormatService       $format,
        private readonly UserRepository      $users,
    ) {}

    #[Route('/api-key-status', name: 'users_api_key_status_v1', methods: ['GET'])]
    public function getApiKey(Request $request): Response
    {
        $query = $request->query;

        $this->abortUnless($query->has('api_key'), Response::HTTP_BAD_GATEWAY, $this->translator->trans('error.api_key.missing'));

        $api_key = $query->getString('api_key');

        $user = $this->users->findOneByApiKey($api_key);

        $this->abortUnless(!!$user, Response::HTTP_BAD_REQUEST, $this->translator->trans('error.api_key.invalid'));

        $regeneration_available = $user->canApiKeyBeRegenerated();
        $next_api_key_available = $user->getNextApiKeyAvailable();

        return $this->format->createFormattedResponse(compact('regeneration_available', 'next_api_key_available'));
    }

    #[Route('/regenerate-api-key', name: 'users_regenerate_api_key_v1', methods: ['POST'])]
    public function regenerateApiKey(Request $request): Response
    {
        $payload = $request->getPayload();

        $this->abortUnless($payload->has('api_key'), Response::HTTP_BAD_GATEWAY, $this->translator->trans('error.api_key.missing'));

        $api_key = $payload->getString('api_key');
        $user    = $this->users->findOneByApiKey($api_key);

        $this->abortUnless(!!$user, Response::HTTP_BAD_REQUEST, $this->translator->trans('error.api_key.invalid'));
        $this->abortUnless($user->canApiKeyBeRegenerated(), Response::HTTP_FORBIDDEN, $this->translator->trans('error.api_key.on_cooldown'));

        $user->regenerateApiKey();
        $this->users->save($user, true);

        $api_key                = $user->getApiKey();
        $next_api_key_available = $user->getNextApiKeyAvailable();

        return $this->format->createFormattedResponse(compact('api_key', 'next_api_key_available'));
    }
}
