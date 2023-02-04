FROM node:18

WORKDIR /root/app
COPY . .

RUN yarn && yarn dist

CMD yarn start
