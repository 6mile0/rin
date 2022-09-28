// こうかとん22
// バージョンはGitHubのコミットを参照

// <注意> NGワードファイル(words.txt)はGitHubに上げないこと！(コミット前確認)

// ========================================================
// 環境設定
// ========================================================

const token = "MTAyMzQyMzI1NDI1NTM5MDc5Mw.G8jffM.oyR9ivejn3mD9ipXLaKc0ZrXe2P9S2TaNm3XmM"; // DiscordのBotのトークン(本番環境)
const botname = "Coder"; // Botの名前
const ver = "v1.0.0"; // 現在バージョン

// ========================================================

require('date-utils');
var fs = require("fs");
var exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
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
var flagUserName = "";

var delflag = false;
var delflagUserId = "";

function setTimer(name, time, ch, userId) {
    var intervalID = setInterval(() => {
        var dt = new Date();
        if (dt.getTime() >= time) { // ミリ秒が一致したら
            client.channels.cache.get(ch).send(`<@${userId}>` + "\n設定した`" + name + "`の時間になりました！");
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
        if (msg.content === "!timerSet") {
            ;
        } else if (msg.content === "!cancel") {
            msg.channel.send("> 登録をキャンセルしました");
            flag = !flag; // フラグを戻す
            flagUserId = ""; // 初期化
        } else if (msg.content.match(/[^\s]+/g)) { // 空白区切りになっているか
            var data = msg.content.split(" ");
            console.log(data);
            if (data.length == 2) {
                if (data[0].length > 500) {
                    msg.channel.send("> タイマー名は500文字以内にしてください");
                    return;
                } else {
                    if (data[1].match(/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)) {
                        msg.channel.send("> タイマーを設定しました。" + "名称: " + data[0] + "\n時間: " + data[1]);

                        var dt = new Date();
                        tt = data[1].split(":");
                        ms = (tt[0] * 3600 + tt[1] * 60 + tt[2] * 1) * 1000; // 時間をミリ秒に変換
                        afterMs = dt.getTime() + ms; // 現在時刻にミリ秒を足す

                        var setId = setTimer(data[0], afterMs, msg.channelId, msg.author.id);
                        timerDataAry.push({
                            "id": msg.author.id,
                            "userName": msg.author.username,
                            "timerName": data[0],
                            "time": data[1],
                            "intervalID": setId,
                        });
                        flag = !flag;
                    } else {
                        msg.channel.send("> 不正なフォーマットです。例に従い，再度入力してください。\nフォーマット例: `<タイマー名称> 00:01:00`");
                    }
                }
            } else {
                msg.channel.send("> 不正なフォーマットです。例に従い，再度入力してください。\nフォーマット例: `<タイマー名称> 00:01:00`");
            }
        } else {
            msg.channel.send("> 不正なフォーマットです。例に従い，正しいフォーマットで時間を入力してください。\nフォーマット例: `<タイマー名称> 00:01:00`");
        }
    }

    if (delflag == true && msg.author.id == delflagUserId) {
        if (msg.content === "!timerDel") {
            ;
        } else if (msg.content === "!cancel") {
            msg.channel.send("> 解除をキャンセルしました");
            flag = !flag;
        } else if (msg.content.match(/^[0-9]+$/)) {
            if (msg.content == 0) {
                msg.channel.send("> 不正な数値です。1以上の自然数で指定してください");
                return;
            } else if (msg.content > timerDataAry.length) {
                msg.channel.send("> 不正な数値です。存在しない番号です。");
                return;
            } else {
                var num = msg.content - 1;
                msg.channel.send("> タイマーを解除しました。" + "名称: " + timerDataAry[num].timerName + "\n時間: " + timerDataAry[num].time);
                clearInterval(timerDataAry[num].intervalID);
                timerDataAry.splice(num, 1);
                delflag = !delflag; // フラグを戻す
                delflagUserId = ""; // 初期化
            }
        } else {
            msg.channel.send("> 不正な数値です。1以上の自然数で削除するタイマーを指定してください");
        }
    }


    if (msg.content === "!timerSet") {
        if (flag == true && msg.author.id == flagUserId) {
            msg.channel.send("> すでにあなたが設定中です。同時に設定することはできません。");
        } else if (flag == true && msg.author.id != flagUserId) {
            msg.channel.send(`> すでに${flagUserName}さんが設定中です。同時に設定することはできません。`);
        } else {
            msg.channel.send("> タイマーをセットします。セットする時間を指定してください。フォーマット例: `<タイマー名称> 00:01:00`");
            flag = !flag; // 対話管理フラグ
            flagUserId = msg.author.id; // 対話管理ユーザーID
            flagUserName = msg.author.username; // 対話管理ユーザー名
        }
    }

    if (msg.content === "!timerDel") {
        msg.channel.send("> 削除するタイマー番号を入力してください。※設定者のみ削除可能");
        delflag = !delflag; // 対話管理削除フラグ
        delflagUserId = msg.author.id;  // 対話管理削除ユーザーID
    }

    if (msg.content === "!timerLists") {
        if (timerDataAry.length == 0) {
            msg.channel.send("> 現在設定されているタイマーはありません。");
        } else {
            timerDataAry.forEach(function (element, index) {
                const timerListsEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('タイマー' + (index + 1))
                    .setDescription(`現在設定されている${index + 1} / ${timerDataAry.length}つ目のタイマーです。`)
                    .addFields(
                        { name: '名称', value: element["timerName"] },
                        { name: '時間', value: element["time"] },
                        { name: '設定者', value: element["userName"] },
                    )
                    .setTimestamp()
                msg.channel.send({ embeds: [timerListsEmbed] });
            });
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