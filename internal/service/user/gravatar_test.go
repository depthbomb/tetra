package user

import "testing"

func TestGravatarURLNormalizesEmail(t *testing.T) {
	t.Parallel()

	got := gravatarURL("  USER@example.com ", 128)
	want := "https://s.gravatar.com/avatar/b4c9a289323b21a01c3e940f150eb9b8c542587f1abfd8f0e1cc1ffc5e475514?d=identicon&r=pg&s=128"
	if got != want {
		t.Fatalf("gravatarURL() = %q, want %q", got, want)
	}
}
