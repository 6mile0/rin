const { token, botName, ver, execSpace, execUserID, execGroupID } = require('./config.json');
const fs = require('node:fs');
var exec = require('child_process').exec;
const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
    intents: Object.values(GatewayIntentBits).reduce((a, b) => a | b)
});

const helptxt = fs.readFileSync('help.txt', 'utf-8'); // ヘルプテキスト読み込み
console.log(botName + " " + ver + " を起動します");

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

    if (msg.content === "!err") {
        msg.channel.send({ files: ['./img/errorCode.png'] });
    }

    if (msg.content.substring(0, 3) == "!py") { // !pで始まるメッセージのみ反応
        var message = msg.content.split('```'); // メッセージを```で分割 (Ex:[ '!py', 'print("helloWorld")', '', 'こんにちは', '' ])
        console.log(message.length);
        console.log(message)

        if (message.length <= 3) { // メッセージの要素数が2以下の場合は標準入力がないと判断
            var execCode = message[1].trim(); // メッセージの2番目の要素を実行内容とする
            try {
                fs.writeFileSync('/Containers/c1/run/main.py', execCode);
                fs.writeFileSync('/Containers/c1/run/input.txt', ""); // 標準入力ファイルを空にする
                console.log('OK: 実行ファイルを生成しました\n');
                console.log('OK: 標準入力ファイル初期化完了\n');
            } catch (e) {
                //エラー処理
                console.log(e);
                msg.reply("実行に失敗しました(E1001a)\nエラーの詳細は`!err`で確認できます。");
            }
        } else {
            var execCode = message[1].trim(); // メッセージの2番目の要素を実行内容とする
            var standardInput = message[3].trim(); // メッセージの4番目の要素を標準入力とする
            msg.channel.send("`標準入力を認識しました`");
            try {
                fs.writeFileSync('/Containers/c1/run/main.py', execCode);
                fs.writeFileSync('/Containers/c1/run/input.txt', standardInput);
                console.log('OK: 実行ファイルを生成しました\n');
                console.log('OK: 標準入力ファイルを生成しました\n');
            } catch (e) {
                //エラー処理
                console.log(e);
                msg.reply("実行に失敗しました(E1001b)\nエラーの詳細は`!err`で確認できます。");
            }
        }

        console.log("実行内容：\n=================\n" + execCode + "\n=================\n");

        try {
            exec(`docker run --name c1 --rm -u ${execUserID}:${execGroupID} -v /etc/group:/etc/group:ro -v /etc/passwd:/etc/passwd:ro -v ${execSpace}/Containers/c1/run:/run:ro rin/c1`, { timeout: 10000 }, function (error, stdout, stderr) {
                // シェル上でコマンドを実行できなかった場合のエラー処理
                if (error !== null) {
                    console.log('exec error: ' + error);
                    if (!stderr) {
                        msg.reply("既定の実行可能時間を超過しましたので実行を停止しました。リソース枯渇対策のため、高負荷のコード実行を制限しております。実行するコードをご確認ください。(E1003)\n詳細は`!err`で確認できます。");
                    } else {
                        msg.reply("実行に失敗しました。エラー文を確認してください。(E1004)" + "```" + stderr + "```\n");
                    }
                    return;
                }

                try { // 標準出力をファイルに出力
                    fs.writeFileSync('/Containers/c1/run/output.txt', stdout);
                } catch {
                    msg.reply("実行結果の出力に失敗しました。(E1002)\nエラーの詳細は`!err`で確認できます。");
                }

                if (stdout.length == 0) {
                    msg.reply("標準出力は空ですが、入力されたプログラムは正常に実行されました。\n");
                } else {
                    console.log('実行結果: \n=================\n' + stdout + '\n=================');
                    msg.reply("実行結果は以下です。ご確認ください。");
                    msg.channel.send({ files: ['/Containers/c1/run/output.txt'] })
                }
            });
        } catch (e) {
            //エラー処理
            console.log(e);
            msg.reply("重大なエラーが発生しました。エラーの詳細は`!err`で確認できます。");
        }
    }
});

client.login(token);