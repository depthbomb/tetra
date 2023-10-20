FROM node:20-alpine

WORKDIR /usr/src/app

COPY . .
RUN yarn && yarn dist

ENTRYPOINT /bin/sh -c "cd apps/server && yarn migrate:p && cd ../.. && yarn start"
