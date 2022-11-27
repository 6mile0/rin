// ========================================================
// 環境設定
// ========================================================

const token = "MTAyODIwMDM3NjI3ODcyMDU3Mw.GTWcpV.ibkBATvN72XabdZfvRIjC694Eu3oX0dq2ytsvI"; // DiscordのBotのトークン(本番環境)
const botname = "rin"; // Botの名前
const ver = "v1.1.3"; // 現在バージョン

// ========================================================

require('date-utils');
var fs = require("fs");
var exec = require('child_process').exec;
const execSync = require('child_process').execSync;
const { Client, GatewayIntentBits, EmbedBuilder } = require("discord.js");
const client = new Client({
    intents: Object.values(GatewayIntentBits).reduce((a, b) => a | b)
});

const helptxt = fs.readFileSync('help.txt', 'utf-8'); // ヘルプテキスト読み込み

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

var timePreset = [
    { name: "1分", time: "00:01:00" },
    { name: "2分", time: "00:02:00" },
    { name: "3分", time: "00:03:00" },
    { name: "10分", time: "00:10:00" },
    { name: "15分", time: "00:15:00" },
    { name: "20分", time: "00:20:00" },
    { name: "30分", time: "00:30:00" },
    { name: "60分", time: "00:60:00" },
];

var flag = false;
var flagUserId = "";
var flagUserName = "";
var flagNum = 0;

var delflag = false;
var delflagUserId = "";

function omitedText(text) {
    const omitMax = 1700;
    if (text.length > omitMax) {
        return text.substring(0, omitMax) + "...";
    } else {
        return text;
    }
}


// タイマー削除関数
function delLists(name) {
    timerDataAry.forEach((value, index) => {
        if (value.timerName == name) {
            timerDataAry.splice(index, 1);
        }
    });
}

// 時間セット関数
function setTime(name, time, ch, userId) {
    var now = new Date(); // 現在時刻
    var tt = time.split(":"); // 時間をコロンで分割
    var ms = (tt[0] * 3600 + tt[1] * 60 + tt[2] * 1) * 1000; // 時間をミリ秒に変換
    var afterMs = now.getTime() + ms; // 現在時刻にミリ秒を足す

    var intervalID = setInterval(() => {
        var dt = new Date(); // 時間カウンタ(一秒毎最新時刻取得)
        if (dt.getTime() >= afterMs) { // ミリ秒一致時
            client.channels.cache.get(ch).send(`<@${userId}>`);
            const timerEmbed = new EmbedBuilder()
                .setColor("#ED4245")
                .setTitle('時間になりました')
                .setDescription(`下記の内容のタイマーが終了しました`)
                .addFields(
                    { name: '名称', value: name },
                )
                .setTimestamp()
            client.channels.cache.get(ch).send({ embeds: [timerEmbed] });
            setTimeout(() => {
                clearInterval(intervalID)
                delLists(name); // タイマー削除
            })
        }
    }, 1000);

    return [intervalID, afterMs]; // intervalIdを返す
}

