FROM node

ADD . /app
WORKDIR /app

RUN yarn install --ignore-engines
RUN yarn build

EXPOSE 5000

CMD yarn start
