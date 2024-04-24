<?php

namespace App\Repository;

use App\Entity\Article;
use Doctrine\Bundle\DoctrineBundle\Repository\ServiceEntityRepository;
use Doctrine\Persistence\ManagerRegistry;
use Doctrine\ORM\EntityManagerInterface;

class ArticleRepository extends ServiceEntityRepository
{
    private EntityManagerInterface $entityManager;

    public function __construct(ManagerRegistry $registry, EntityManagerInterface $entityManager)
    {
        parent::__construct($registry, Article::class);
        $this->entityManager = $entityManager;
    }

    public function add(Article $article, bool $flush = false): void
    {
        $this->entityManager->persist($article);
        if ($flush) {
            $this->entityManager->flush();
        }
    }

    public function remove(Article $article, bool $flush = false): void
    {
        $this->entityManager->remove($article);
        if ($flush) {
            $this->entityManager->flush();
        }
    }
}