function convertNowTime(time) { // 保存されているミリ秒を現在時刻に変換
    var now = new Date(); // 現在時刻
    var ms = (time - now.getTime()); // 差分取得

    console.log(ms);

    const sec = Math.floor(ms / 1000) % 60;
    const min = Math.floor(ms / 1000 / 60) % 60;
    const hours = Math.floor(ms / 1000 / 60 / 60) % 24;

    return `${hours.toString().padStart(2, '0')}:${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
}

function padZero(num) {
    return num.toString().padStart(2, '0');
}

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

    if (flag == true && msg.author.id == flagUserId) {
        if (flagNum >= 4) {
            msg.reply("> 4回以上正常なレスポンスを受け取れなかったため，登録をキャンセルします");
            flag = !flag;
            flagNum = 0;
            return;
        } else {
            if (msg.content === "!timerSet") {
                ;
            } else if (msg.content === "!cancel") {
                msg.channel.send("> 登録をキャンセルしました");
                flag = !flag; // フラグを戻す
                flagUserId = ""; // 初期化
            } else if (msg.content.match(/[^\s]+/g)) { // 空白区切りになっているか
                var data = msg.content.split(/\s/);
                console.log(data);
                if (data.length == 2) {
                    if (data[0].length > 500) {
                        msg.channel.send("> タイマー名は400文字以内にしてください");
                        return;
                    } else {
                        if (data[1].match(/^([01][0-9]|2[0-3]):[0-5][0-9]:[0-5][0-9]$/)) {

                            var date = new Date(); // 現在時刻
                            var t = time.split(":"); // 時間をコロンで分割

                            date.setHours(date.getHours() + Number(t[0]));
                            date.setMinutes(date.getMinutes() + Number(t[1]));
                            date.setSeconds(date.getSeconds() + Number(t[2]));

                            const timerEmbed = new EmbedBuilder()
                                .setColor(0x0099FF)
                                .setTitle('タイマーセット完了')
                                .setDescription(`下記の内容でタイマーをセットしました`)
                                .addFields(
                                    { name: '名称', value: data[0] },
                                    { name: '時間', value: data[1] },
                                    { name: 'タイムアップ', value: `${date.getFullYear()}年 ${padZero(date.getMonth() + 1)}月 ${padZero(date.getDate())}日 ${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}` },
                                )
                                .setTimestamp()
                            msg.channel.send({ embeds: [timerEmbed] });

                            var [setId, ms] = setTime(data[0], data[1], msg.channelId, msg.author.id); // タイマー設定
                            console.log(ms);

                            timerDataAry.push({ // タイマーリストに追加
                                "id": msg.author.id,
                                "userName": msg.author.username,
                                "nickName": msg.member.nickname,
                                "timerName": data[0] + "[既定のプリセット]",
                                "time": time,
                                "intervalID": setId,
                                "ms": ms,
                            });
                            flag = !flag;
                        } else {
                            msg.channel.send("> 不正なフォーマットです。例に従い，再度入力してください。\nフォーマット例: `<タイマー名称> 00:01:00`");
                            flagNum++;
                        }
                    }
                } else {
                    if (!(timePreset.findIndex(({ name }) => name === data[0]) == -1)) { // プリセットが存在するか
                        msg.channel.send("> プリセットが指定されました");
                        var time = timePreset[timePreset.findIndex(({ name }) => name === data[0])]["time"]; // プリセットの時間を取得
                        var [setId, ms] = setTime(data[0] + "[既定のプリセット]", time, msg.channelId, msg.author.id); // タイマー設定

                        timerDataAry.push({ // タイマーリストに追加
                            "id": msg.author.id,
                            "userName": msg.author.username,
                            "nickName": msg.member.nickname,
                            "timerName": data[0] + "[既定のプリセット]",
                            "time": time,
                            "intervalID": setId,
                            "ms": ms,
                        });

                        var date = new Date(); // 現在時刻
                        var t = time.split(":"); // 時間をコロンで分割

                        date.setHours(date.getHours() + Number(t[0]));
                        date.setMinutes(date.getMinutes() + Number(t[1]));
                        date.setSeconds(date.getSeconds() + Number(t[2]));

                        const timerEmbed = new EmbedBuilder()
                            .setColor(0x0099FF)
                            .setTitle('タイマーセット完了')
                            .setDescription(`下記の内容でタイマーをセットしました`)
                            .addFields(
                                { name: '名称', value: data[0] + "[既定のプリセット]" },
                                { name: '時間', value: time },
                                { name: 'タイムアップ', value: `${date.getFullYear()}年 ${padZero(date.getMonth() + 1)}月 ${padZero(date.getDate())}日 ${padZero(date.getHours())}:${padZero(date.getMinutes())}:${padZero(date.getSeconds())}` },
                            )
                            .setTimestamp()
                        msg.channel.send({ embeds: [timerEmbed] });

                        flag = !flag;
                    } else {
                        msg.channel.send("> プリセットが存在しないか，不正なフォーマットです。例に従い，再度入力してください。\nフォーマット例: `<タイマー名称> 00:01:00`");
                        flagNum++;
                    }
                }
            } else {
                msg.channel.send("> 不正なフォーマットです。例に従い，正しいフォーマットで時間を入力してください。\nフォーマット例: `<タイマー名称> 00:01:00`");
                flagNum++;
            }
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
                const timerEmbed = new EmbedBuilder()
                    .setColor(0x0099FF)
                    .setTitle('タイマーを解除しました')
                    .setDescription(`下記の内容のタイマーを解除しました`)
                    .addFields(
                        { name: '名称', value: timerDataAry[num].timerName },
                        { name: '時間', value: timerDataAry[num].time },
                    )
                    .setTimestamp()
                msg.channel.send({ embeds: [timerEmbed] });
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
        console.log(timerDataAry);
        if (timerDataAry.length == 0) {
            msg.channel.send("> 現在設定されているタイマーはありません。");
        } else {
            timerDataAry.forEach(function (element, index) {
                var time = convertNowTime(element["ms"]);
                console.log(time);
                if (element["nickName"] == null) {
                    const timerListsEmbed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle('タイマー' + (index + 1))
                        .setDescription(`現在設定されている${index + 1} / ${timerDataAry.length}つ目のタイマーです。`)
                        .addFields(
                            { name: '名称', value: element["timerName"] },
                            { name: '時間', value: element["time"] },
                            { name: '残り', value: time },
                            { name: '設定者', value: element["userName"] + "さん" },
                        )
                        .setTimestamp()
                    msg.channel.send({ embeds: [timerListsEmbed] });
                } else {
                    const timerListsEmbed = new EmbedBuilder()
                        .setColor(0x0099FF)
                        .setTitle('タイマー' + (index + 1))
                        .setDescription(`現在設定されている${index + 1} / ${timerDataAry.length}つ目のタイマーです。`)
                        .addFields(
                            { name: '名称', value: element["timerName"] },
                            { name: '時間', value: element["time"] },
                            { name: '残り', value: time },
                            { name: '設定者', value: element["userName"] + "(" + element["nickName"] + ")" + "さん" },
                        )
                        .setTimestamp()
                    msg.channel.send({ embeds: [timerListsEmbed] });
                }
            });
        }
    }


    if (msg.content.substring(0, 3) == "!py") { // !pで始まるメッセージのみ反応
        const stdout = execSync("ls | grep -v -E 'index.js|node_modules|yarn.lock|package.json|help.txt|Dockerfile' | xargs rm -rf")

        if (!stdout) {
            msg.reply("例外処理が発生しました。ろくまいるにメンションしてください。");
        } else {
            console.log("> 実行ファイルおよびコアファイル以外の削除成功\n");
            var output = msg.content.substring(7).slice(0, -3);
            console.log("実行内容：\n=================\n" + output + "\n=================\n");
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
                            msg.reply("実行に失敗しました。エラー文を確認してください。" + "```" + omitedText(stderr) + "```\n");
                        }
                        return;
                    }

                    // シェル上で実行したコマンドの標準出力が stdout に格納されている
                    if (stdout.length > 2000) {
                        msg.reply("標準出力が2000文字を超過したため，省略して表示します．\n実行結果：```" + omitedText(stdout) + "```\n");
                    } else if (stdout.length == 0) {
                        msg.reply("標準出力は空ですが，入力されたプログラムは正常に実行されました．\n");
                    } else {
                        msg.reply("実行結果：" + "```" + omitedText(stdout) + "```");
                        console.log('実行結果: \n=================\n' + stdout + '\n=================');
                    }
                });

            }
        }
    }
});

client.login(token);