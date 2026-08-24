package user

import (
	"crypto/sha256"
	"encoding/hex"
	"net/url"
	"strconv"
	"strings"
)

func gravatarURL(email string, size int) string {
	digest := sha256.Sum256([]byte(strings.ToLower(strings.TrimSpace(email))))
	query := url.Values{
		"d": {"identicon"},
		"r": {"pg"},
		"s": {strconv.Itoa(size)},
	}

	return "https://s.gravatar.com/avatar/" + hex.EncodeToString(digest[:]) + "?" + query.Encode()
}
