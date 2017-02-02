FROM node

ADD . /app
WORKDIR /app

RUN npm i -g yarn && \
	npm i -g typescript	&& \
	yarn install --ignore-engines 
RUN yarn build || true

EXPOSE 5000

CMD yarn start

