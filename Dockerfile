FROM node:20-alpine

WORKDIR /usr/src/app

COPY . .
RUN yarn && yarn build

ENTRYPOINT yarn start
