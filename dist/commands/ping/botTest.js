"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("bot_test")
        .setDescription("Test de data"),
    async execute(interaction) {
        try {
            interaction.reply("ici future ranking TT");
        }
        catch (e) {
            console.log(e);
        }
    },
};
