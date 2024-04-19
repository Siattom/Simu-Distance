<?php

namespace App\Controller;

use App\Form\OublieMdpType;
use App\Form\ReinitialiseType;
use App\Repository\UserRepository;
use Doctrine\ORM\EntityManagerInterface;
use PHPMailer\PHPMailer\PHPMailer;
use Symfony\Bundle\FrameworkBundle\Controller\AbstractController;
use Symfony\Component\HttpFoundation\Request;
use Symfony\Component\HttpFoundation\Response;
use Symfony\Component\PasswordHasher\Hasher\UserPasswordHasherInterface;
use Symfony\Component\Routing\Attribute\Route;
use Symfony\Component\Security\Http\Authentication\AuthenticationUtils;

class SecurityController extends AbstractController
{
    #[Route(path: '/login', name: 'app_login')]
    public function login(AuthenticationUtils $authenticationUtils): Response
    {
        // get the login error if there is one
        $error = $authenticationUtils->getLastAuthenticationError();

        // last username entered by the user
        $lastUsername = $authenticationUtils->getLastUsername();

        return $this->render('security/login.html.twig', [
            'last_username' => $lastUsername,
            'error' => $error,
        ]);
    }

    #[Route(path: '/logout', name: 'app_logout')]
    public function logout(): void
    {
        throw new \LogicException('This method can be blank - it will be intercepted by the logout key on your firewall.');
    }

    #[Route(path:"/oublie", name:"mdp_oublie")]
    public function mdpOublie(EntityManagerInterface $entityManager, Request $request, UserRepository $userRepository)
    {
        $form = $this->createForm(OublieMdpType::class);
        $form->handleRequest($request);

        if ($form->isSubmitted() && $form->isValid()) {
            $formData = $form->getData();
            $email = $formData['Email'];

            $user = $userRepository->findByEmail($email);
            if(!$user){
                $this->addFlash('mdp', 'Cette adresse mail est erronée ou inconnu !');
                return $this->redirectToRoute('mdp_oublie');
            }
            // il faut générer un code
            $code = random_int(100000, 999999);
            $user[0]->setCodeUnique($code);
            $nom = $user[0]->getNom();

            $entityManager->persist($user[0]);
            $entityManager->flush();
            $userId = $user[0]->getId();
    
            $mail = new PHPMailer(true);
            $mail->isSMTP();
            $mail->Host = 'smtp.gmail.com';  // Le nom d'hôte de votre serveur SMTP
            $mail->Port = 587;  // Le port de votre serveur SMTP
            $mail->SMTPSecure = 'tls';  // Le protocole de sécurité utilisé (tls ou ssl)
            $mail->SMTPAuth = true;  // Indique si l'authentification est requise ou non
            $mail->Username = 'service.technique.iot@gmail.com';  // Votre adresse email
            $mail->Password = 'wwre mrii pimy pjlw';  // Votre mot de passe
                    
                    
            // Configuration de l'expéditeur et du destinataire
            $mail->setFrom('service.technique.iot@gmail.com', 'Support FriwiMap');
            $mail->addAddress($email);
                    
            // Configuration du contenu de l'email
                          $mail->Subject = 'Reinitialisation votre mot de passe';
            
                          // Création de la page HTML
                          $htmlBody = '
                          <!DOCTYPE html>
                          <html lang="fr">
                          <head>
                              <meta charset="UTF-8">
                              <meta name="viewport" content="width=device-width, initial-scale=1.0">
                              <title>Interviz - Activation</title>
                              <style>
                                  body {
                                      background-color: #f2f2f2;
                                      font-family: Arial, sans-serif;
                                  }
                                  table {
                                      max-width: 800px;
                                      width: 100%;
                                      margin: 0 auto;
                                  }
                                  header {
                                      background-color: #333;
                                      color: #fff;
                                      padding: 10px;
                                      text-align: center;
                                  }
                                  footer {
                                      background-color: #333;
                                      color: #fff;
                                      padding: 10px;
                                      text-align: center;
                                  }
                                  h2 {
                                      color: #333;
                                  }
                                  .content {
                                      padding: 20px;
                                      box-sizing: border-box;
                                  }
                                  .entete { 
                                      display: flex;
                                      width: 100%;
                                      justify-content: space-around;
                                  }
                                  .img { 
                                      maw-width: 100px;
                                  }
                                  .ahref {
                                      text-decoration: none;
                                      color: black;
                                  }
                              </style>
                          </head>
                          <body>
                              <table>
                                  <tr>
                                      <td>
                                          <header>
                                              <h1>FriwiMap - Support Automatique</h1>
                                          </header>
                                      </td>
                                  </tr>
                                  <tr>
                                      <td>
                                          <div class="content">
                                              <p>Bonjour,</p>
                                              <p>Pour réinitialiser votre mot de passe <a href="https://app.interviz.fr/start/reinitialiser/'.$userId.'">cliquez ici</a></p>
                                              <p>Code de vérification : '.$code.'</p>
                                              <p>Bien à vous,</p>
                                              <p>FriwiMap - Support Automatique.</p>
                                          </div>
                                      </td>
                                  </tr>
                                  <tr>
                                      <td>
                                          <footer>
                                              <p>Téléphone: <a class="ahref" href="tel:+33185735838">01 85 73 58 38</a></p>
                                              <p>Horaires: 9h - 12h / 14h - 17h</p>
                                          </footer>
                                      </td>
                                  </tr>
                              </table>
                          </body>
                          </html>
                      ';
              
                          
                          $mail->isHTML(true);
                          $mail->Body = $htmlBody;
                    
            if($mail->send()){
                return $this->redirectToRoute('home');
            }
        }

            return $this->render('security/oublieMdp.html.twig', [
                'oublieForm' => $form->createView(),
            ]);
    }

    #[Route(path:"/reinitialiser/{id}", name:"mdp_reinitialise")]
    public function reinitialiserMdp(int $id, UserPasswordHasherInterface $userPasswordHasher, EntityManagerInterface $entityManager, Request $request, UserRepository $userRepository)
    {
        $user = $userRepository->find($id);
        $userCode = $user->getCodeUnique();
        $userEmail = $user->getEmail();

        $form = $this->createForm(ReinitialiseType::class);
        $form->handleRequest($request);

        if($form->isSubmitted() && $form->isValid()){
            $mdp = $form->get('password')->getData();
            $mdpVerif = $form->get('Mot_de_passe')->getData();
            $codeForm = $form->get('code_unique')->getData();
            $emailForm = $form->get('Email')->getData();
            
            if(!$user){
                $this->addFlash('id', 'Désolé, votre identifiant ne correspond à aucun compte existant !');
                return $this->redirectToRoute('mdp_oublie');
            }
            if($userEmail !== $emailForm){
                $this->addFlash('mail', 'Votre mail ne correspond à aucun utilisateur !');
                return $this->redirectToRoute('mdp_oublie');
            }
            if($userCode != $codeForm){//attention beug
                $this->addFlash('code', 'Le code de vérification est incorrect !');
                return $this->redirectToRoute('mdp_oublie');
            }
            $user->setPassword(
                $userPasswordHasher->hashPassword(
                    $user,
                    $form->get('password')->getData()
                )
            );
            $user->setCodeUnique(null);

            $entityManager->persist($user);
            $entityManager->flush();

            return $this->redirectToRoute('app_login');

        }

        return $this->render('security/reinitialise.html.twig', [
            'oublieForm' => $form->createView(),
        ]);
    }
}
