// こうかとん22
// バージョンはGitHubのコミットを参照

// <注意> NGワードファイル(words.txt)はGitHubに上げないこと！(コミット前確認)

// ========================================================
// 環境設定
// ========================================================

const token = "MTAyMzQyMzI1NDI1NTM5MDc5Mw.G8jffM.oyR9ivejn3mD9ipXLaKc0ZrXe2P9S2TaNm3XmM"; // DiscordのBotのトークン(本番環境)
const botname = "Coder"; // Botの名前
const ver = "v1.5.0"; // 現在バージョン

// ========================================================

require('date-utils');
var fs = require("fs");
var exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
    intents: Object.values(GatewayIntentBits).reduce((a, b) => a | b)
});

console.log(botname + " " + ver + " を起動します");

client.once("ready", async () => {
    client.user.setPresence({ activities: [{ name: "Ver " + ver }] });
    console.log("準備完了");
});

var timerDataAry = [];

var disableLibraries = [
    "subprocess",
    "os",
    "sys",
    "shutil",
    "socket",
];

var flag = false;
var flagUserId = "";

function setTimer(time, ch) {
    var dt = new Date();
    var intervalID = setInterval(() => {
        var dtRenew = new Date();
        var formatted = dtRenew.toFormat("HH24:MI:SS");

        tt = time.split(":");
        ms = (tt[0] * 3600 + tt[1] * 60 + tt[2] * 1) * 1000;
        afterMs = dt.getTime() + ms;

        console.log("now_ms: " + dtRenew.getTime());
        console.log("after_ms: " + afterMs);
        console.log("now: " + formatted);
        client.channels.cache.get(ch).send("now_ms: " + dtRenew.getTime() + "\n after_ms: " + afterMs + "\n now: " + formatted);

        if (dtRenew.getTime() === afterMs) { // ミリ秒が一致したら
            client.channels.cache.get(ch).send("時間になりました！");
            setTimeout(() => {
                clearInterval(intervalID)
            })
        }
    }, 1000);
    return intervalID;
}

client.on("messageCreate", async (msg) => {
    if (msg.author.bot) { // bot同士の会話回避
        return;
    }

    if (flag == true && msg.author.id == flagUserId) {
        if (msg.content === "!setTimer") {
            ;
        } else if (msg.content === "!cancel") {
            msg.channel.send("> キャンセルしました");
            flag = !flag;
        } else if (msg.content.match(/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)) {
            msg.channel.send("> `" + msg.content + "`で設定しました");
            var setId = setTimer(msg.content, msg.channelId);
            timerDataAry.push({
                "id": msg.author.id,
                "name": msg.author.username,
                "intervalID": setId
            });

            flag = !flag;
        } else {
            msg.channel.send("> 不正なフォーマットです。例にしたがって正しいフォーマットで時間を入力してください。フォーマット例: `00:01:00`");
        }
    }


    if (msg.content === "!setTimer") {
        if (flag == true && msg.author.id == flagUserId) {
            msg.channel.send("> すでにあなたが設定中です。同時に設定することはできません");
        } else if (flag == true && msg.author.id != flagUserId) {
            msg.channel.send("> すでに別のユーザが設定中です。同時に設定することはできません");
        } else {
            msg.channel.send("> タイマーをセットします。セットする時間を指定してください。フォーマット例: `00:01:00`");
            flag = !flag; // 対話管理フラグ
            flagUserId = msg.author.id; // 対話管理ユーザーID
        }
    }

    if (msg.content === "!delTimer") {
        if (flag == true && msg.author.id == flagUserId) {
            msg.channel.send("> 設定されたタイマーを解除しました");
        } else {
            msg.channel.send("> タイマーをセットします。セットする時間を指定してください。フォーマット例: `00:01:00`");
            flag = !flag; // 対話管理フラグ
            flagUserId = msg.author.id; // 対話管理ユーザーID
        }
    }

    if (msg.content === "!help") {
        msg.reply('```【使い方】\n下記のフォーマットをコピーして<ここにコマンドを入力>を書き換えて使ってください。結果がリプライされます。標準ライブラリのみ使用可能(システムコールのものを除く)です。\n※外部ライブラリ，標準入力は使えません。```');
        msg.channel.send("``` ``py <ここにコマンドを入力> `` ```");
    }

    if (msg.content.substring(0, 2) == "!p") { // !pで始まるメッセージのみ反応
        const stdout = execSync("ls | grep -v -E 'index.js|node_modules|yarn.lock|package.json' | xargs rm -rf")

        if (!stdout) {
            msg.reply("例外処理が発生しました。ろくまいるにメンションしてください。");
        } else {
            console.log("> 実行ファイルおよびコアファイル以外の削除成功\n");
            console.log("実行内容：\n=================\n" + msg.content.substring(8).slice(0, -3) + "\n=================\n");
            if (msg.content.substring(3, 8) == "```py") {
                var output = msg.content.substring(8).slice(0, -3);

                if (disableLibraries.some(val => output.includes(val))) {
                    disableLibraries.forEach(function (val) {
                        if (output.includes(val)) {
                            msg.reply("`" + val + "`は使用することができません。詳細は`!help`を参照してください。\n");
                            console.log("> 使用不可ライブラリ検出\n");
                        }
                    });
                } else {
                    console.log("> 使用不可ライブラリなし\n");
                    try {
                        fs.writeFileSync('main.py', output);
                        console.log('> main.pyを作成しました\n');
                    } catch (e) {
                        //エラー処理
                        console.log(e);
                    }

                    exec("python3 main.py", { timeout: 2000 }, function (error, stdout, stderr) {
                        // シェル上でコマンドを実行できなかった場合のエラー処理
                        if (error !== null) {
                            console.log('exec error: ' + error);
                            if (!stderr) {
                                msg.reply("実行時間制限(2s)か，標準出力のバッファを超過したため，強制的にプロセスを終了しました。コードに問題ないか確認してください。\n`もしかして: [ 標準入力を使っていませんか？, 無限ループになっていませんか？ ]`");
                            } else {
                                msg.reply("実行に失敗しました。エラー文を確認してください。" + "```" + stderr + "```\n");
                            }
                            return;
                        }

                        // シェル上で実行したコマンドの標準出力が stdout に格納されている
                        msg.reply("実行結果：" + "```" + stdout + "```");
                        console.log('実行結果: \n=================\n' + stdout + '\n=================');
                    });
                }

            }
        }
    }
});

client.login(token);