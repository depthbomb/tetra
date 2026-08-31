package sse

import (
	"bufio"
	"context"
	"errors"
	"net/http"
	"net/http/httptest"
	"strings"
	"sync"
	"testing"
	"time"

	"github.com/labstack/echo/v5"
)

type serviceStub struct {
	mu     sync.Mutex
	counts []int
	err    error
}

func (s *serviceStub) Count(context.Context) (int, error) {
	s.mu.Lock()
	defer s.mu.Unlock()

	if s.err != nil {
		return 0, s.err
	}

	count := s.counts[0]
	if len(s.counts) > 1 {
		s.counts = s.counts[1:]
	}

	return count, nil
}

func TestStreamSendsInitialCount(t *testing.T) {
	server, _ := newTestServer(&serviceStub{counts: []int{7}})
	defer server.Close()

	response, err := http.Get(server.URL + "/sse")
	if err != nil {
		t.Fatalf("GET /sse: %v", err)
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusOK {
		t.Fatalf("status = %d, want 200", response.StatusCode)
	}
	if contentType := response.Header.Get(echo.HeaderContentType); contentType != "text/event-stream" {
		t.Fatalf("Content-Type = %q, want text/event-stream", contentType)
	}
	if cacheControl := response.Header.Get(echo.HeaderCacheControl); cacheControl != "no-cache" {
		t.Fatalf("Cache-Control = %q, want no-cache", cacheControl)
	}
	if buffering := response.Header.Get("X-Accel-Buffering"); buffering != "no" {
		t.Fatalf("X-Accel-Buffering = %q, want no", buffering)
	}

	event := readEvent(t, bufio.NewScanner(response.Body))
	if event != "event: shortlink-count\ndata: {\"count\":7}" {
		t.Fatalf("event = %q", event)
	}
}

func TestStreamSendsChangedCountOnly(t *testing.T) {
	service := &serviceStub{counts: []int{2, 2, 3}}
	server, _ := newTestServer(service)
	defer server.Close()

	response, err := http.Get(server.URL + "/sse")
	if err != nil {
		t.Fatalf("GET /sse: %v", err)
	}
	defer response.Body.Close()

	scanner := bufio.NewScanner(response.Body)
	initial := readEvent(t, scanner)
	if initial != "event: shortlink-count\ndata: {\"count\":2}" {
		t.Fatalf("initial event = %q", initial)
	}

	updated := readEvent(t, scanner)
	if updated != "event: shortlink-count\ndata: {\"count\":3}" {
		t.Fatalf("updated event = %q", updated)
	}
}

func TestStreamStopsWhenClientDisconnects(t *testing.T) {
	server, done := newTestServer(&serviceStub{counts: []int{1}})
	defer server.Close()

	response, err := http.Get(server.URL + "/sse")
	if err != nil {
		t.Fatalf("GET /sse: %v", err)
	}

	readEvent(t, bufio.NewScanner(response.Body))
	if err := response.Body.Close(); err != nil {
		t.Fatalf("close response: %v", err)
	}

	select {
	case <-done:
	case <-time.After(time.Second):
		t.Fatal("stream did not stop after the client disconnected")
	}
}

func TestStreamReturnsErrorBeforeCommittingResponse(t *testing.T) {
	server, _ := newTestServer(&serviceStub{err: errors.New("database unavailable")})
	defer server.Close()

	response, err := http.Get(server.URL + "/sse")
	if err != nil {
		t.Fatalf("GET /sse: %v", err)
	}
	defer response.Body.Close()

	if response.StatusCode != http.StatusInternalServerError {
		t.Fatalf("status = %d, want 500", response.StatusCode)
	}
	if contentType := response.Header.Get(echo.HeaderContentType); strings.HasPrefix(contentType, "text/event-stream") {
		t.Fatalf("Content-Type = %q, must not commit an event stream", contentType)
	}
}

func newTestServer(service Service) (*httptest.Server, <-chan struct{}) {
	handler := New(service)
	handler.pollInterval = 5 * time.Millisecond
	handler.heartbeatInterval = time.Hour
	done := make(chan struct{})

	e := echo.New()
	e.GET("/sse", func(c *echo.Context) error {
		defer close(done)

		return handler.Stream(c)
	})

	return httptest.NewServer(e), done
}

func readEvent(t *testing.T, scanner *bufio.Scanner) string {
	t.Helper()

	lines := make([]string, 0, 2)
	for scanner.Scan() {
		if scanner.Text() == "" {
			return strings.Join(lines, "\n")
		}

		lines = append(lines, scanner.Text())
	}
	if err := scanner.Err(); err != nil {
		t.Fatalf("read event stream: %v", err)
	}

	t.Fatal("event stream ended before a complete event")
	return ""
}
