FROM node:18 AS frontend-builder
WORKDIR /app
COPY package.json package.json
RUN npm i --force
COPY . .
RUN npm run build

FROM composer:2.5 as builder
WORKDIR /app
COPY . .
COPY .env.example .env
RUN composer install --no-dev --no-autoloader && composer dump-autoload
COPY --from=frontend-builder /app/public/assets public/assets

FROM php:8.2-fpm-alpine

RUN apk add libpq-dev && \
    docker-php-ext-install -j$(nproc) pdo_pgsql && \
    docker-php-ext-install -j$(nproc) pgsql

WORKDIR /app
COPY --from=builder /app /app
RUN chown -R www-data:www-data .

CMD php artisan view:cache && \
    php artisan config:cache && \
    php artisan route:cache && \
    php artisan event:cache && \
    php artisan optimize && \
    php-fpm
