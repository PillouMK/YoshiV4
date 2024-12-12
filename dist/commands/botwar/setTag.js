"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const botwarController_1 = require("../../controller/botwarController");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('set_tag')
        .setDescription('Changer le tag du botwar')
        .addStringOption(option => option.setName('tag')
        .setDescription('Team YF')
        .setRequired(true)
        .addChoices({ name: 'YF', value: 'YF' }, { name: 'YFG', value: 'YFG' }, { name: 'YFO', value: 'YFO' }, { name: 'YFS', value: 'YFS' })),
    async execute(interaction) {
        const team1 = interaction.options.getString('tag');
        const idChannel = interaction.channelId;
        const changeTag = (0, botwarController_1.changeTagTeam)(team1, idChannel);
        await interaction.reply(changeTag);
    }
};
