FROM node:18 AS frontend-builder
WORKDIR /app
COPY package.json package.json
RUN npm i --force
COPY . .
RUN npm run build

FROM nginx
COPY public /var/www/html
COPY --from=frontend-builder /app/public/assets /var/www/html/assets
COPY docker/nginx.conf /etc/nginx/conf.d/default.conf
