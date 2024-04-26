<?php

namespace App\Entity;

use App\Repository\VoitureRepository;
use Doctrine\ORM\Mapping as ORM;

#[ORM\Entity(repositoryClass: VoitureRepository::class)]
class Voiture
{
    #[ORM\Id]
    #[ORM\GeneratedValue]
    #[ORM\Column]
    private ?int $id = null;

    #[ORM\Column(length: 60)]
    private ?string $marque = null;

    #[ORM\Column(length: 60)]
    private ?string $modele = null;

    #[ORM\Column]
    private ?int $autonomie = null;

    #[ORM\Column]
    private ?int $capacite_batterie = null;

    #[ORM\Column(nullable: true)]
    private ?bool $ac_dc = null;

    #[ORM\Column(nullable: true)]
    private ?int $puissance_dc = null;

    #[ORM\Column(nullable: true)]
    private ?int $puissance_ac = null;

    #[ORM\Column(nullable: true)]
    private ?int $tension_batterie = null;

    #[ORM\Column(nullable: true)]
    private ?int $consommation = null;

    #[ORM\Column]
    private ?\DateTimeImmutable $created_at = null;

    #[ORM\ManyToOne(inversedBy: 'voitures')]
    private ?User $user = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getMarque(): ?string
    {
        return $this->marque;
    }

    public function setMarque(string $marque): static
    {
        $this->marque = $marque;

        return $this;
    }

    public function getModele(): ?string
    {
        return $this->modele;
    }

    public function setModele(string $modele): static
    {
        $this->modele = $modele;

        return $this;
    }

    public function getAutonomie(): ?int
    {
        return $this->autonomie;
    }

    public function setAutonomie(int $autonomie): static
    {
        $this->autonomie = $autonomie;

        return $this;
    }

    public function getCapaciteBatterie(): ?int
    {
        return $this->capacite_batterie;
    }

    public function setCapaciteBatterie(int $capacite_batterie): static
    {
        $this->capacite_batterie = $capacite_batterie;

        return $this;
    }

    public function isAcDc(): ?bool
    {
        return $this->ac_dc;
    }

    public function setAcDc(?bool $ac_dc): static
    {
        $this->ac_dc = $ac_dc;

        return $this;
    }

    public function getPuissanceDc(): ?int
    {
        return $this->puissance_dc;
    }

    public function setPuissanceDc(?int $puissance_dc): static
    {
        $this->puissance_dc = $puissance_dc;

        return $this;
    }

    public function getPuissanceAc(): ?int
    {
        return $this->puissance_ac;
    }

    public function setPuissanceAc(?int $puissance_ac): static
    {
        $this->puissance_ac = $puissance_ac;

        return $this;
    }

    public function getTensionBatterie(): ?int
    {
        return $this->tension_batterie;
    }

    public function setTensionBatterie(?int $tension_batterie): static
    {
        $this->tension_batterie = $tension_batterie;

        return $this;
    }

    public function getConsommation(): ?int
    {
        return $this->consommation;
    }

    public function setConsommation(?int $consommation): static
    {
        $this->consommation = $consommation;

        return $this;
    }

    public function getCreatedAt(): ?\DateTimeImmutable
    {
        return $this->created_at;
    }

    public function setCreatedAt(\DateTimeImmutable $created_at): static
    {
        $this->created_at = $created_at;

        return $this;
    }

    public function getUser(): ?User
    {
        return $this->user;
    }

    public function setUser(?User $user): static
    {
        $this->user = $user;

        return $this;
    }
}
