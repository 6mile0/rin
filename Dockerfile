FROM ubuntu:20.04

# Configuring tzdata問題回避
ENV TZ=Asia/Tokyo
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Pyhton3のインストール
RUN apt-get update && apt-get install -y python3 python3-pip
RUN pip3 install --upgrade pip

# Node.js, Yarnのインストール
RUN apt-get install -y curl
RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - &&\
    apt-get install -y nodejs
RUN npm update -g npm
RUN npm install -g yarn

# BOTをコンテナ内にコピー
WORKDIR /app
COPY ./ ./
RUN yarn install

CMD ["node", "index.js"]