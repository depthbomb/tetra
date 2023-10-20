FROM node:20-alpine

WORKDIR /usr/src/app

COPY . .
RUN yarn && yarn dist

ENTRYPOINT yarn start
