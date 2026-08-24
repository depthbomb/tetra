# syntax=docker/dockerfile:1.7

FROM oven/bun:1.4.0-alpine AS frontend
ARG GIT_COMMIT=INDEV
WORKDIR /src/frontend

COPY frontend/package.json frontend/bun.lock ./
RUN bun install --frozen-lockfile

COPY frontend/ ./
COPY api/openapi.json /src/api/openapi.json
RUN bun run generate-schema && GIT_COMMIT="$GIT_COMMIT" bun run build

FROM golang:1.27-alpine AS backend
WORKDIR /src

COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -trimpath -ldflags="-s -w" -o /out/tetra "./cmd"

FROM alpine:3.23 AS runtime
RUN apk add --no-cache ca-certificates tzdata \
    && addgroup -S tetra \
    && adduser -S -G tetra tetra

WORKDIR /app
COPY --from=backend /out/tetra /usr/local/bin/tetra
COPY --from=frontend /src/dist/frontend ./dist/frontend

ENV FRONTEND_DIR=/app/dist/frontend \
    PORT=3000

EXPOSE 3000
USER tetra:tetra

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD wget -q -O /dev/null http://127.0.0.1:3000/health || exit 1

ENTRYPOINT ["/usr/local/bin/tetra"]
CMD ["start"]
