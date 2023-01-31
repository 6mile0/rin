const { token, botName, ver, execSpace, execUserID, execGroupID } = require('./config.json');
const { exec, execSync } = require('child_process');
const fs = require('node:fs');
const { Client, GatewayIntentBits } = require("discord.js");
const client = new Client({
    intents: Object.values(GatewayIntentBits).reduce((a, b) => a | b)
});

const helptxt = fs.readFileSync('help.txt', 'utf-8'); // ヘルプテキスト読み込み
console.log(botName + " " + ver + " を起動します"); // 起動メッセージ

const errorMsg = (msg, block, err) => {
    // エラーメッセージ生成関数 ([0]エラーコード, [1]ブロックid, [2]エラーObj)
    if (block == 0) {
        if (err[0] == 1) { // 実行内容が空の場合
            msg.reply("[E1000] 実行するコードが入力されていません。詳細は`!err`を参照してください。");
            return;
        } else if (err[0] == 2) { // ファイル作成に失敗した場合(標準入力なしパターン)
            msg.reply("[E1001a] 実行ファイルの作成に失敗しました。詳細は`!err`を参照してください。");
            return;
        } else if (err[0] == 3) { // ファイル作成に失敗した場合(標準入力ありパターン)
            msg.reply("[E1001b] 実行ファイルまたは標準入力ファイルの作成に失敗しました。詳細は`!err`を参照してください。");
            return;
        } else {
            msg.reply("[Undefined] 想定外のエラーが発生しました。詳細は`!err`を参照してください。");
            return;
        }

    } else if (block == 1) {
        if (err[0] == 2) {
            msg.reply("[E1002] 実行結果の出力に失敗しました。詳細は`!err`を参照してください。");
            return;
        } else if (err[0] == 3) {
            msg.reply("[E1003] 入力されたプログラムの実行に失敗しましたが、標準エラー出力が空です。再度お試しください。");
            return;
        } else if (err[0] == 4) {
            msg.reply("[E1004] 構文エラーまたは既定(10s)の実行可能時間を超過したため、実行に失敗しました。エラー文を確認してください。");
            msg.channel.send({ files: [err[2]] });
        } else {
            msg.reply("[Undefined] 想定外のエラーが発生しました。詳細は`!err`を参照してください。");
            return;
        }
    }
}

const finishExec = (containerName) => {
    // 実行終了処理
    return new Promise((resolve, reject) => {
        try {
            const stdout = execSync(`docker ps -q -f ancestor=${containerName}`);
            if (stdout.toString().trim() == "") { // 空文字列の場合
                resolve([0]); // コンテナが存在しない
            } else {
                try {
                    var result = execSync(`docker kill ${stdout.toString().trim()}`);
                    if (result.toString() == stdout.toString()) {
                        resolve([0]); // コンテナ削除成功
                    } else {
                        reject([1, "原因不明"]); // コンテナ削除失敗
                    }
                } catch (e) {
                    reject([1, e]); // 例外1
                }
            }
        } catch (e) {
            reject([1, e]); // 例外2
        }
    });
}

const makeFiles = (code, execFile, containerName) => {
    // ファイル生成関数 ([0]実行ファイル, [1]標準入力, [2]コンテナ名)
    return new Promise((resolve, reject) => {
        if (code.length == 1) {
            reject([1, "実行内容がありません"]); // E1001a
        }
        if (code.length <= 3) {
            // メッセージの要素数が2以下の場合は標準入力がないと判断
            var execCode = code[1].trim(); // メッセージの2番目の要素を実行内容とする
            try {
                fs.writeFileSync(`/Containers/${containerName}/run/${execFile}`, execCode);
                fs.writeFileSync(`/Containers/${containerName}/run/input.txt`, ""); // 標準入力ファイルを空にする
                resolve([0, execCode]); // 作成成功，コンソール確認用で実行内容を返す
            } catch (e) {
                //エラー処理
                reject([2, e]); // E1001a
            }
        } else {
            var execCode = code[1].trim(); // メッセージの2番目の要素を実行内容とする
            var standardInput = code[3].trim(); // メッセージの4番目の要素を標準入力とする
            try {
                fs.writeFileSync(`/Containers/${containerName}/run/${execFile}`, execCode);
                fs.writeFileSync(`/Containers/${containerName}/run/input.txt`, standardInput);
                resolve([0, execCode]); // 作成成功，コンソール確認用で実行内容を返す
            } catch (e) {
                //エラー処理
                reject([3, e]); // E1001a
            }
        }
    })
};

