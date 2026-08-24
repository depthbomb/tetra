package shortlink

import (
	"context"
	"crypto/rand"
	"encoding/base64"
	"errors"
	"fmt"
	"strings"
	"time"

	"github.com/google/uuid"

	"go-tetra/ent"
	entshortlink "go-tetra/ent/shortlink"
	entuser "go-tetra/ent/user"
)

var (
	ErrNotFound = errors.New("shortlink not found")
	ErrConflict = errors.New("shortcode is already in use")
)

const maxCreateAttempts = 12

type Service struct {
	client  *ent.Client
	baseURL string
	qr      QRCodeGenerator
	now     func() time.Time
	token   func(int) (string, error)
}

type QRCodeGenerator interface {
	Create(string) ([]byte, error)
}

type CreateInput struct {
	CreatorIP   string
	Destination string
	Shortcode   string
	CreatorID   *uuid.UUID
	TTL         time.Duration
}

type Public struct {
	Shortcode   string     `json:"shortcode"`
	Shortlink   string     `json:"shortlink"`
	Destination string     `json:"destination"`
	Hits        int64      `json:"hits"`
	CreatedAt   time.Time  `json:"createdAt"`
	ExpiresAt   *time.Time `json:"expiresAt"`
}

type Owned struct {
	Public
	Secret string `json:"secret"`
}

type Admin struct {
	Owned
	CreatorIP string   `json:"creatorIp"`
	User      *Creator `json:"user"`
	Disabled  bool     `json:"disabled"`
}

type Creator struct {
	Username string `json:"username"`
}

type Created struct {
	Shortcode   string     `json:"shortcode"`
	Shortlink   string     `json:"shortlink"`
	Destination string     `json:"destination"`
	Secret      string     `json:"secret"`
	ExpiresAt   *time.Time `json:"expiresAt"`
}

func New(client *ent.Client, baseURL string, qr QRCodeGenerator) *Service {
	return &Service{
		client:  client,
		baseURL: strings.TrimRight(baseURL, "/"),
		qr:      qr,
		now:     time.Now,
		token:   secureToken,
	}
}

func (s *Service) Create(ctx context.Context, input CreateInput) (Created, error) {
	if strings.TrimSpace(input.CreatorIP) == "" {
		return Created{}, fmt.Errorf("%w: creator IP is required", ErrInvalidInput)
	}
	if err := ValidateDestination(input.Destination); err != nil {
		return Created{}, err
	}
	if input.Shortcode != "" {
		if err := ValidateShortcode(input.Shortcode); err != nil {
			return Created{}, err
		}
	}
	if input.TTL != 0 && input.TTL < time.Minute {
		return Created{}, fmt.Errorf("%w: duration must be at least one minute", ErrInvalidInput)
	}

	for attempt := range maxCreateAttempts {
		code := input.Shortcode
		if code == "" {
			length := 3 + attempt/4
			var err error
			code, err = s.token(length)
			if err != nil {
				return Created{}, fmt.Errorf("generate shortcode: %w", err)
			}
		}

		secret, err := s.token(64)
		if err != nil {
			return Created{}, fmt.Errorf("generate secret: %w", err)
		}

		builder := s.client.Shortlink.Create().
			SetCreatorIP(input.CreatorIP).
			SetShortcode(code).
			SetShortlink(s.shortlinkURL(code)).
			SetDestination(input.Destination).
			SetSecretKey(secret).
			SetNillableCreatorID(input.CreatorID)
		if input.TTL > 0 {
			builder.SetExpiresAt(s.now().Add(input.TTL))
		}

		created, err := builder.Save(ctx)
		if err == nil {
			return s.createdDTO(created), nil
		}
		if !ent.IsConstraintError(err) {
			return Created{}, fmt.Errorf("create shortlink: %w", err)
		}
		if input.Shortcode != "" {
			return Created{}, ErrConflict
		}
	}

	return Created{}, errors.New("could not generate an unused shortcode")
}

