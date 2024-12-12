"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const timetrialController_1 = require("../../controller/timetrialController");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("bot_test")
        .setDescription("Test de data"),
    async execute(interaction) {
        try {
            const msg = await (0, timetrialController_1.timetrialFinalRanking)(interaction.client, false);
            const actionRowBuilders = [
                msg.buttons,
            ];
            console.log(actionRowBuilders);
            const actionRows = actionRowBuilders.map((actionRowBuilder) => actionRowBuilder.toJSON());
            interaction.channel?.send({
                content: "La vue Mobile n'affiche que le joueurs ayant 10 pts ou +",
                embeds: msg.embed,
                files: msg.file,
                components: actionRowBuilders,
            });
        }
        catch (e) {
            console.log(e);
        }
    },
};
