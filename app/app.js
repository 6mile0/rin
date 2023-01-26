// ========================================================
// 環境設定
// ========================================================

// const token = "MTAyODIwMDM3NjI3ODcyMDU3Mw.GTWcpV.ibkBATvN72XabdZfvRIjC694Eu3oX0dq2ytsvI"; // DiscordのBotのトークン(本番環境)
const token = "MTAyNzE2NDc0ODYyMzY1MDg0Ng.GFEUaU.FjTQl7mVb9k7WPLMNEw82FvvpXswo-gRx6XdEw"
const botname = "rin"; // Botの名前
const ver = "v2.0.0"; // 現在バージョン

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

// ========================================================
// [Add] スラッシュコマンド読み込み
// 2022/12/31
// ========================================================
client.commands = new Collection();

const commandsPath = path.join(__dirname, 'commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ('data' in command && 'execute' in command) {
        client.commands.set(command.data.name, command);
    } else {
        console.log(`${filePath} に必要な "data" か "execute" がありません。`);
    }
}

// ========================================================

console.log(botname + " " + ver + " を起動します");

client.once("ready", async () => {
    client.user.setPresence({ activities: [{ name: "Ver " + ver }] });
    console.log("準備完了");
});

client.on('interactionCreate', async interaction => {
    if (!interaction.isChatInputCommand()) return;

    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
        console.error(`${interaction.commandName} が見つかりません。`);
        return;
    }

    try {
        await command.execute(interaction);
    } catch (error) {
        console.error(error);
        await interaction.reply({ content: 'エラーが発生しました。', ephemeral: true });
    }
});


client.on("messageCreate", async (msg) => {
    if (msg.author.bot) { // bot同士の会話回避
        return;
    }

    if (msg.content == "!msgTest") {
        msg.reply(msg.member.nickname + "さんのメッセージを受け取りました");
    }
});

client.login(token);