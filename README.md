# rin
任意のプログラム、コマンドの実行結果をDiscord経由で受け取れるBotです。  
ユーザから入力されたコマンドはすべて、Dockerコンテナ内で実行されます。  
自己責任でお使いください。

## 使い方
1. このリポジトリをクローンします。  
    (/home/$(whoami)/rinにクローンすることを推奨します)
2. `.env.example`ファイルをコピーして`.env`ファイルを作成します。
```bash
$ cp .env.example .env
```
3. コメントに従い、`.env`ファイルを編集します。
4. プログラム実行用のDockerイメージをビルドします。
```bash
$ sh build.sh pwd
```
5. Bot用のDockerイメージをビルドします。
```bash
$ docker build -t rin .
```
6. Botを起動します。
```bash
$ docker run --name rin --restart always -v /etc/group:/etc/group:ro -v /etc/passwd:/etc/passwd:ro -v /var/run/docker.sock:/var/run/docker.sock -v /home/$(whoami)/rin/Containers:/Containers -d rin
```
