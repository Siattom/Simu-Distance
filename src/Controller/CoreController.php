<?php
    
namespace App\Controller;

use App\Repository\ArticleRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Attribute\Route;


class CoreController extends AbstractController
{
    #[Route('/', name:'home', methods:['GET'])]
    public function home () {
        return $this->render('index.html.twig');
    }

    #[Route('/calc', name:'app_calc', methods:['GET'])]
    public function formForCalcul() {
        return $this->render('pages/formulaire.html.twig');
    }

    #[Route('/actualite', name:'app_actu', methods:['GET'])]
    public function showActu(ArticleRepository $articleRepository)
    {
        $user = $this->getUser();
        if(!$user){
            $user = null;
        }

        $articles = $articleRepository->findAll();

        return $this->render('pages/actualite.html.twig', [
            'user' => $user,
            'articles' => $articles
        ]);
    }
}