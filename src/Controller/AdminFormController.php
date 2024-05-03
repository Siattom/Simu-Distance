<?php

namespace App\Controller;

use App\Entity\Article;
use App\Entity\User;
use App\Form\ArticleType;
use App\Repository\ArticleRepository;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\Routing\Annotation\Route;

class AdminFormController extends AbstractController
{
    #[Route('/admin/articles', name: 'admin_articles', methods: ['GET'])]
    public function list(ArticleRepository $articleRepository): Response
    {
        $user = $this->getUser();
        if(!$user){
            return $this->redirectToRoute('home');
        }
        $role = $user->getRoles();
        //dd($role);
        if ($role[0] != "ROLE_ADMIN") { 
            return $this->redirectToRoute('home');
        }

        $articles = $articleRepository->findAll();
        return $this->render('admin/articles.html.twig', [
            'articles' => $articles,
        ]);
    }

    #[Route('/admin/article/new', name: 'admin_article_new', methods: ['GET', 'POST'])]
    public function new(Request $request, ArticleRepository $articleRepository): Response
    {
        $user = $this->getUser();
        if(!$user){
            return $this->redirectToRoute('home');
        }
        $role = $user->getRoles();
        //dd($role);
        if ($role[0] != "ROLE_ADMIN") { 
            return $this->redirectToRoute('home');
        }

        $article = new Article();
        $form = $this->createForm(ArticleType::class, $article);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $article->setUser($user);

            $image = $form->get('photo')->getData();
            if($image){
                
                $allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'svg', 'HEIC'];
                $originalExtension = $image->getClientOriginalExtension();
    
                if (!in_array(strtolower($originalExtension), $allowedExtensions)) {
                    $data = ['error' => true, 'msg' => 'Seuls les fichiers .jpg, .jpeg, .svg, .heic et .png sont autorisés pour le telechargement.'];
                    return $this->json($data, Response::HTTP_BAD_REQUEST);
                }
                // on genere un nouveau nom de fichier 
                $fichierBrut = $form->get('titre')->getData();
                $fichier = str_replace(" ", "_", $fichierBrut). '.' . $originalExtension;
    
                // on copie le fichier dans le dossier uploads
                $image->move(
                    $this->getParameter('images_directory'),
                    $fichier
                );
    
                //on stock l'image dans la bdd (son nom)
                $article->setPhoto($fichier);
            }

            $articleRepository->add($article, true);

            return $this->redirectToRoute('admin_articles');
        }

        return $this->render('admin/new.html.twig', [
            'form' => $form->createView(),
        ]);
    }

    #[Route('/admin/article/edit/{id}', name: 'admin_article_edit', methods: ['GET', 'POST'])]
    public function edit(Request $request, Article $article, ArticleRepository $articleRepository): Response
    {
        $user = $this->getUser();
        if(!$user){
            return $this->redirectToRoute('home');
        }
        $role = $user->getRoles();
        //dd($role);
        if ($role[0] != "ROLE_ADMIN") { 
            return $this->redirectToRoute('home');
        }

        $form = $this->createForm(ArticleType::class, $article);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $image = $form->get('photo')->getData();
            if($image){
                
                $allowedExtensions = ['jpg', 'jpeg', 'png', 'pdf', 'svg', 'HEIC'];
                $originalExtension = $image->getClientOriginalExtension();
    
                if (!in_array(strtolower($originalExtension), $allowedExtensions)) {
                    $data = ['error' => true, 'msg' => 'Seuls les fichiers .jpg, .jpeg, .svg, .heic et .png sont autorisés pour le telechargement.'];
                    return $this->json($data, Response::HTTP_BAD_REQUEST);
                }
                // on genere un nouveau nom de fichier 
                $fichierBrut = $form->get('titre')->getData();
                $fichierSansSpeciaux = preg_replace('/[^a-zA-Z0-9_.]/', '', $fichierBrut);
                $fichier = str_replace(" ", "_", $fichierSansSpeciaux) . '.' . $originalExtension;
                
                // on copie le fichier dans le dossier uploads
                $image->move(
                    $this->getParameter('images_directory'),
                    $fichier
                );
    
                //on stock l'image dans la bdd (son nom)
                $article->setPhoto($fichier);
            }
            $articleRepository->add($article, true); // Le flush est à true pour persister les changements

            return $this->redirectToRoute('admin_articles');
        }

        return $this->render('admin/edit.html.twig', [
            'form' => $form->createView(),
            'article' => $article,
        ]);
    }

    #[Route('/admin/article/delete/{id}', name: 'admin_article_delete', methods: ['POST'])]
    public function delete(int $id, Request $request, Article $article, ArticleRepository $articleRepository): Response
    {
        $user = $this->getUser();
        if(!$user){
            return $this->redirectToRoute('home');
        }
        $role = $user->getRoles();
        //dd($role);
        if ($role[0] != "ROLE_ADMIN") { 
            return $this->redirectToRoute('home');
        }
        $article = $articleRepository->find($id);
        $image = $article->getPhoto();
        if($image){
            $imagePath = $this->getParameter('images_directory') . '/' . $image;
                if (file_exists($imagePath)) {
                    unlink($imagePath);
                }
        }
        
        $articleRepository->remove($article, true);
        return $this->redirectToRoute('admin_articles');
    }
}