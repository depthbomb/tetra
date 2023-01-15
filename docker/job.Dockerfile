FROM composer:2.5 as builder
WORKDIR /app
COPY . .
COPY .env.example .env
RUN composer install --no-dev --no-autoloader && composer dump-autoload

FROM php:8.2-alpine

RUN apk add libpq-dev && \
    docker-php-ext-install -j$(nproc) pdo_pgsql && \
    docker-php-ext-install -j$(nproc) pgsql

WORKDIR /app
COPY --from=builder /app /app
