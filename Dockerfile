FROM node:7-slim

ADD . /
RUN npm i -g yarn && yarn install --ignore-engines 
# && yarn build <- compilation still fails, will keep that commented until it doesn't throw an error

EXPOSE 5000

ENTRYPOINT ["yarn", "start"]

