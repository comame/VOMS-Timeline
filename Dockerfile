FROM node:alpine

WORKDIR /home/node/app

COPY package.json package.json
COPY package-lock.json package-lock.json
RUN npm i

COPY ./ ./

RUN npm run build

CMD node dist/server/app.js
