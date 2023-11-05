import { exec, execSync } from 'child_process';
import fs from 'fs';
import { Client, GatewayIntentBits, Events } from 'discord.js';
import { ContainerLists, resList, Container } from './types/main';
import dotenv from 'dotenv'
dotenv.config();


if (process.env.PYCHID == undefined || process.env.CCHID == undefined || process.env.JAVACHID == undefined || process.env.NAKO3CHID == undefined || process.env.SQLCHID == undefined) {
    throw new Error("環境変数が設定されていません。");
}

const containerLists: ContainerLists = [
    {
        prefix: "py",
        lang: "Python",
        filename: "main.py",
        id: process.env.PYCHID,
        containerId: "c1"
    },
    {
        prefix: "c",
        lang: "C",
        filename: "main.c",
        id: process.env.CCHID,
        containerId: "c2"
    },
    {
        prefix: "j",
        lang: "Java",
        filename: "Main.java",
        id: process.env.JAVACHID,
        containerId: "c3"
    },
    {
        prefix: "nako3",
        lang: "なでしこ3",
        filename: "main.nako3",
        id: process.env.NAKO3CHID,
        containerId: "c5"
    },
    {
        prefix: "sql",
        lang: "SQL",
        filename: "main.sql",
        id: process.env.SQLCHID,
        containerId: "c6"
    }
];

// ヘルプファイル読み込み
const helpTxt: string = fs.readFileSync(`help.txt`, 'utf-8');

// ===================================================================================================

class Runner {
    static outputFile: string;
    static inputFile: string;
    static execFile: string;
    containerType: string;
    command: string;

    constructor(lungType: string) {
        // 言語をリストから取得
        const container = containerLists.find((lang) => lang.prefix == lungType) as Container;

        // コンテナの情報
        this.containerType = container.containerId;

        // 実行ファイルのパス
        Runner.execFile = `/Containers/${this.containerType}/run/${container.filename}`

        // 出力ファイルのパス
        Runner.outputFile = `/Containers/${this.containerType}/run/output.txt`;

        // 標準入力ファイルのパス
        Runner.inputFile = `/Containers/${this.containerType}/run/input.txt`;

        // コマンド
        this.command = `docker run --name ${this.containerType} --rm --network=none -u ${process.env.EXECUSERID}:${process.env.EXECGROUPID} -v /etc/group:/etc/group:ro -v /etc/passwd:/etc/passwd:ro -v ${process.env.EXECSPACE}/Containers/${this.containerType}/run:/run:ro rin/${this.containerType}`;

    }

    finish() {
        console.log("finish");
        try {
            const stdout = execSync(`docker ps -q -f ancestor="rin/${this.containerType}"`);
            if (stdout.toString().trim() == "") { // 空文字列の場合
                console.log("OK: コンテナ削除済み");
            } else {
                try {
                    var result = execSync(`docker kill ${stdout.toString().trim()}`);
                    if (result.toString() == stdout.toString()) {
                        console.log("OK: コンテナ削除成功");
                    } else {
                        console.log("Error: コンテナ削除失敗");
                    }
                } catch (e) {
                    console.log("Error: コンテナ削除失敗");
                }
            }
        } catch (e) {
            console.log("Error: コンテナ削除失敗");
        }
    }

