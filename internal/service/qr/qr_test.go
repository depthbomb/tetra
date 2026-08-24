package qr

import (
	"bytes"
	"encoding/xml"
	"testing"
)

func TestCreateReturnsSVG(t *testing.T) {
	t.Parallel()

	result, err := New().Create("https://go.example/go/docs")
	if err != nil {
		t.Fatalf("Create: %v", err)
	}
	if !bytes.Contains(result, []byte("<svg")) {
		t.Fatalf("result does not contain an SVG element: %q", result)
	}

	var document struct {
		XMLName xml.Name
	}
	if err := xml.Unmarshal(result, &document); err != nil {
		t.Fatalf("result is not valid XML: %v", err)
	}
	if document.XMLName.Local != "svg" {
		t.Fatalf("root element = %q, want %q", document.XMLName.Local, "svg")
	}
}
