package shortlink

import "testing"

func TestValidateShortcode(t *testing.T) {
	t.Parallel()

	for _, value := range []string{"abc", "go_123", "A-b"} {
		if err := ValidateShortcode(value); err != nil {
			t.Errorf("ValidateShortcode(%q): %v", value, err)
		}
	}
	for _, value := range []string{"ab", "contains space", "health", "API"} {
		if err := ValidateShortcode(value); err == nil {
			t.Errorf("ValidateShortcode(%q) returned nil", value)
		}
	}
}

func TestValidateDestination(t *testing.T) {
	t.Parallel()

	for _, value := range []string{"https://example.com/path", "http://localhost:8080"} {
		if err := ValidateDestination(value); err != nil {
			t.Errorf("ValidateDestination(%q): %v", value, err)
		}
	}
	for _, value := range []string{"example.com", "javascript:alert(1)", "ftp://example.com"} {
		if err := ValidateDestination(value); err == nil {
			t.Errorf("ValidateDestination(%q) returned nil", value)
		}
	}
}

func TestSecureToken(t *testing.T) {
	t.Parallel()

	token, err := secureToken(64)
	if err != nil {
		t.Fatalf("secureToken: %v", err)
	}
	if len(token) != 64 {
		t.Fatalf("token length = %d, want 64", len(token))
	}
	if err := ValidateSecret(token); err != nil {
		t.Fatalf("generated token is invalid: %v", err)
	}
}
