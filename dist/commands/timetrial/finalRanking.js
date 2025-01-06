"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const timetrialController_1 = require("../../controller/timetrialController");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("final_ranking")
        .setDescription("Ranking TT de la YF"),
    async execute(interaction) {
        try {
            const response = await (0, timetrialController_1.timetrialFinalRanking)(interaction.client, false);
            interaction.reply({
                content: "Classement TT de la YF",
                embeds: response.embed,
                components: response.buttons != undefined ? [response.buttons] : [],
                files: response.file,
            });
        }
        catch (e) {
            console.log(e);
        }
    },
};
