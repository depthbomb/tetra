<?php namespace App\Service;

use App\Entity\User;
use App\Util\Features;
use Symfony\Bundle\SecurityBundle\Security;
use Symfony\Component\HttpFoundation\RequestStack;
use Symfony\Component\Security\Csrf\CsrfTokenManagerInterface;

class BridgeService
{
    public function __construct(
        private readonly CsrfTokenManagerInterface $tokenManager,
        private readonly Security                  $security,
        private readonly RequestStack              $request,
    ) {}

    public function getConfig(): string
    {
        $request = $this->request->getCurrentRequest();
        $config  = [
            'route' => $request->get('_route'),
            'remoteIp' => $request->getClientIp(),
            'requestId' => $request->attributes->getString('_request_id'),
            'authToken' => null,
            'ajaxToken' => $this->tokenManager->getToken('ajax')->getValue(),
        ];

        if ($this->security->isGranted('IS_AUTHENTICATED'))
        {
            $config['authToken'] = $this->tokenManager->getToken('auth')->getValue();
        }

        return json_encode($config);
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
                'avatars' => [
                    'x24' => $user->getAvatar(24),
                    'x32' => $user->getAvatar(32),
                ],
                'roles' => $user->getRoles(),
                'apiKey' => $user->getApiKey(),
            ];
        }

        return json_encode($user);
    }

    public function getEnabledFeatures(): string
    {
        return join(',', Features::getEnabledFeatures());
    }
}
