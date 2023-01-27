// ========================================================
// 環境設定
// ========================================================

// const token = "MTAyODIwMDM3NjI3ODcyMDU3Mw.GTWcpV.ibkBATvN72XabdZfvRIjC694Eu3oX0dq2ytsvI"; // DiscordのBotのトークン(本番環境)
const token = "MTAyNzE2NDc0ODYyMzY1MDg0Ng.GFEUaU.FjTQl7mVb9k7WPLMNEw82FvvpXswo-gRx6XdEw"
const botname = "rin"; // Botの名前
const ver = "v1.1.3"; // 現在バージョン

// ========================================================

require('date-utils');
const fs = require('node:fs');
const path = require('node:path');
var exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const { Client, GatewayIntentBits, EmbedBuilder, Collection } = require("discord.js");
const client = new Client({
    intents: Object.values(GatewayIntentBits).reduce((a, b) => a | b)
});


const helptxt = fs.readFileSync('help.txt', 'utf-8'); // ヘルプテキスト読み込み

console.log(botname + " " + ver + " を起動します");

client.once("ready", async () => {
    client.user.setPresence({ activities: [{ name: "Ver " + ver }] });
    console.log("準備完了");
});


client.on("messageCreate", async (msg) => {
    if (msg.author.bot) { // bot同士の会話回避
        return;
    }

    if (msg.content == "!msgTest") {
        msg.reply(msg.member.nickname + "さんのメッセージを受け取りました");
    }

    if (msg.content === "!help") {
        msg.reply(helptxt);
    }

    if (msg.content.substring(0, 3) == "!py") { // !pで始まるメッセージのみ反応
        var output = msg.content.substring(7).slice(0, -3);
        console.log("実行内容：\n=================\n" + output + "\n=================\n");
        try {
            fs.writeFileSync('./Containers/c1/run/main.py', output);
            console.log('> main.pyを作成しました\n');
        } catch (e) {
            //エラー処理
            console.log(e);
        }

        try {
            exec("docker run --name c1 --rm -u $(id -u):$(id -g) -v /etc/group:/etc/group:ro -v /etc/passwd:/etc/passwd:ro -v /app/Containers/c1/run:/run:ro c1:latest > /app/Containers/c1/run/output.txt 2>&1", { timeout: 300000 }, function (error, stdout, stderr) {
                // シェル上でコマンドを実行できなかった場合のエラー処理
                if (error !== null) {
                    console.log('exec error: ' + error);
                    if (!stderr) {
                        msg.reply("実行時間制限(30s)か，標準出力のバッファを超過したため，強制的にプロセスを終了しました。コードに問題ないか確認してください。\n`もしかして: [ 標準入力を使っていませんか？, 無限ループになっていませんか？ ]`");
                    } else {
                        msg.reply("実行に失敗しました。エラー文を確認してください。" + "```" + stderr + "```\n");
                    }
                    return;
                }

                var text = fs.readFileSync("./Containers/c1/run/output.txt", 'utf8');
                var lines = text.toString().split('¥n');
                for (var line of lines) {
                    console.log(line)
                }

                // // シェル上で実行したコマンドの標準出力が stdout に格納されている
                // if (stdout.length > 2000) {
                //     msg.reply("標準出力が2000文字を超過したため，省略して表示します．\n実行結果：```" + omitedText(stdout) + "```\n");
                // } else if (stdout.length == 0) {
                //     msg.reply("標準出力は空ですが，入力されたプログラムは正常に実行されました．\n");
                // } else {
                //     msg.reply("実行結果：" + "```" + omitedText(stdout) + "```");
                //     console.log('実行結果: \n=================\n' + stdout + '\n=================');
                // }
            });
        } catch (e) {
            //エラー処理
            console.log(e);
        }
    }
});

client.login(token);