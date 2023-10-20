FROM node:20-alpine

WORKDIR /usr/src/app

COPY . .
RUN yarn && yarn build

ENTRYPOINT node apps/server/dist/index.js
