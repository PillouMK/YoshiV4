"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("lineup_war")
        .setDescription("Joueurs de la LU"),
    async execute(interaction) {
        const selectMenu = new discord_js_1.UserSelectMenuBuilder()
            .setCustomId("lineup_war")
            .setPlaceholder("Sélectionne les joueurs")
            .setMaxValues(8);
        const userRow = new discord_js_1.ActionRowBuilder().addComponents(selectMenu);
        try {
            await interaction.reply({
                content: "Sélectionne les joueurs qui ont joué",
                components: [userRow.toJSON()],
                ephemeral: true,
            });
        }
        catch (e) {
            console.log(e.requestBody?.requestBody ?? e);
        }
    },
};