    exec() {
        console.log("exec");
        return new Promise((resolve, reject) => { // コマンド実行
            try {
                exec(this.command, { timeout: 10000 },
                    function (error, stdout, stderr) {
                        if(error && error.signal == "SIGTERM"){
                            try {
                                fs.writeFile(Runner.outputFile, stderr, er => { if (er) throw er });
                                let res: resList = {
                                    code: "E1002",
                                    success: false,
                                    stderr: String(stderr),
                                    output: Runner.outputFile
                                }
                                reject(res);
                            } catch {
                                reject("Error: 標準出力の書き込みに失敗しました。");
                            }
                        }

                        // シェル上でコマンドを実行できなかった場合のエラー処理
                        if (error !== null) {
                            if (!stderr) {
                                console.log(error);
                                let res: resList = {
                                    code: "E1003",
                                    success: false,
                                }
                                reject(res);
                            } else {
                                try {
                                    fs.writeFile(Runner.outputFile, stderr, er => { if (er) throw er });
                                    let res: resList = {
                                        code: "E1004",
                                        success: false,
                                        stderr: String(stderr),
                                        output: Runner.outputFile
                                    }
                                    reject(res);
                                } catch {
                                    reject("Error: 標準出力の書き込みに失敗しました。");
                                }
                            }
                        }

                        try {
                            // 標準出力をファイルに出力
                            fs.writeFile(Runner.outputFile, stdout, er => { if (er) throw er });
                        } catch {
                            reject("Error: 標準出力の書き込みに失敗しました。");
                        }

                        if (stdout.length == 0) {
                            // 標準出力が空の場合
                            let res: resList = {
                                code: "0",
                                success: true,
                                output: Runner.outputFile
                            }
                            resolve(res)
                        } else {
                            let res: resList = {
                                code: "0",
                                success: true,
                                stdout: stdout,
                                output: Runner.outputFile
                            }
                            resolve(res)
                        }
                    });
            } catch (e) {
                try {
                    // 標準出力をファイルに出力
                    fs.writeFile(Runner.outputFile, String(e), er => { if (er) throw er });
                    let res: resList = {
                        code: "Undefined",
                        success: false,
                        stderr: String(e),
                    }
                    reject(res); // 未定義エラー
                } catch {
                    reject("Error: 標準出力の書き込みに失敗しました。");
                }
            }
        });
    }

    makefile(code: string[]) {
        console.log("makefile");
        // ファイル生成関数 ([0]実行ファイル, [1]標準入力, [2]コンテナ名)
        return new Promise((resolve, reject) => {
            if (code.length == 1) {
                let res: resList = {
                    code: "E1001",
                    success: false,
                    error: "実行するプログラムが入力されていません"
                }
                reject(res); // E1001

            }
            if (code.length <= 3) {
                // メッセージの要素数が2以下の場合は標準入力がないと判断
                var execCode = code[1].trim(); // メッセージの2番目の要素を実行内容とする
                try {
                    fs.writeFileSync(Runner.execFile, execCode);
                    fs.writeFileSync(Runner.inputFile, ""); // 標準入力ファイルを空にする
                    let res: resList = {
                        code: "0",
                        success: true
                    }
                    resolve(res); // 作成成功，コンソール確認用で実行内容を返す
                } catch (e) {
                    //エラー処理
                    let res: resList = {
                        code: "E1001a",
                        success: false,
                        error: String(e)
                    }
                    reject(res); // E1001a
                }
            } else {
                var execCode = code[1].trim(); // メッセージの2番目の要素を実行内容とする
                var standardInput = code[3].trim(); // メッセージの4番目の要素を標準入力とする
                try {
                    fs.writeFileSync(Runner.execFile, execCode);
                    fs.writeFileSync(Runner.inputFile, standardInput);
                    let res: resList = {
                        code: "0",
                        success: true
                    }
                    resolve(res); // 作成成功，コンソール確認用で実行内容を返す
                } catch (e) {
                    //エラー処理
                    let res: resList = {
                        code: "E1001a",
                        success: false,
                        error: String(e)
                    }
                    reject(res); // E1001a
                }
            }
        })
    }
}

const client: Client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
});

client.once(Events.ClientReady, (c: Client) => {
    c.user?.setActivity({
        name: `Ver${process.env.VER}`
    });
    console.log(`Ready! Logged in as ${c.user?.tag}`);
});

