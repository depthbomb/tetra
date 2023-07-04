<?php namespace App\Service;

use App\Entity\User;
use App\Util\Features;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\RequestStack;

class BridgeService
{
    private Request $request;

    public function __construct(
        private readonly Security     $security,
        private readonly RequestStack $requestStack,
    ) {}

    public function getRouteName(): string
    {
        return $this->getRequest()->get('_route');
    }

    public function getClientIp(): string
    {
        return $this->getRequest()->getClientIp();
    }

    public function getRequestId(): string
    {
        return $this->getRequest()->attributes->getString('_request_id');
    }

    public function getUserConfig(): string
    {
        if (!$this->security->isGranted('IS_AUTHENTICATED'))
        {
            return json_encode([]);
        }

        /** @var User $user */
        $user = $this->security->getUser();
        return json_encode([
            'username' => $user->getUsername(),
            'avatars' => [
                'x24' => $user->getAvatar(24),
                'x32' => $user->getAvatar(32),
            ],
            'roles' => $user->getRoles(),
            'apiKey' => $user->getApiKey(),
        ]);
    }

    public function getEnabledFeatures(): string
    {
        return join(',', Features::getEnabledFeatures());
    }

    private function getRequest(): Request
    {
        if (!isset($this->request))
        {
            $this->request = $this->requestStack->getMainRequest();
        }

        return $this->request;
    }
}
