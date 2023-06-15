<?php namespace App\Controller;

use App\Util\Killswitch;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class Controller extends AbstractController
{
    public function abort(int $code, string $message = ''): void
    {
        throw new HttpException($code, $message);
    }

    public function abortIf(bool $predicate, int $code, string $message = ''): void
    {
        if ($predicate)
        {
            $this->abort($code, $message);
        }
    }

    public function abortUnless(bool $predicate, int $code, string $message = ''): void
    {
        $this->abortIf(!$predicate, $code, $message);
    }

    public function abortIfFeatureDisabled(bool $feature, string $message = 'This feature is temporarily disabled. Please try again later.'): void
    {
        $this->abortUnless(
            Killswitch::isEnabled($feature),
            Response::HTTP_BAD_GATEWAY,
            $message
        );
    }

    /**
     * A shortcut for `$this->isGranted('IS_AUTHENTICATED_REMEMBERED')`
     *
     * @return bool
     */
    public function loggedIn(): bool
    {
        return $this->isGranted('IS_AUTHENTICATED_REMEMBERED');
    }
}
