<?php namespace App\Controller;

use Symfony\Component\HttpKernel\Exception\HttpException;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;

class BaseController extends AbstractController
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
