FROM node:22-alpine

WORKDIR /worker

RUN apk add --no-cache ffmpeg

COPY package*.json ./
RUN npm ci

COPY . .

CMD ["npm", "run", "worker:video"]
