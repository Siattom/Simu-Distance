<?php
    
namespace App\Controller;

use App\Entity\Itineraire;
use App\Form\ItineraireType;
use App\Repository\ArticleRepository;
use App\Repository\ItineraireRepository;
use DateTimeImmutable;
use Doctrine\ORM\EntityManagerInterface;
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
    public function formForCalcul(ItineraireRepository $itineraireRepository) {
        $user = $this->getUser();

        if($user){
            $id = $user->getId();
            $itineraires = $itineraireRepository->findByUserTitre($id);
        } else {
            $itineraires = null;
        }
        
        return $this->render('pages/formulaire.html.twig', [
            'user' => $user,
            'itineraires' => $itineraires
        ]);
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

    #[Route('/new/itineraire', name:'app_new_itineraire', methods:['POST'])]
    public function newItineraire(Request $request, EntityManagerInterface $entityManager, ItineraireRepository $itineraireRepository)
    {
        $data = json_decode($request->getContent(), true);
        $destination = $data['destination'];
        
        $user = $this->getUser();
        if(!$user){
            return $this->json('Je ne suis pas connecté', Response::HTTP_OK);
        }
    
        // Utilisez la variable $destination comme nécessaire dans votre logique
        // Par exemple, vous pouvez remplacer les caractères "_" par des espaces
        $destination = str_replace('_', ' ', $destination);

        $itineraireVerif = $itineraireRepository->findByDestination($destination);
        
        if(!$itineraireVerif){
            $itineraire = new Itineraire();
            $itineraire->setCreatedAt(new DateTimeImmutable());
            $itineraire->setUser($user);
            $itineraire->setDestination($destination);

            $entityManager->persist($itineraire);
            $entityManager->flush();
            return $this->json('itineraire enregistre', Response::HTTP_OK);
        } else {
            return $this->json('itineraire deja enregistre', Response::HTTP_OK);
        }   
        return $this->json('ok-', Response::HTTP_OK);
    }

    #[Route('/itineraire/{id}/edit', name: 'app_itineraire_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, Itineraire $itineraire, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(ItineraireType::class, $itineraire);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();

            return $this->redirectToRoute('app_itineraire_index', [], Response::HTTP_SEE_OTHER);
        }

        return $this->render('itineraire/edit.html.twig', [
            'itineraire' => $itineraire,
            'form' => $form,
        ]);
    }
    
}