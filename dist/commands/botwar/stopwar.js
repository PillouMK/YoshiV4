"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const botwarController_1 = require("../../controller/botwarController");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('stopwar')
        .setDescription('Stopper le war')
        .addBooleanOption(option => option.setName("force")
        .setDescription("Forcer l'arrêt du war si les 12 courses n'ont pas été jouée")
        .setRequired(false)),
    async execute(interaction) {
        const idChannel = interaction.channelId;
        const isForce = interaction.options.getBoolean("force") ?? false;
        const stopTheWar = await (0, botwarController_1.stopWar)(idChannel, isForce);
        await interaction.reply(stopTheWar);
    }
};
