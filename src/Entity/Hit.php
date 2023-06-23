<?php namespace App\Entity;

use DateTimeImmutable;
use Symfony\Component\Uid\Ulid;
use Doctrine\ORM\Mapping as ORM;
use App\Repository\HitRepository;
use Symfony\Bridge\Doctrine\Types\UlidType;

#[ORM\HasLifecycleCallbacks]
#[ORM\Entity(repositoryClass: HitRepository::class)]
class Hit
{
    #[ORM\Id]
    #[ORM\Column(type: UlidType::NAME, unique: true)]
    #[ORM\GeneratedValue(strategy: 'CUSTOM')]
    #[ORM\CustomIdGenerator(class: 'doctrine.ulid_generator')]
    private ?Ulid $id = null;

    #[ORM\ManyToOne(inversedBy: 'hits')]
    #[ORM\JoinColumn(nullable: false)]
    private ?Shortlink $shortlink = null;

    #[ORM\Column(length: 88)]
    private ?string $ip = null;

    #[ORM\Column(length: 255)]
    private ?string $user_agent = null;

    #[ORM\Column]
    private ?string $created_at = null;

    #[ORM\Column(length: 255, nullable: true)]
    private ?string $referrer = null;

    public function getId(): ?Ulid
    {
        return $this->id;
    }

    public function getShortlink(): ?Shortlink
    {
        return $this->shortlink;
    }

    public function setShortlink(?Shortlink $shortlink): static
    {
        $this->shortlink = $shortlink;

        return $this;
    }

    public function getIp(): ?string
    {
        return $this->ip;
    }

    public function setIp(string $ip): static
    {
        $this->ip = $ip;

        return $this;
    }

    public function getUserAgent(): ?string
    {
        return $this->user_agent;
    }

    public function setUserAgent(string $user_agent): static
    {
        $this->user_agent = $user_agent;

        return $this;
    }

    public function getReferrer(): ?string
    {
        return $this->referrer;
    }

    public function setReferrer(?string $referrer): static
    {
        $this->referrer = $referrer;

        return $this;
    }

    public function getCreatedAt(): ?string
    {
        return $this->created_at;
    }

    public function setCreatedAt(DateTimeImmutable $created_at): self
    {
        $this->created_at = $created_at->format('c');

        return $this;
    }

    #[ORM\PrePersist]
    public function setAutoCreatedAt(): void
    {
        if (!$this->created_at)
        {
            $this->created_at = date_create_immutable()->format('c');
        }
    }
}
