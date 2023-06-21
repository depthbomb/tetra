<?php namespace App\Service;

use App\Entity\User;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;

readonly class BridgeService
{
    public function __construct(
        private CsrfTokenManagerInterface $tokenManager,
        private Security                  $security,
        private RequestStack              $request,
    ) {}

    public function getConfig(): string
    {
        $request = $this->request->getCurrentRequest();
        return json_encode([
            'route' => $request->get('_route'),
            'remoteIp' => $request->getClientIp(),
            'requestId' => $request->attributes->getString('_request_id'),
            'authToken' => $this->tokenManager->getToken('auth')->getValue(),
            'ajaxToken' => $this->tokenManager->getToken('ajax')->getValue(),
        ]);
    }

    public function getUserConfig(): string
    {
        $user = [];
        if ($this->security->isGranted('IS_AUTHENTICATED'))
        {
            /** @var User $user */
            $user = $this->security->getUser();
            $user = [
                'username' => $user->getUsername(),
                'avatar' => $user->getAvatar(24),
                'drawerAvatar' => $user->getAvatar(32),
                'roles' => $user->getRoles(),
                'apiKey' => $user->getApiKey(),
            ];
        }

        return json_encode($user);
    }
}