func (s *Service) Get(ctx context.Context, shortcode string) (Public, error) {
	if err := ValidateShortcode(shortcode); err != nil {
		return Public{}, err
	}

	record, err := s.client.Shortlink.Query().Where(entshortlink.ShortcodeEQ(shortcode), entshortlink.DisabledEQ(false)).Only(ctx)
	if ent.IsNotFound(err) {
		return Public{}, ErrNotFound
	}
	if err != nil {
		return Public{}, fmt.Errorf("get shortlink: %w", err)
	}
	if expired(record, s.now()) {
		return Public{}, ErrNotFound
	}

	return s.publicDTO(record), nil
}

func (s *Service) ListForUser(ctx context.Context, userID uuid.UUID) ([]Owned, error) {
	records, err := s.client.Shortlink.Query().Where(entshortlink.DisabledEQ(false), entshortlink.HasCreatorWith(entuser.IDEQ(userID))).Order(ent.Desc(entshortlink.FieldCreatedAt)).All(ctx)
	if err != nil {
		return nil, fmt.Errorf("list user shortlinks: %w", err)
	}

	result := make([]Owned, 0, len(records))
	for _, record := range records {
		if !expired(record, s.now()) {
			result = append(result, s.ownedDTO(record))
		}
	}

	return result, nil
}

func (s *Service) ListAll(ctx context.Context) ([]Admin, error) {
	records, err := s.client.Shortlink.Query().WithCreator().Order(ent.Desc(entshortlink.FieldCreatedAt)).All(ctx)
	if err != nil {
		return nil, fmt.Errorf("list all shortlinks: %w", err)
	}

	result := make([]Admin, 0, len(records))
	for _, record := range records {
		item := Admin{
			Owned:     s.ownedDTO(record),
			CreatorIP: record.CreatorIP,
			Disabled:  record.Disabled,
		}

		if record.Edges.Creator != nil {
			item.User = &Creator{Username: record.Edges.Creator.Username}
		}

		result = append(result, item)
	}

	return result, nil
}

func (s *Service) Delete(ctx context.Context, shortcode, secret string) error {
	if err := ValidateShortcode(shortcode); err != nil {
		return err
	}
	if err := ValidateSecret(secret); err != nil {
		return err
	}
	count, err := s.client.Shortlink.Delete().
		Where(entshortlink.ShortcodeEQ(shortcode), entshortlink.SecretKeyEQ(secret)).
		Exec(ctx)
	if err != nil {
		return fmt.Errorf("delete shortlink: %w", err)
	}
	if count == 0 {
		return ErrNotFound
	}

	return nil
}

func (s *Service) Available(ctx context.Context, shortcode string) (bool, error) {
	if err := ValidateShortcode(shortcode); err != nil {
		return false, err
	}
	exists, err := s.client.Shortlink.Query().Where(entshortlink.ShortcodeEQ(shortcode)).Exist(ctx)
	if err != nil {
		return false, fmt.Errorf("check shortcode availability: %w", err)
	}

	return !exists, nil
}

func (s *Service) SetExpiry(ctx context.Context, shortcode, secret string, ttl time.Duration) (time.Time, error) {
	if err := ValidateShortcode(shortcode); err != nil {
		return time.Time{}, err
	}
	if err := ValidateSecret(secret); err != nil {
		return time.Time{}, err
	}
	if ttl < time.Minute {
		return time.Time{}, fmt.Errorf("%w: duration must be at least one minute", ErrInvalidInput)
	}

	expiresAt := s.now().Add(ttl)
	record, err := s.client.Shortlink.Update().
		Where(entshortlink.ShortcodeEQ(shortcode), entshortlink.SecretKeyEQ(secret)).
		SetExpiresAt(expiresAt).
		Save(ctx)
	if err != nil {
		return time.Time{}, fmt.Errorf("set shortlink expiry: %w", err)
	}
	if record == 0 {
		return time.Time{}, ErrNotFound
	}

	return expiresAt, nil
}

// DeleteExpired removes every shortlink whose expiration time has been reached. Expiration checks in read paths remain
// authoritative; this method only reclaims expired records and can safely be called by multiple app instances.
func (s *Service) DeleteExpired(ctx context.Context) (int, error) {
	deleted, err := s.client.Shortlink.Delete().
		Where(entshortlink.ExpiresAtNotNil(), entshortlink.ExpiresAtLTE(s.now())).
		Exec(ctx)
	if err != nil {
		return 0, fmt.Errorf("delete expired shortlinks: %w", err)
	}

	return deleted, nil
}

