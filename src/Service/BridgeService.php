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
        $config  = [
            'route'     => $request->get('_route'),
            'ip'        => $request->getClientIp(),
            'id'        => $request->attributes->get('request_id'),
            'authToken' => $this->tokenManager->getToken('auth')->getValue(),
            'ajaxToken' => $this->tokenManager->getToken('ajax')->getValue(),
        ];

        return json_encode($config);
    }

    public function getUser(): ?string
    {
        $user = [];
        if ($this->security->isGranted('IS_AUTHENTICATED_REMEMBERED'))
        {
            /** @var User $user */
            $user = $this->security->getUser();

            $user = [
                'username' => $user->getUsername(),
                'avatar'   => $user->getGravatar(24),
                'roles'    => $user->getRoles(),
                'apiKey'   => $user->getApiKey(),
            ];
        }

        return json_encode($user);
    }
}
