"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const generalController_1 = require("../../controller/generalController");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("fc")
        .setDescription("Code ami du joueur")
        .addUserOption((option) => option
        .setName("player")
        .setDescription("Heure souhaitée")
        .setRequired(false)),
    async execute(interaction) {
        let id = "";
        const player = interaction.options.getUser("player");
        if (player == null)
            id = interaction.user.id;
        else
            id = player.id;
        (0, generalController_1.botLogs)(interaction.client, `${interaction.user.username} used /fc command`);
        interaction.reply({
            content: (0, generalController_1.getUserFriendCode)(id),
        });
    },
};
