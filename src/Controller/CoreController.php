<?php
    
namespace App\Controller;

use App\Entity\Itineraire;
use App\Entity\Voiture;
use App\Form\ItineraireType;
use App\Repository\ArticleRepository;
use App\Repository\ItineraireRepository;
use App\Repository\VoitureRepository;
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
    public function formForCalcul(ItineraireRepository $itineraireRepository, VoitureRepository $voitureRepository) {
        $user = $this->getUser();

        if($user){
            $id = $user->getId();
            $itineraires = $itineraireRepository->findByUserTitre($id);
            $voiture = $voitureRepository->findByUserId($id);
            if(!$voiture){
                $voiture = [
                    '0' => null
                ];
            }
        } else {
            $itineraires = null;
            $voiture = [
                '0' => null
            ];
        }

        return $this->render('pages/formulaire.html.twig', [
            'user' => $user,
            'itineraires' => $itineraires,
            'voiture' => $voiture[0]
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

    #[Route('/add/vehic', name:'app_vehicule_add', methods:['POST'])]
    public function addVehicule(Request $request, EntityManagerInterface $entityManager, VoitureRepository $voitureRepository)
    {
        $user = $this->getUser();
        if(!$user){
            return $this->json('Vous etes deconnecte', Response::HTTP_OK);
        }

        $data = json_decode($request->getContent(), true);

        $vehiculeVerif = $voitureRepository->findByUserId($user->getId());
        if(!$vehiculeVerif){
            $voiture = new Voiture();
            $voiture->setAcDc($data['acDc']);
            $voiture->setAutonomie($data['autonomie']);
            $voiture->setCapaciteBatterie($data['capaciteBatterie']);
            $voiture->setConsommation($data['consommation']);
            $voiture->setMarque($data['marque']);
            $voiture->setModele($data['modele']);
            $voiture->setPuissanceAc($data['puissanceAc']);
            $voiture->setPuissanceDc($data['puissanceDc']);
            $voiture->setTensionBatterie($data['tensionBatterie']);
            $voiture->setCreatedAt(new DateTimeImmutable());
            $voiture->setUser($user);

            $entityManager->persist($voiture);
            $entityManager->flush();

            return $this->json('vehicule enregistré', Response::HTTP_OK);
        };

        return $this->json('vous avez déjà un vehicule', Response::HTTP_OK);        
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