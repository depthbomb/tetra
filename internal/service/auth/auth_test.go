package auth

import (
	"crypto/aes"
	"crypto/cipher"
	"net/http/httptest"
	"net/url"
	"reflect"
	"testing"
	"time"

	"github.com/google/uuid"
	"golang.org/x/oauth2"
)

func TestBeginUsesStateNonceAndPKCE(t *testing.T) {
	t.Parallel()

	manager := testManager(t)
	manager.oauth = oauth2.Config{
		ClientID: "client",
		Endpoint: oauth2.Endpoint{AuthURL: "https://issuer.example/authorize"},
	}
	w := httptest.NewRecorder()
	authorizationURL, err := manager.Begin(w)
	if err != nil {
		t.Fatalf("Begin: %v", err)
	}
	parsed, err := url.Parse(authorizationURL)
	if err != nil {
		t.Fatalf("parse authorization URL: %v", err)
	}
	query := parsed.Query()
	for _, key := range []string{"state", "nonce", "code_challenge"} {
		if query.Get(key) == "" {
			t.Errorf("authorization URL is missing %s", key)
		}
	}
	if query.Get("code_challenge_method") != "S256" {
		t.Errorf("code_challenge_method = %q, want S256", query.Get("code_challenge_method"))
	}
	if len(w.Result().Cookies()) != 1 || w.Result().Cookies()[0].Name != StateCookieName {
		t.Fatal("Begin did not set the state cookie")
	}
}

func TestEncryptedSessionRoundTrip(t *testing.T) {
	t.Parallel()

	manager := testManager(t)
	w := httptest.NewRecorder()
	want := Session{Subject: "auth0|123", Username: "tetra", Admin: true, APIKey: uuid.New()}
	if err := manager.SetSession(w, want); err != nil {
		t.Fatalf("SetSession: %v", err)
	}

	r := httptest.NewRequest("GET", "/", nil)
	r.AddCookie(w.Result().Cookies()[0])
	got, err := manager.ReadSession(r)
	if err != nil {
		t.Fatalf("ReadSession: %v", err)
	}
	if !reflect.DeepEqual(got, want) {
		t.Fatalf("session = %#v, want %#v", got, want)
	}
}

func TestEncryptedSessionRejectsTampering(t *testing.T) {
	t.Parallel()

	manager := testManager(t)
	w := httptest.NewRecorder()
	if err := manager.SetSession(w, Session{Subject: "auth0|123"}); err != nil {
		t.Fatalf("SetSession: %v", err)
	}
	cookie := w.Result().Cookies()[0]
	middle := len(cookie.Value) / 2
	replacement := byte('x')
	if cookie.Value[middle] == replacement {
		replacement = 'y'
	}
	cookie.Value = cookie.Value[:middle] + string(replacement) + cookie.Value[middle+1:]
	r := httptest.NewRequest("GET", "/", nil)
	r.AddCookie(cookie)
	if _, err := manager.ReadSession(r); err == nil {
		t.Fatal("ReadSession accepted a tampered cookie")
	}
}

func testManager(t *testing.T) *Manager {
	t.Helper()
	block, err := aes.NewCipher(make([]byte, 32))
	if err != nil {
		t.Fatal(err)
	}
	aead, err := cipher.NewGCM(block)
	if err != nil {
		t.Fatal(err)
	}
	now := time.Now()
	return &Manager{cipher: aead, now: func() time.Time { return now }}
}
