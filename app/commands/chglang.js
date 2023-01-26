const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('chglang')
        .setDescription('コマンド実行機能のユーザ登録を行います．')
        .addStringOption(option =>
            option
                .setName('lang')
                .setDescription('rinで実行したい既定の言語を選択してください(後で変更できます)．')
                .setRequired(true) //trueで必須、falseで任意
                .addChoices(
                    { name: 'Python3', value: 'py' },
                    { name: 'Node.js', value: 'node' },
                    { name: 'Java', value: 'java' },
                    { name: 'C言語', value: "C" }
                )
        ),
    async execute(interaction) {
        const user = interaction.user;
        const lang = interaction.options.getString("lang");

        if (lang == "py") {
            var defaultLang = "Python";
        } else if (lang == "node") {
            var defaultLang = "Node.js";
        } else if (lang == "java") {
            var defaultLang = "Java";
        } else if (lang == "C") {
            var defaultLang = "C言語"
        } else {
            var defaultLang = "undefined" // 存在しない言語のとき
        }

        await interaction.reply(`${user.username}さん、既定の言語を${defaultLang}に変更したよ！`);
    },
};