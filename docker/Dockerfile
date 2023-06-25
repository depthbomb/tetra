FROM ubuntu:20.04

RUN apt update
RUN apt install -y software-properties-common
RUN add-apt-repository ppa:ondrej/php -y
RUN apt update

RUN apt install -y curl

RUN curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
RUN apt install -y nodejs

# Install PHP and required extensions
RUN apt install -y php8.2 php8.2-cli php8.2-fpm php8.2-intl php8.2-opcache php8.2-curl php8.2-fileinfo php8.2-gd \
    php8.2-mbstring php8.2-pgsql php8.2-xsl php8.2-pdo php8.2-zip
COPY ./docker/php.ini /etc/php/8.2/fpm/php.ini
RUN service php8.2-fpm start

# Install and configure Nginx
RUN apt install -y nginx
COPY ./docker/default.conf /etc/nginx/conf.d/default.conf

# Install yarn
RUN npm install -g corepack
RUN corepack enable && corepack prepare yarn@stable --activate

# Install Composer
RUN curl -sS https://getcomposer.org/installer | php -- --install-dir=/usr/local/bin --filename=composer

COPY .. /var/www/html
WORKDIR /var/www/html

ENV COMPOSER_ALLOW_SUPERUSER=1
RUN composer install --no-ansi --no-dev --no-interaction --no-plugins --no-progress --no-scripts --optimize-autoloader
RUN composer dump-autoload --no-dev --classmap-authoritative
RUN composer dump-env prod

RUN cd assets && yarn && yarn dist
RUN cd .. && rm -rf ./assets

RUN apt remove -y nodejs
RUN apt autoremove -y
