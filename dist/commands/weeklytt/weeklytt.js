"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const generalController_1 = require("../../controller/generalController");
const weeklyttController_1 = require("../../controller/weeklyttController");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("weeklytt")
        .setDescription("Afficher les temps weekly"),
    async execute(interaction) {
        const user = interaction.user;
        (0, generalController_1.botLogs)(interaction.client, `${user.username} used /weeklytt command`);
        const response = await (0, weeklyttController_1.getWeeklytt)(interaction.client);
        await interaction.reply({
            content: response.content,
            embeds: response.embed,
            components: response.buttons != undefined ? [response.buttons] : [],
        });
    },
};
