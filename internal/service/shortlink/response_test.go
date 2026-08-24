package shortlink

import (
	"encoding/json"
	"strings"
	"testing"
)

func TestOptionalResponseValuesMarshalAsNull(t *testing.T) {
	t.Parallel()

	tests := []struct {
		name  string
		value any
		want  []string
	}{
		{
			name:  "public shortlink",
			value: Public{},
			want:  []string{`"expiresAt":null`},
		},
		{
			name:  "created shortlink",
			value: Created{},
			want:  []string{`"expiresAt":null`},
		},
		{
			name:  "admin shortlink",
			value: Admin{},
			want:  []string{`"expiresAt":null`, `"user":null`},
		},
	}

	for _, test := range tests {
		t.Run(test.name, func(t *testing.T) {
			encoded, err := json.Marshal(test.value)
			if err != nil {
				t.Fatalf("marshal response: %v", err)
			}

			body := string(encoded)
			for _, want := range test.want {
				if !strings.Contains(body, want) {
					t.Fatalf("response must contain %s; body=%s", want, body)
				}
			}
		})
	}
}
