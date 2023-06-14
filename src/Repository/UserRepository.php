<?php namespace App\Repository;

use App\Entity\User;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;

/**
 * @extends ServiceEntityRepository<User>
 *
 * @method User|null find($id, $lockMode = null, $lockVersion = null)
 * @method User|null findOneBy(array $criteria, array $orderBy = null)
 * @method User[]    findAll()
 * @method User[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class UserRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, User::class);
    }

    public function save(User $entity, bool $flush = false): void
    {
        $this->getEntityManager()->persist($entity);

        if ($flush)
        {
            $this->getEntityManager()->flush();
        }
    }

    public function remove(User $entity, bool $flush = false): void
    {
        $this->getEntityManager()->remove($entity);

        if ($flush)
        {
            $this->getEntityManager()->flush();
        }
    }

    public function findOneByApiKey(string $api_key): ?User
    {
        return $this->findOneBy(['api_key' => $api_key]);
    }

    /**
     * Gets an existing user or creates them if they do not exist.
     *
     * @param string $username
     * @param string $email
     * @param string $sub
     * @param array $roles
     *
     * @return User
     */
    public function findOneOrCreate(string $username, string $email, string $sub, array $roles = ['ROLE_USER']): User
    {
        $user = $this->findOneBy(['username' => $username]);
        if ($user)
        {
            return $user;
        }

        $user = new User;
        $user->setUsername($username);
        $user->setEmail($email);
        $user->setSub($sub);
        $user->setRoles($roles);
        $this->save($user, true);

        return $user;
    }
}
