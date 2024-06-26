<?php

namespace App\Controller;

use App\Entity\User;
use App\Form\UserType;
use App\Repository\ItineraireRepository;
use App\Repository\UserRepository;
use App\Repository\VoitureRepository;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;

#[Route('/user')]
class UserController extends AbstractController
{
    #[Route('/', name: 'app_user_index', methods: ['GET'])]
    public function index(UserRepository $userRepository): Response
    {
        return $this->render('user/index.html.twig', [
            'users' => $userRepository->findAll(),
        ]);
    }

    #[Route('/new', name: 'app_user_new', methods: ['GET', 'POST'])]
    public function new(Request $request, UserRepository $userRepository, EntityManagerInterface $entityManager, UserPasswordHasherInterface $userPasswordHasher): Response
    {
        $user = new User();
        $form = $this->createForm(UserType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {

            $email = $form->get('email')->getData();
            $emailExist = $userRepository->findByEmail($email);
            if($emailExist){
                $this->addFlash('pbLicense', 'Un compte avec cette adresse mail existe déjà !');
                return $this->redirectToRoute('app_user_new');
            }

            $user->setPassword(
            $userPasswordHasher->hashPassword(
                    $user,
                    $form->get('password')->getData()
                )
            );
            $entityManager->persist($user);
            $entityManager->flush();

            return $this->redirectToRoute('app_login');
        }

        return $this->render('user/new.html.twig', [
            'user' => $user,
            'form' => $form,
        ]);
    }

    #[Route('/perso', name: 'app_user_show', methods: ['GET'])]
    public function show(ItineraireRepository $itineraireRepository, VoitureRepository $voitureRepository): Response
    {
        $user = $this->getUser();

        if($user){
            $id = $user->getId();
            $itineraires = $itineraireRepository->findByUserId($id);
            $voiture = $voitureRepository->findByUserId($id);
            if(!$voiture){
                $voiture = [
                    '0' => null
                ];
            }
            
            return $this->render('user/show.html.twig', [
                'user' => $user,
                'itineraires' => $itineraires,
                'voiture' =>$voiture[0]
            ]);
        }

        return $this->render('user/show.html.twig', [
            'user' => $user,
        ]);
    }

    #[Route('/{id}/edit', name: 'app_user_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, User $user, EntityManagerInterface $entityManager): Response
    {
        $form = $this->createForm(UserType::class, $user);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $entityManager->flush();

            return $this->redirectToRoute('app_user_show');
        }

        return $this->render('user/edit.html.twig', [
            'user' => $user,
            'form' => $form,
        ]);
    }

    #[Route('/{id}', name: 'app_user_delete', methods: ['POST'])]
    public function delete(Request $request, User $user, EntityManagerInterface $entityManager): Response
    {
        if ($this->isCsrfTokenValid('delete'.$user->getId(), $request->getPayload()->get('_token'))) {
            $entityManager->remove($user);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_user_index', [], Response::HTTP_SEE_OTHER);
    }

    #[Route('/friwigo', name: 'app_user_actu', methods: ['GET'])]
    public function showMenu() 
    {
        $user = $this->getUser();

        return $this->render('user/friwigo.html.twig', [
            'user' => $user
        ]);
    }

    #[Route('/remove/ve/{id}', name:'app_voiture_remove')]
    public function removeCar(int $id, VoitureRepository $voitureRepository, EntityManagerInterface $entityManager)
    {
        $user = $this->getUser();
        if(!$user){
            return $this->redirectToRoute('home');
        }

        $voiture = $voitureRepository->find($id);
        if($voiture->getUser() == $user){
            $entityManager->remove($voiture);
            $entityManager->flush();
        }

        return $this->redirectToRoute('app_user_show');
    }
}
