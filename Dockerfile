FROM node:8.9-slim

ADD . /app
WORKDIR /app

# This will also trigger the build process
RUN yarn install

ENV PORT=80
EXPOSE 80

CMD yarn start
