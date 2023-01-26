FROM node:18-slim

# Node.js, Yarnのインストール
RUN apt-get update && apt-get upgrade

# BOTをコンテナ内にコピー
WORKDIR /app
COPY /app ./
RUN yarn install