FROM node:latest
WORKDIR /data/canvas/current

COPY package*.json ./
RUN npm install
COPY . .

EXPOSE 8010

CMD [ "npm", "run", "debug" ]
