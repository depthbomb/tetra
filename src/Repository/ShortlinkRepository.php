<?php namespace App\Repository;

use App\Entity\Shortlink;
use App\Util\IdGenerator;
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
    public function __construct(ManagerRegistry $registry)
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
        return $this->findOneBy(['shortcode' => $shortcode]);
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
        $attempts = 0;
        $length   = 3;
        do
        {
            $shortcode = IdGenerator::generate($length);
            $found     = !!$this->findOneByShortcode($shortcode);

            if ($attempts < 5)
            {
                $attempts++;
            }
            else
            {
                $length++;
                $attempts = 0;
            }
        } while ($found);

        return $shortcode;
    }

    public function getTotal(): int
    {
        return $this->count(['disabled' => false]);
    }

    public function deleteExpired(): int
    {
        $now = date_create_immutable();
        return $this->createQueryBuilder('s')
            ->delete()
            ->where('s.expires_at <= :now')
            ->setParameter('now', $now->format('c'))
            ->andWhere('s.expires_at IS NOT null')
            ->getQuery()
            ->getResult();
    }
}
