<?php namespace App\Repository;

use App\Entity\Hit;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;

/**
 * @extends ServiceEntityRepository<Hit>
 *
 * @method Hit|null find($id, $lockMode = null, $lockVersion = null)
 * @method Hit|null findOneBy(array $criteria, array $orderBy = null)
 * @method Hit[]    findAll()
 * @method Hit[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class HitRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Hit::class);
    }

    public function save(Hit $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush)
        {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(Hit $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush)
        {
            $this->getEntityManager()->flush();
        }
    }
}
