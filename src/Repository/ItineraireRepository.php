<?php

namespace App\Repository;

use App\Entity\Itineraire;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;

/**
 * @extends ServiceEntityRepository<Itineraire>
 *
 * @method Itineraire|null find($id, $lockMode = null, $lockVersion = null)
 * @method Itineraire|null findOneBy(array $criteria, array $orderBy = null)
 * @method Itineraire[]    findAll()
 * @method Itineraire[]    findBy(array $criteria, array $orderBy = null, $limit = null, $offset = null)
 */
class ItineraireRepository extends ServiceEntityRepository
{
    public function __construct(ManagerRegistry $registry)
    {
        parent::__construct($registry, Itineraire::class);
    }

    public function findByDestination(string $destination)
    {
        $entityManager = $this->getEntityManager();
        $query = $entityManager->createQuery(
            'SELECT i
            FROM App\Entity\Itineraire i
            WHERE i.destination = :destination'
        );
        $query->setParameter('destination', $destination);
        return $query->getResult();
    }

    public function findByUserId(int $id)
    {
        $entityManager = $this->getEntityManager();
        $query = $entityManager->createQuery(
            'SELECT i
            FROM App\Entity\Itineraire i
            WHERE i.user = :id'
        );
        $query->setParameter('id', $id);
        return $query->getResult();
    }

    public function findByUserTitre(int $id)
    {
        $entityManager = $this->getEntityManager();
        $query = $entityManager->createQuery(
            'SELECT i
            FROM App\Entity\Itineraire i
            WHERE i.user = :id
            AND i.titre is not null'
        );
        $query->setParameter('id', $id);
        return $query->getResult();
    }

//    /**
//     * @return Itineraire[] Returns an array of Itineraire objects
//     */
//    public function findByExampleField($value): array
//    {
//        return $this->createQueryBuilder('i')
//            ->andWhere('i.exampleField = :val')
//            ->setParameter('val', $value)
//            ->orderBy('i.id', 'ASC')
//            ->setMaxResults(10)
//            ->getQuery()
//            ->getResult()
//        ;
//    }

//    public function findOneBySomeField($value): ?Itineraire
//    {
//        return $this->createQueryBuilder('i')
//            ->andWhere('i.exampleField = :val')
//            ->setParameter('val', $value)
//            ->getQuery()
//            ->getOneOrNullResult()
//        ;
//    }
}