func (s *Service) Toggle(ctx context.Context, shortcode string) (bool, error) {
	if err := ValidateShortcode(shortcode); err != nil {
		return false, err
	}
	record, err := s.client.Shortlink.Query().Where(entshortlink.ShortcodeEQ(shortcode)).Only(ctx)
	if ent.IsNotFound(err) {
		return false, ErrNotFound
	}
	if err != nil {
		return false, fmt.Errorf("find shortlink to toggle: %w", err)
	}
	disabled := !record.Disabled
	if _, err := s.client.Shortlink.UpdateOneID(record.ID).SetDisabled(disabled).Save(ctx); err != nil {
		return false, fmt.Errorf("toggle shortlink: %w", err)
	}

	return disabled, nil
}

// Resolve finds an active shortlink and atomically increments its hit counter.
func (s *Service) Resolve(ctx context.Context, shortcode string) (string, error) {
	if err := ValidateShortcode(shortcode); err != nil {
		return "", err
	}

	record, err := s.client.Shortlink.Query().
		Where(entshortlink.ShortcodeEQ(shortcode), entshortlink.DisabledEQ(false)).
		Only(ctx)
	if ent.IsNotFound(err) {
		return "", ErrNotFound
	}
	if err != nil {
		return "", fmt.Errorf("resolve shortlink: %w", err)
	}
	if expired(record, s.now()) {
		return "", ErrNotFound
	}

	updated, err := s.client.Shortlink.Update().
		Where(entshortlink.IDEQ(record.ID), entshortlink.DisabledEQ(false)).
		AddHits(1).
		Save(ctx)
	if err != nil {
		return "", fmt.Errorf("increment shortlink hits: %w", err)
	}
	if updated == 0 {
		return "", ErrNotFound
	}

	return record.Destination, nil
}

func (s *Service) CreateQRCode(ctx context.Context, shortcode string) ([]byte, error) {
	if err := ValidateShortcode(shortcode); err != nil {
		return nil, err
	}

	record, err := s.client.Shortlink.Query().
		Where(entshortlink.ShortcodeEQ(shortcode), entshortlink.DisabledEQ(false)).
		Only(ctx)
	if ent.IsNotFound(err) {
		return nil, ErrNotFound
	}
	if err != nil {
		return nil, fmt.Errorf("create shortlink QR code: %w", err)
	}
	if expired(record, s.now()) {
		return nil, ErrNotFound
	}

	qrBytes, err := s.qr.Create(s.shortlinkURL(shortcode))
	if err != nil {
		return nil, fmt.Errorf("create shortlink QR code: %w", err)
	}

	return qrBytes, nil
}

func secureToken(length int) (string, error) {
	bytes := make([]byte, (length*6+7)/8)
	if _, err := rand.Read(bytes); err != nil {
		return "", err
	}

	return base64.RawURLEncoding.EncodeToString(bytes)[:length], nil
}

func expired(record *ent.Shortlink, now time.Time) bool {
	return record.ExpiresAt != nil && !record.ExpiresAt.After(now)
}

func (s *Service) shortlinkURL(shortcode string) string {
	return s.baseURL + "/go/" + shortcode
}

func (s *Service) publicDTO(record *ent.Shortlink) Public {
	return Public{
		Shortcode:   record.Shortcode,
		Shortlink:   s.shortlinkURL(record.Shortcode),
		Destination: record.Destination,
		Hits:        record.Hits,
		CreatedAt:   record.CreatedAt,
		ExpiresAt:   record.ExpiresAt,
	}
}

func (s *Service) ownedDTO(record *ent.Shortlink) Owned {
	return Owned{Public: s.publicDTO(record), Secret: record.SecretKey}
}

func (s *Service) createdDTO(record *ent.Shortlink) Created {
	return Created{
		Shortcode:   record.Shortcode,
		Shortlink:   s.shortlinkURL(record.Shortcode),
		Destination: record.Destination,
		Secret:      record.SecretKey,
		ExpiresAt:   record.ExpiresAt,
	}
}
