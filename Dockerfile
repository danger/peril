FROM node:8.9-slim

ADD . /app
WORKDIR /app

RUN yarn install
RUN yarn run build

ENV PORT=80
EXPOSE 80

CMD yarn start
