<?php namespace App\Entity;

use App\Utils;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;
use App\Repository\ShortlinkRepository;

#[ORM\HasLifecycleCallbacks]
#[ORM\Entity(repositoryClass: ShortlinkRepository::class)]
class Shortlink
{
    #[ORM\Id]
    #[ORM\Column]
    #[ORM\GeneratedValue]
    private ?int $id = null;

    #[ORM\Column(length: 255)]
    private ?string $creator_ip = null;

    #[ORM\Column(length: 255)]
    private ?string $shortcode = null;

    #[ORM\Column(length: 255)]
    private ?string $shortlink = null;

    #[ORM\Column(length: 255)]
    private ?string $destination = null;

    #[ORM\Column(length: 255)]
    private ?string $secret = null;

    #[ORM\Column]
    private bool $disabled = false;

    #[ORM\Column(nullable: true)]
    private ?string $expires_at = null;

    #[ORM\Column]
    private ?string $created_at = null;

    #[ORM\Column]
    private ?string $updated_at = null;

    #[ORM\ManyToOne(inversedBy: 'shortlinks')]
    private ?User $creator = null;

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getCreatorIp(): ?string
    {
        return $this->creator_ip;
    }

    public function setCreatorIp(string $creator_ip): self
    {
        $this->creator_ip = $creator_ip;

        return $this;
    }

    public function getShortcode(): ?string
    {
        return $this->shortcode;
    }

    public function setShortcode(string $shortcode): self
    {
        $this->shortcode = $shortcode;

        return $this;
    }

    public function getShortlink(): ?string
    {
        return $this->shortlink;
    }

    public function setShortlink(string $shortlink): self
    {
        $this->shortlink = $shortlink;

        return $this;
    }

    public function getDestination(): ?string
    {
        return $this->destination;
    }

    public function setDestination(string $destination): self
    {
        $this->destination = $destination;

        return $this;
    }

    public function getSecret(): ?string
    {
        return $this->secret;
    }

    public function setSecret(string $secret): self
    {
        $this->secret = $secret;

        return $this;
    }

    public function isDisabled(): bool
    {
        return $this->disabled;
    }

    public function setDisabled(bool $disabled): self
    {
        $this->disabled = $disabled;

        return $this;
    }

    public function toggleDisabled(): self
    {
        $this->disabled = !$this->disabled;

        return $this;
    }


    public function getExpiresAt(): ?string
    {
        return $this->expires_at;
    }

    public function setExpiresAt(DateTimeImmutable $expires_at): self
    {
        $this->expires_at = $expires_at->format('c');

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

    public function getUpdatedAt(): ?string
    {
        return $this->updated_at;
    }

    public function setUpdatedAt(DateTimeImmutable $updated_at): self
    {
        $this->updated_at = $updated_at->format('c');

        return $this;
    }

    public function getCreator(): ?User
    {
        return $this->creator;
    }

    public function setCreator(?User $creator): self
    {
        $this->creator = $creator;

        return $this;
    }

    #[ORM\PrePersist]
    public function setAutoSecret(): void
    {
        $secret = Utils::generateRandomId($_ENV['SECRET_KEY_LENGTH']);

        if (!$this->secret)
        {
            $this->secret = $secret;
        }
    }

    #[ORM\PrePersist]
    public function setAutoCreatedAt(): void
    {
        if (!$this->created_at)
        {
            $this->created_at = (new DateTimeImmutable())->format('c');
        }
    }

    #[ORM\PrePersist]
    public function setAutoUpdatedAt(): void
    {
        $this->updated_at = (new DateTimeImmutable())->format('c');
    }
}
