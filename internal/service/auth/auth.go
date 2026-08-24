package auth

import (
	"context"
	"crypto/aes"
	"crypto/cipher"
	"crypto/rand"
	"crypto/sha256"
	"encoding/base64"
	"encoding/json"
	"errors"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/google/uuid"
	"golang.org/x/oauth2"
)

const (
	StateCookieName   = "tetra_oidc_state"
	SessionCookieName = "tetra_user"
	stateLifetime     = 10 * time.Minute
	sessionLifetime   = 180 * 24 * time.Hour
)

var (
	ErrInvalidState = errors.New("invalid OIDC state")
	ErrInvalidToken = errors.New("invalid OIDC token")
)

type Config struct {
	IssuerURL    string
	ClientID     string
	ClientSecret string
	RedirectURL  string
}

type Identity struct {
	Subject   string
	Username  string
	Email     string
	Admin     bool
	RawClaims json.RawMessage
}

type Session struct {
	Subject  string            `json:"sub"`
	Username string            `json:"username"`
	Avatars  map[string]string `json:"avatars"`
	Admin    bool              `json:"admin"`
	APIKey   uuid.UUID         `json:"apiKey"`
}

type Manager struct {
	oauth    oauth2.Config
	verifier *oidc.IDTokenVerifier
	cipher   cipher.AEAD
	secure   bool
	now      func() time.Time
}

type stateCookie struct {
	State    string    `json:"state"`
	Verifier string    `json:"verifier"`
	Nonce    string    `json:"nonce"`
	Expires  time.Time `json:"expires"`
}

type sessionCookie struct {
	Session Session   `json:"session"`
	Expires time.Time `json:"expires"`
}

func New(ctx context.Context, cfg Config) (*Manager, error) {
	if cfg.IssuerURL == "" || cfg.ClientID == "" || cfg.ClientSecret == "" || cfg.RedirectURL == "" {
		return nil, errors.New("OIDC issuer, client ID, client secret, and redirect URL are required")
	}
	redirect, err := url.Parse(cfg.RedirectURL)
	if err != nil || redirect.Host == "" {
		return nil, errors.New("OIDC redirect URL must be absolute")
	}

	provider, err := oidc.NewProvider(ctx, strings.TrimRight(cfg.IssuerURL, "/")+"/")
	if err != nil {
		return nil, fmt.Errorf("discover OIDC provider: %w", err)
	}

	key := sha256.Sum256([]byte("tetra-cookie-v1\x00" + cfg.ClientSecret))
	block, err := aes.NewCipher(key[:])
	if err != nil {
		return nil, fmt.Errorf("create cookie cipher: %w", err)
	}
	aead, err := cipher.NewGCM(block)
	if err != nil {
		return nil, fmt.Errorf("create cookie AEAD: %w", err)
	}

	return &Manager{
		oauth: oauth2.Config{
			ClientID:     cfg.ClientID,
			ClientSecret: cfg.ClientSecret,
			Endpoint:     provider.Endpoint(),
			RedirectURL:  cfg.RedirectURL,
			Scopes:       []string{oidc.ScopeOpenID, "profile", "email"},
		},
		verifier: provider.Verifier(&oidc.Config{ClientID: cfg.ClientID}),
		cipher:   aead,
		secure:   redirect.Scheme == "https",
		now:      time.Now,
	}, nil
}

func (m *Manager) Begin(w http.ResponseWriter) (string, error) {
	state, err := randomToken(32)
	if err != nil {
		return "", err
	}

	verifier := oauth2.GenerateVerifier()
	nonce, err := randomToken(32)
	if err != nil {
		return "", err
	}

	flow := stateCookie{State: state, Verifier: verifier, Nonce: nonce, Expires: m.now().Add(stateLifetime)}
	if err := m.setEncryptedCookie(w, StateCookieName, flow, flow.Expires); err != nil {
		return "", err
	}

	return m.oauth.AuthCodeURL(state, oauth2.S256ChallengeOption(verifier), oidc.Nonce(nonce)), nil
}

