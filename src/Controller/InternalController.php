<?php namespace App\Controller;

use App\Attribute\CsrfProtected;
use App\Repository\ShortlinkRepository;
use Symfony\Contracts\Cache\ItemInterface;
use Symfony\Contracts\Cache\CacheInterface;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

#[Route('/api')]
#[CsrfProtected('ajax')]
class InternalController extends BaseController
{
    public function __construct(
        private readonly ShortlinkRepository $shortlinks,
        private readonly CacheInterface      $cache,
    ) {}

    #[Route('/total-shortlinks', name: 'internal_total_shortlinks', methods: ['POST'])]
    public function getTotalShortlinks(): Response
    {
        $count = $this->cache->get('total_shortlinks', function (ItemInterface $item) {
            $item->expiresAfter(10);

            return $this->shortlinks->getTotal();
        });

        return $this->json(compact('count'));
    }
}