client.on(Events.MessageCreate, async (msg) => {
    if (msg.author.bot) { // bot同士の会話回避
        return;
    }

    console.log(msg.content);

    if (msg.content.match("!help")) { // ヘルプを表示
        msg.reply(helpTxt);
    }

    // 実行言語の判定
    const execLang = containerLists.find((lang) => msg.content.startsWith(`!${lang.prefix}`))?.prefix;
    const execChannel = containerLists.find((lang) => msg.channel.id == lang.id)?.prefix;

    console.log(execLang);

    // 実行言語が見つからなかった場合
    if (!(execLang === undefined || execChannel === undefined)) {
        var message = msg.content.split('```'); // メッセージを```で分割
        console.log(message.length);
        console.log(message);

        msg.react("👀");
        msg.channel.send(`:information_source: プログラム(${containerLists.find((lang) => lang.prefix == execLang)?.lang})の実行を開始します`);

        // インスタンス生成
        const runner = new Runner(execLang);

        // ファイル生成
        runner.makefile(message).then((res: resList | unknown) => {
            console.log(res);

            if (!(res && res instanceof Object && "success" in res && res.success)) {
                msg.reply(":ghost: <@708659405607927819> 例外が発生しました。本事象はログに保存され、開発者が後ほど確認いたします。");
                return;
            }

            console.log("OK: ファイル作成完了");

        }).catch((err: resList) => {
            console.log("Error", err);
            if (err.code == "E1001") {
                msg.reply(":x: プログラムを認識できませんでした。もう一度送信し直してください。(E1001)");
                return;
            }

            if (err.code == "E1001a" || err.code == "E1001b") {
                msg.reply(":x: 送信したプログラムの書き込み処理または初期化に失敗しました。(E1001a, E1001b)");
                return;
            }

            msg.reply("[fatal] 予期せぬエラーが発生しました。開発者に報告してください。");
            return;
        });

        // 実行
        runner.exec().then((res: resList | unknown) => {
            if (!(res && res instanceof Object && "success" in res && res.success)) {
                msg.reply("[fatal] 予期せぬエラーが発生しました。開発者に報告してください。");
                return;
            }
            const response = res as resList;
            console.log("OK: 実行完了");

            msg.channel.send(":white_check_mark: プログラムの実行が完了しました。");

            if(!response.stdout || response.stdout.length == 0 || response.stdout?.length == 1){
                // 標準出力が空の場合
                msg.reply(":warning: 標準出力が空です。");
            }else if (response.stdout && response.stdout.length > 2000) {
                // 標準出力が2000文字を超える場合
                msg.reply(":warning: 標準出力が長すぎるため、実行結果のファイルを添付します。");
                response.output && msg.channel.send({ files: [response.output] });
            }else{
                // 標準出力が2000文字以内の場合
                msg.channel.send("```" + response.stdout + "```");
            }

            runner.finish();
            return;
        }).catch((err: resList) => {
            if (err.code == "E1002") {
                msg.reply(":x: プログラムの実行に失敗しました。\n```実行可能時間を超過したため, プログラムの実行を中断しました```"); // E1002
            }

            if (err.code == "E1003") {
                msg.reply(":x: プログラムの実行に失敗しました。\n```標準エラー出力は空です```"); // E1003
            }

            if (err.code == "E1004") {
                msg.reply(":x: プログラムの実行に失敗しました。");
                console.log(err.stderr);
                
                if(!err.stderr || err.stderr.length == 0 || err.stderr?.length == 1){
                    // 標準出力が空の場合
                    msg.reply(":warning: 標準エラー出力が空です。");
                } else if(err.stderr && err.stderr.length > 2000){
                    msg.reply(":warning: 標準エラー出力が長すぎるため、実行結果のファイルを添付します。");
                    err.output && msg.channel.send({ files: [err.output] });
                }else{
                    // 標準出力が2000文字以内の場合
                    msg.channel.send("```" + err.stderr + "```");
                }
            }

            if (err.code == "Undefined") {
                msg.reply(":ghost: <@708659405607927819> 例外が発生しました。本事象はログに保存され、開発者が後ほど確認いたします。");
                err.stderr && msg.channel.send({ files: [err.stderr] });
            }

            runner.finish();
            return;
        });
    } else {
        console.log("Error: 実行言語が見つかりませんでした。");
        return;
    }
});

client.login(process.env.TOKEN);