func (m *Manager) Complete(ctx context.Context, r *http.Request) (Identity, error) {
	var flow stateCookie
	if err := m.readEncryptedCookie(r, StateCookieName, &flow); err != nil {
		return Identity{}, ErrInvalidState
	}
	if flow.Expires.Before(m.now()) || r.URL.Query().Get("state") != flow.State {
		return Identity{}, ErrInvalidState
	}
	code := r.URL.Query().Get("code")
	if code == "" {
		return Identity{}, ErrInvalidToken
	}

	token, err := m.oauth.Exchange(ctx, code, oauth2.VerifierOption(flow.Verifier))
	if err != nil {
		return Identity{}, fmt.Errorf("exchange authorization code: %w", err)
	}
	rawIDToken, ok := token.Extra("id_token").(string)
	if !ok {
		return Identity{}, ErrInvalidToken
	}
	idToken, err := m.verifier.Verify(ctx, rawIDToken)
	if err != nil || idToken.Nonce != flow.Nonce {
		return Identity{}, ErrInvalidToken
	}

	var rawClaims json.RawMessage
	if err := idToken.Claims(&rawClaims); err != nil {
		return Identity{}, fmt.Errorf("decode raw ID token claims: %w", err)
	}

	var claims struct {
		Subject           string   `json:"sub"`
		Email             string   `json:"email"`
		PreferredUsername string   `json:"preferred_username"`
		Nickname          string   `json:"nickname"`
		Name              string   `json:"name"`
		Groups            []string `json:"groups"`
		NamespacedGroups  []string `json:"https://go.super.fish/groups"`
	}
	if err := json.Unmarshal(rawClaims, &claims); err != nil {
		return Identity{}, fmt.Errorf("decode ID token claims: %w", err)
	}

	if claims.Subject == "" || claims.Email == "" {
		return Identity{}, errors.New("OIDC token is missing sub or email")
	}

	username := firstNonEmpty(claims.PreferredUsername, claims.Nickname, claims.Name, strings.Split(claims.Email, "@")[0])
	groups := append(claims.Groups, claims.NamespacedGroups...)

	return Identity{
		Subject:   claims.Subject,
		Username:  username,
		Email:     strings.ToLower(claims.Email),
		Admin:     contains(groups, "tetra_admin"),
		RawClaims: rawClaims,
	}, nil
}

func (m *Manager) SetSession(w http.ResponseWriter, session Session) error {
	expires := m.now().Add(sessionLifetime)
	return m.setEncryptedCookie(w, SessionCookieName, sessionCookie{Session: session, Expires: expires}, expires)
}

func (m *Manager) ReadSession(r *http.Request) (Session, error) {
	var cookie sessionCookie
	if err := m.readEncryptedCookie(r, SessionCookieName, &cookie); err != nil {
		return Session{}, err
	}

	if !cookie.Expires.After(m.now()) {
		return Session{}, errors.New("session expired")
	}

	return cookie.Session, nil
}

func (m *Manager) ClearState(w http.ResponseWriter)   { m.clearCookie(w, StateCookieName) }
func (m *Manager) ClearSession(w http.ResponseWriter) { m.clearCookie(w, SessionCookieName) }

func (m *Manager) setEncryptedCookie(w http.ResponseWriter, name string, value any, expires time.Time) error {
	plaintext, err := json.Marshal(value)
	if err != nil {
		return fmt.Errorf("encode %s cookie: %w", name, err)
	}

	nonce := make([]byte, m.cipher.NonceSize())
	if _, err := rand.Read(nonce); err != nil {
		return fmt.Errorf("generate cookie nonce: %w", err)
	}

	sealed := m.cipher.Seal(nonce, nonce, plaintext, []byte(name))

	http.SetCookie(w, &http.Cookie{
		Name:     name,
		Value:    base64.RawURLEncoding.EncodeToString(sealed),
		Path:     "/",
		Expires:  expires,
		MaxAge:   int(expires.Sub(m.now()).Seconds()),
		HttpOnly: true,
		Secure:   m.secure,
		SameSite: http.SameSiteLaxMode,
	})

	return nil
}

func (m *Manager) readEncryptedCookie(r *http.Request, name string, target any) error {
	cookie, err := r.Cookie(name)
	if err != nil {
		return err
	}
	sealed, err := base64.RawURLEncoding.DecodeString(cookie.Value)
	if err != nil || len(sealed) < m.cipher.NonceSize() {
		return errors.New("invalid encrypted cookie")
	}
	nonce, ciphertext := sealed[:m.cipher.NonceSize()], sealed[m.cipher.NonceSize():]
	plaintext, err := m.cipher.Open(nil, nonce, ciphertext, []byte(name))
	if err != nil {
		return errors.New("invalid encrypted cookie")
	}

	return json.Unmarshal(plaintext, target)
}

func (m *Manager) clearCookie(w http.ResponseWriter, name string) {
	http.SetCookie(w, &http.Cookie{
		Name: name, Value: "", Path: "/", MaxAge: -1, Expires: time.Unix(1, 0),
		HttpOnly: true, Secure: m.secure, SameSite: http.SameSiteLaxMode,
	})
}

func randomToken(bytes int) (string, error) {
	buffer := make([]byte, bytes)
	if _, err := rand.Read(buffer); err != nil {
		return "", fmt.Errorf("generate random token: %w", err)
	}
	return base64.RawURLEncoding.EncodeToString(buffer), nil
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return ""
}

func contains(values []string, target string) bool {
	for _, value := range values {
		if value == target {
			return true
		}
	}
	return false
}
