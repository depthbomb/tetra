package shortlink

import (
	"errors"
	"fmt"
	"net/url"
	"regexp"
	"strings"
)

var (
	ErrInvalidInput  = errors.New("invalid input")
	shortcodePattern = regexp.MustCompile(`^[a-zA-Z0-9_-]{3,64}$`)
	secretPattern    = regexp.MustCompile(`^[a-zA-Z0-9_-]{64}$`)
	reservedCodes    = map[string]struct{}{
		"api": {}, "go": {}, "health": {}, "oidc": {}, "ready": {}, "sse": {},
	}
)

func ValidateShortcode(value string) error {
	if !shortcodePattern.MatchString(value) {
		return fmt.Errorf("%w: shortcode must be 3-64 URL-safe characters", ErrInvalidInput)
	}

	if _, reserved := reservedCodes[strings.ToLower(value)]; reserved {
		return fmt.Errorf("%w: shortcode is reserved", ErrInvalidInput)
	}

	return nil
}

func ValidateSecret(value string) error {
	if !secretPattern.MatchString(value) {
		return fmt.Errorf("%w: secret must be 64 URL-safe characters", ErrInvalidInput)
	}

	return nil
}

func ValidateDestination(value string) error {
	parsed, err := url.ParseRequestURI(value)
	if err != nil || parsed.Host == "" || (parsed.Scheme != "http" && parsed.Scheme != "https") {
		return fmt.Errorf("%w: destination must be an absolute HTTP or HTTPS URL", ErrInvalidInput)
	}

	return nil
}