const execCommand = (containerName) => {
    return new Promise((resolve, reject) => { // コマンド実行
        try {
            if (containerName == "c1") { // Pythonの場合
                exec(`docker run --name ${containerName} --rm -u ${execUserID}:${execGroupID} -v /etc/group:/etc/group:ro -v /etc/passwd:/etc/passwd:ro -v ${execSpace}/Containers/${containerName}/run:/run:ro rin/${containerName}`, { timeout: 10000 },
                    function (error, stdout, stderr) {
                        // シェル上でコマンドを実行できなかった場合のエラー処理
                        if (error !== null) {
                            if (!stderr) {
                                reject([3, error]); // E1003
                            } else {
                                try {
                                    fs.writeFile(`/Containers/${containerName}/run/output.txt`, stderr, er => { if (er) throw er });
                                } catch {
                                    reject([2, er]); // E1002
                                }
                                reject([4, stderr, `/Containers/${containerName}/run/output.txt`]); // E1004
                            }
                        }

                        try {
                            // 標準出力をファイルに出力
                            fs.writeFile(`/Containers/${containerName}/run/output.txt`, stdout, er => { if (er) throw er });
                        } catch {
                            reject([2, er]); // E1002
                        }

                        if (stdout.length == 0) {
                            // 標準出力が空の場合
                            resolve([0, "", `/Containers/${containerName}/run/output.txt`]); // 実行結果返却
                        } else {
                            resolve([0, stdout, `/Containers/${containerName}/run/output.txt`]);  // 実行結果返却
                        }
                    });
            } else if (containerName == "c2") { // Cの場合
                exec(`docker run --name ${containerName} --rm -u ${execUserID}:${execGroupID} -v /etc/group:/etc/group:ro -v /etc/passwd:/etc/passwd:ro -v ${execSpace}/Containers/${containerName}/run:/run:ro -v ${execSpace}/Containers/${containerName}/run/main.out:/run/main.out rin/${containerName}`, { timeout: 10000 },
                    function (error, stdout, stderr) {
                        // シェル上でコマンドを実行できなかった場合のエラー処理
                        if (error !== null) {
                            if (!stderr) {
                                reject([3, error]); // E1003
                            } else {
                                try {
                                    fs.writeFile(`/Containers/${containerName}/run/output.txt`, stderr, er => { if (er) throw er });
                                } catch {
                                    reject([2, er]); // E1002
                                }
                                reject([4, stderr, `/Containers/${containerName}/run/output.txt`]); // E1004
                            }
                        }

                        try {
                            // 標準出力をファイルに出力
                            fs.writeFile(`/Containers/${containerName}/run/output.txt`, stdout, er => { if (er) throw er });
                        } catch {
                            reject([2, er]); // E1002
                        }

                        if (stdout.length == 0) {
                            // 標準出力が空の場合
                            resolve([0, "", `/Containers/${containerName}/run/output.txt`]); // 実行結果返却
                        } else {
                            resolve([0, stdout, `/Containers/${containerName}/run/output.txt`]);  // 実行結果返却
                        }
                    });
            }
        } catch (e) {
            console.log(e);
            reject([1, e]); // 未定義のエラー
        }
    })
};


client.once("ready", async () => {
    client.user.setPresence({ activities: [{ name: "Ver " + ver }] });
    console.log("準備完了");
});

