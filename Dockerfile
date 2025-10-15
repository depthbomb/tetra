FROM node:20-alpine

WORKDIR /usr/src/app

RUN apk add --no-cache openssl

COPY . .
RUN --mount=type=cache,target=/root/.yarn \
    --mount=type=cache,target=/root/.cache \
    yarn && yarn dist

ENTRYPOINT /bin/sh -c "cd packages/server && yarn migrate:p && cd ../.. && yarn start"
