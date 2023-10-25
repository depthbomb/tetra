FROM node:20-alpine

WORKDIR /usr/src/app

COPY . .
RUN --mount=type=cache,target=/root/.yarn \
    --mount=type=cache,target=/root/.cache \
    yarn && yarn generate-client && yarn dist

ENTRYPOINT /bin/sh -c "cd packages/server && yarn migrate:p && cd ../.. && yarn start"
