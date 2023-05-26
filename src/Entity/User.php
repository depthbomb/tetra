<?php namespace App\Entity;

use App\Utils;
use DateTimeImmutable;
use Doctrine\ORM\Mapping as ORM;
use App\Repository\UserRepository;
use Doctrine\Common\Collections\Collection;
use Doctrine\Common\Collections\ArrayCollection;
use Symfony\Component\Security\Core\User\UserInterface;

#[ORM\HasLifecycleCallbacks]
#[ORM\Table(name: '`user`')]
#[ORM\Entity(repositoryClass: UserRepository::class)]
class User implements UserInterface
{
    #[ORM\Id]
    #[ORM\Column]
    #[ORM\GeneratedValue]
    private ?int $id = null;

    #[ORM\Column(length: 36, unique: true)]
    private ?string $username = null;

    #[ORM\Column]
    private array $roles = [];

    #[ORM\Column(length: 255)]
    private ?string $email = null;

    #[ORM\Column(length: 255)]
    private ?string $avatar = null;

    #[ORM\Column(length: 255)]
    private ?string $sub = null;

    #[ORM\Column(length: 255)]
    private ?string $api_key = null;

    #[ORM\Column]
    private ?string $next_api_key_available = null;

    #[ORM\OneToMany(mappedBy: 'creator', targetEntity: Shortlink::class)]
    private Collection $shortlinks;

    #[ORM\Column]
    private ?string $created_at = null;

    #[ORM\Column]
    private ?string $updated_at = null;

    public function __construct()
    {
        $this->shortlinks = new ArrayCollection();
    }

    public function getId(): ?int
    {
        return $this->id;
    }

    public function getUsername(): ?string
    {
        return $this->username;
    }

    public function setUsername(string $username): self
    {
        $this->username = $username;

        return $this;
    }

    /**
     * A visual identifier that represents this user.
     *
     * @see UserInterface
     */
    public function getUserIdentifier(): string
    {
        return $this->username;
    }

    /**
     * @inheritDoc
     */
    public function eraseCredentials()
    {

    }

    /**
     * @see UserInterface
     */
    public function getRoles(): array
    {
        $roles = $this->roles;
        // guarantee every user at least has ROLE_USER
        $roles[] = 'ROLE_USER';

        return array_unique($roles);
    }

    public function setRoles(array $roles): self
    {
        $this->roles = $roles;

        return $this;
    }

    public function getEmail(): ?string
    {
        return $this->email;
    }

    public function setEmail(string $email): self
    {
        $this->email = $email;

        return $this;
    }

    public function getAvatar(): ?string
    {
        return $this->avatar;
    }

    public function setAvatar(string $avatar): self
    {
        $this->avatar = $avatar;

        return $this;
    }

    public function setGravatar(string $email): self
    {
        $this->avatar = Utils::createGravatar($email);

        return $this;
    }

    public function getGravatar(int $size = 80, string $default = 'identicon', string $rating = 'pg'): string
    {
        $gravatar = $this->avatar;
        $gravatar .= "?s=$size&d=$default&r=$rating";

        return $gravatar;
    }

    public function getSub(): ?string
    {
        return $this->sub;
    }

    public function setSub(string $sub): self
    {
        $this->sub = $sub;

        return $this;
    }

    public function getApiKey(): ?string
    {
        return $this->api_key;
    }

    public function setApiKey(): self
    {
        $this->api_key = Utils::generateRandomId($_ENV['API_KEY_LENGTH']);

        return $this;
    }

    public function getNextApiKeyAvailable(): ?string
    {
        return $this->next_api_key_available;
    }

    public function setNextApiKeyAvailable(): self
    {
        $this->next_api_key_available = date_create_immutable("+{$_ENV['API_KEY_REGENERATION_DELAY']}")->format('c');

        return $this;
    }

    public function canApiKeyBeRegenerated(): bool
    {
        return date_create_immutable()->format('c') >= $this->next_api_key_available;
    }

    public function regenerateApiKey(): self
    {
        $this->setApiKey();
        $this->setNextApiKeyAvailable();

        return $this;
    }

    /**
     * @return Collection<int, Shortlink>
     */
    public function getShortlinks(): Collection
    {
        return $this->shortlinks;
    }

    public function addShortlink(Shortlink $shortlink): self
    {
        if (!$this->shortlinks->contains($shortlink))
        {
            $this->shortlinks->add($shortlink);
            $shortlink->setCreator($this);
        }

        return $this;
    }

    public function removeShortlink(Shortlink $shortlink): self
    {
        if ($this->shortlinks->removeElement($shortlink))
        {
            // set the owning side to null (unless already changed)
            if ($shortlink->getCreator() === $this)
            {
                $shortlink->setCreator(null);
            }
        }

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

    #[ORM\PrePersist]
    public function setAutoCreatedAt(): void
    {
        if (!$this->created_at)
        {
            $this->created_at = date_create_immutable()->format('c');
        }
    }

    #[ORM\PrePersist]
    public function setAutoUpdatedAt(): void
    {
        $this->updated_at = date_create_immutable()->format('c');
    }

    #[ORM\PrePersist]
    public function setAutoApiKey(): void
    {
        $this->regenerateApiKey();
    }
}
