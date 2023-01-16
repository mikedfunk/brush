FROM node:latest
WORKDIR /data/brush/current

COPY package*.json ./
COPY pnpm-lock.yaml ./
RUN npm install -g pnpm
RUN pnpm install --frozen-lockfile
# COPY . .

EXPOSE 8010

CMD [ "npm", "run", "debug" ]
