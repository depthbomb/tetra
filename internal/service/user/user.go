package user

import (
	"context"
	"errors"
	"fmt"
	"time"

	"github.com/google/uuid"

	"go-tetra/ent"
	entuser "go-tetra/ent/user"
)

var ErrAPIKeyCooldown = errors.New("API key cannot be regenerated yet")

type PublicUser struct {
	Username string `json:"username"`
	Avatar   string `json:"avatar"`
	Admin    bool   `json:"admin"`
}

type OIDCIdentity struct {
	Subject  string
	Username string
	Email    string
	Admin    bool
}

type AuthenticatedUser struct {
	Subject  string
	Username string
	Avatars  map[string]string
	Admin    bool
	APIKey   uuid.UUID
}

type APIKeyInfo struct {
	CanRegenerate       bool      `json:"canRegenerate"`
	NextAPIKeyAvailable time.Time `json:"nextApiKeyAvailable"`
}

type Service struct {
	client *ent.Client
}

func New(client *ent.Client) *Service {
	return &Service{client: client}
}

func (s *Service) FetchAll(ctx context.Context) ([]*ent.User, error) {
	users, err := s.client.User.Query().All(ctx)
	if err != nil {
		return nil, fmt.Errorf("fetch all users: %w", err)
	}

	return users, nil
}

func (s *Service) FetchByUsername(ctx context.Context, username string) (*ent.User, error) {
	u, err := s.client.User.Query().Where(entuser.UsernameEQ(username)).First(ctx)
	if err != nil {
		return nil, fmt.Errorf("fetch user by username: %w", err)
	}

	return u, nil
}

func (s *Service) FetchBySub(ctx context.Context, sub string) (*ent.User, error) {
	u, err := s.client.User.Query().Where(entuser.SubEQ(sub)).Only(ctx)
	if err != nil {
		return nil, fmt.Errorf("fetch user by sub: %w", err)
	}

	return u, nil
}

func (s *Service) ListPublic(ctx context.Context) ([]PublicUser, error) {
	users, err := s.client.User.Query().All(ctx)
	if err != nil {
		return nil, fmt.Errorf("list users: %w", err)
	}

	result := make([]PublicUser, 0, len(users))
	for _, u := range users {
		result = append(result, PublicUser{
			Username: u.Username,
			Avatar:   gravatarURL(u.Email, 128),
			Admin:    u.Admin,
		})
	}
	return result, nil
}

func (s *Service) UpsertOIDC(ctx context.Context, identity OIDCIdentity) (AuthenticatedUser, error) {
	existing, err := s.client.User.Query().Where(entuser.SubEQ(identity.Subject)).Only(ctx)
	if err != nil && !ent.IsNotFound(err) {
		return AuthenticatedUser{}, fmt.Errorf("find OIDC user: %w", err)
	}

	var record *ent.User
	if ent.IsNotFound(err) {
		record, err = s.client.User.Create().
			SetSub(identity.Subject).
			SetUsername(identity.Username).
			SetEmail(identity.Email).
			SetAdmin(identity.Admin).
			Save(ctx)
	} else {
		record, err = s.client.User.UpdateOne(existing).
			SetUsername(identity.Username).
			SetEmail(identity.Email).
			SetAdmin(identity.Admin).
			Save(ctx)
	}
	if err != nil {
		return AuthenticatedUser{}, fmt.Errorf("upsert OIDC user: %w", err)
	}

	return AuthenticatedUser{
		Subject:  record.Sub,
		Username: record.Username,
		Avatars: map[string]string{
			"x24": gravatarURL(record.Email, 24),
			"x32": gravatarURL(record.Email, 32),
		},
		Admin:  record.Admin,
		APIKey: record.APIKey,
	}, nil
}

func (s *Service) GetAPIKeyInfo(ctx context.Context, userID uuid.UUID) (APIKeyInfo, error) {
	record, err := s.client.User.Get(ctx, userID)
	if ent.IsNotFound(err) {
		return APIKeyInfo{}, fmt.Errorf("get API key owner: %w", err)
	}
	if err != nil {
		return APIKeyInfo{}, fmt.Errorf("get API key info: %w", err)
	}
	now := time.Now()
	return APIKeyInfo{
		CanRegenerate:       !now.Before(record.ResetAPIKeyAt),
		NextAPIKeyAvailable: record.ResetAPIKeyAt,
	}, nil
}

func (s *Service) RegenerateAPIKey(ctx context.Context, userID uuid.UUID) (uuid.UUID, error) {
	record, err := s.client.User.Get(ctx, userID)
	if ent.IsNotFound(err) {
		return uuid.Nil, fmt.Errorf("find API key owner: %w", err)
	}
	if err != nil {
		return uuid.Nil, fmt.Errorf("find API key owner: %w", err)
	}

	now := time.Now()
	if now.Before(record.ResetAPIKeyAt) {
		return uuid.Nil, ErrAPIKeyCooldown
	}

	newAPIKey := uuid.New()
	updated, err := s.client.User.Update().
		Where(entuser.IDEQ(record.ID), entuser.ResetAPIKeyAtLTE(now)).
		SetAPIKey(newAPIKey).
		SetResetAPIKeyAt(now.Add(2 * time.Hour)).
		Save(ctx)
	if err != nil {
		return uuid.Nil, fmt.Errorf("regenerate API key: %w", err)
	}
	if updated == 0 {
		return uuid.Nil, ErrAPIKeyCooldown
	}
	return newAPIKey, nil
}
