FROM node:20-slim

WORKDIR app

COPY package*.json ./

RUN npm install

COPY ./src ./src

COPY .env .env

CMD [ "npm", "run", "dev" ]
