"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const botwarController_1 = require("../../controller/botwarController");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName('pena')
        .setDescription('Ajouter une pénalité à une équipe')
        .addStringOption(option => option.setName('team')
        .setDescription('Team recevant la pénalité')
        .setRequired(true)
        .addChoices({ name: 'YF', value: 'YF' }, { name: 'Adv', value: 'adv' }))
        .addIntegerOption(option => option.setName('pénalité')
        .setDescription("Nombre de points à retirer")
        .setRequired(true)),
    async execute(interaction) {
        const team = interaction.options.getString('team');
        const pena = interaction.options.getInteger('pénalité');
        const idChannel = interaction.channelId;
        const penaMsg = (0, botwarController_1.addPena)(team, pena, idChannel);
        await interaction.reply(penaMsg);
    }
};
