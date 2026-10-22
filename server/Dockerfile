# syntax=docker/dockerfile:1
FROM node:22.23.4-alpine

WORKDIR /app

COPY package*.json ./

RUN --mount=type=cache,target=/root/.npm npm ci --no-fund

COPY . .

EXPOSE 5000

CMD ["npm", "start"]
