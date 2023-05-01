<?php namespace App\Repository;

use App\Utils;
use DateTimeImmutable;
use App\Entity\Shortlink;
use Symfony\Component\Lock\LockFactory;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;

/**
 * @extends ServiceEntityRepository<Shortlink>
 *
 * @method Shortlink|null find($id, $lockMode = null, $lockVersion = null)
 * @method Shortlink|null findOneBy(array $criteria, array $orderBy = null)
 * @method Shortlink[]    findAll()
 * @method Shortlink[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ShortlinkRepository extends ServiceEntityRepository
{
    public function __construct(
        private readonly LockFactory $lockFactory,
        ManagerRegistry $registry,
    )
    {
        parent::__construct($registry, Shortlink::class);
    }

    public function save(Shortlink $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush)
        {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Shortlink $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush)
        {
            $this->getEntityManager()->flush();
        }
    }

    public function findOneByShortcode(string $shortcode): ?Shortlink
    {
        return $this->createQueryBuilder('s')
            ->where('s.shortcode = :shortcode')
            ->setParameter('shortcode', $shortcode)
            ->getQuery()
            ->getOneOrNullResult();
    }

    /**
     * @return Shortlink[]
     */
    public function findByCreatorId(string $id): array
    {
        return $this->createQueryBuilder('s')
            ->leftJoin('s.creator', 'c')
            ->where('c.id = :id')
            ->setParameter('id', $id)
            ->getQuery()
            ->getArrayResult();
    }

    public function findByCreatorIp(string $ip): array
    {
        return $this->createQueryBuilder('s')
            ->where('s.creator_ip = :ip')
            ->setParameter('ip', $ip)
            ->getQuery()
            ->getArrayResult();
    }

    /**
     * Deletes a shortlink by its shortcode and secret key
     *
     * @param string $shortcode
     * @param string $secret
     *
     * @return bool Whether a record was deleted
     */
    public function delete(string $shortcode, string $secret): bool
    {
        return $this->createQueryBuilder('s')
                ->delete()
                ->where('s.shortcode = :shortcode')
                ->setParameter('shortcode', $shortcode)
                ->andWhere('s.secret = :secret')
                ->setParameter('secret', $secret)
                ->getQuery()
                ->getResult() > 0;
    }

    public function getUnusedShortcode(): string
    {
        $length = 3;
        do
        {
            $shortcode = Utils::generateRandomId($length);
            $length++;
        } while ($this->findOneByShortcode($shortcode));

        return $shortcode;
    }

    public function getTotal(): int
    {
        return $this->createQueryBuilder('s')
            ->select('count(s.id)')
            ->getQuery()
            ->getSingleScalarResult();
    }

    public function deleteExpired(): int
    {
        $delete_count = 0;
        $lock         = $this->lockFactory->createLock('mass-delete-expired');
        if ($lock->acquire())
        {
            $now = new DateTimeImmutable();
            $delete_count = $this->createQueryBuilder('s')
                ->delete()
                ->where('s.expires_at <= :now')
                ->setParameter('now', $now->format('c'))
                ->andWhere('s.expires_at IS NOT null')
                ->getQuery()
                ->getResult();

            $lock->release();
        }

        return $delete_count;
    }
}
