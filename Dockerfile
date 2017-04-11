FROM node:6.10

RUN apt-get update -qq && apt-get install -y apt-transport-https

RUN curl -sS https://dl.yarnpkg.com/debian/pubkey.gpg | apt-key add - && \
  echo "deb https://dl.yarnpkg.com/debian/ stable main" | tee /etc/apt/sources.list.d/yarn.list

RUN apt-get update -qq && \
  apt-get install -y yarn && \
  rm -rf /var/lib/apt/lists/* /tmp/* /var/tmp/*

ADD . /app
WORKDIR /app

RUN yarn install
RUN yarn run build

ENV PORT=80
EXPOSE 80

CMD yarn start