client.on("messageCreate", async (msg) => {
    if (msg.author.bot) { // bot同士の会話回避
        return;
    }

    if (msg.content === "!help") { // ヘルプを表示
        msg.reply(helptxt);
    }

    if (msg.content === "!err") { // エラーコード例を表示
        msg.channel.send({ files: ['./img/errorCode.png'] });
        msg.channel.send("障害対応・緊急の場合は`ろくまいる#5659`までご連絡ください。");
    }

    if (msg.content.substring(0, 3) == "!py") { // !pで始まるメッセージのみ反応
        var message = msg.content.split('```'); // メッセージを```で分割 (Ex:[ '!py', 'print("helloWorld")', '', 'こんにちは', '' ])
        console.log(message.length);
        console.log(message);

        msg.channel.send("[Info] プログラムの実行を開始します");

        // 実行ファイル作成
        await makeFiles(message, "main.py", "c1").then((res) => {
            // res[0] = 状態コード, res[1] = エラー
            if (res[0] != 0) {
                msg.reply("[Serious] 例外が発生しました。開発者に報告してください。");
            } else {
                console.log("OK: ファイル作成完了");
                console.log(`実行内容：\n${res[1]}`);
            }
        }).catch((e) => {
            console.log(e);
            // 定形エラー処理
            // e[0] = エラーコード, e[1] = エラー内容
            errorMsg(msg, 0, e);
        });

        // 実行
        await execCommand("c1").then((res) => {
            // res[0] = 状態コード, res[1] = 標準出力, res[2] = 出力ファイルパス
            if (res[0] == 0) {
                console.log("OK: 実行完了");
                console.log(`実行結果：\n${res[1]}`);
                msg.reply("[Done] 実行結果は以下です。ご確認ください。"); // 実行結果を返信
                msg.channel.send({ files: [res[2]] }) // 実行結果を添付
            } else if (res[0] == 1) {
                msg.reply("[Done] 標準出力は空ですが、入力されたプログラムは正常に実行されました。");
            } else {
                msg.reply("[Serious] 実行中に例外が発生しました。開発者に報告してください。");
            }
        }).catch((e) => {
            console.log(e);
            // 定形エラー処理
            // e[0] = エラーコード, e[1] = エラー内容
            errorMsg(msg, 1, e);
        });

        await finishExec("rin/c1").then((res) => { // res[0] = 状態コード, res[1] = エラー
            console.log(res);
            console.log("OK: 終了処理完了");
        }).catch((e) => {
            console.log(e);
            msg.reply("[Serious] 終了処理で重大なエラーが発生しました。開発者に報告してください。");
        });
    }

    if (msg.content.substring(0, 2) == "!c") { // !cで始まるメッセージのみ反応
        var message = msg.content.split('```'); // メッセージを```で分割 (Ex:[ '!py', 'print("helloWorld")', '', 'こんにちは', '' ])
        console.log(message.length);
        console.log(message);

        msg.channel.send("[Info] プログラムの実行を開始します");

        // 実行ファイル作成
        await makeFiles(message, "main.c", "c2").then((res) => {
            // res[0] = 状態コード, res[1] = エラー
            if (res[0] != 0) {
                msg.reply("[Serious] 例外が発生しました。開発者に報告してください。");
            } else {
                console.log("OK: ファイル作成完了");
                console.log(`実行内容：\n${res[1]}`);
            }
        }).catch((e) => {
            console.log(e);
            // 定形エラー処理
            // e[0] = エラーコード, e[1] = エラー内容
            errorMsg(msg, 0, e);
        });

        // 実行
        await execCommand("c2").then((res) => {
            // res[0] = 状態コード, res[1] = 標準出力, res[2] = 出力ファイルパス
            if (res[0] == 0) {
                console.log("OK: 実行完了");
                console.log(`実行結果：\n${res[1]}`);
                msg.reply("[Done] 実行結果は以下です。ご確認ください。"); // 実行結果を返信
                msg.channel.send({ files: [res[2]] }) // 実行結果を添付
            } else if (res[0] == 1) {
                msg.reply("[Done] 標準出力は空ですが、入力されたプログラムは正常に実行されました。");
            } else {
                msg.reply("[Serious] 実行中に例外が発生しました。開発者に報告してください。");
            }
        }).catch((e) => {
            console.log(e);
            // 定形エラー処理
            // e[0] = エラーコード, e[1] = エラー内容
            errorMsg(msg, 1, e);
        });

        await finishExec("rin/c2").then((res) => { // res[0] = 状態コード, res[1] = エラー
            console.log(res);
            console.log("OK: 終了処理完了");
        }).catch((e) => {
            console.log(e);
            msg.reply("[Serious] 終了処理で重大なエラーが発生しました。開発者に報告してください。");
        });
    }
});

client.login(token);