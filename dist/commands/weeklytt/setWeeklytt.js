"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const generalController_1 = require("../../controller/generalController");
const weeklyttController_1 = require("../../controller/weeklyttController");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("set_weeklytt")
        .setDescription("Enregistrer un temps (Weekly TT)")
        .addStringOption((option) => option
        .setName("map")
        .setDescription("Tag de la map")
        .setRequired(true)
        .setAutocomplete(true))
        .addStringOption((option) => option
        .setName("temps")
        .setDescription("Temps : xx:xx.xxx")
        .setRequired(true)),
    async autocomplete(interaction) {
        const list = await (0, weeklyttController_1.getAllWeeklyMap)();
        if (!interaction)
            return;
        await interaction.respond(list.map((choice) => ({
            name: `${choice.idMap} | ${choice.isShroomless ? "No item" : "Item"}`,
            value: `${choice.idMap}-${choice.isShroomless}`,
        })));
    },
    async execute(interaction) {
        const time = interaction.options.getString("temps");
        const idMap = interaction.options.getString("map").split("-")[0];
        const isShroomless = interaction.options.getString("map").split("-")[1] === "1";
        console.log(interaction.options.getString("map").split("-")[1]);
        const user = interaction.user;
        (0, generalController_1.botLogs)(interaction.client, `${user.username} used /set_weeklytt command`);
        const response = await (0, weeklyttController_1.updateWeeklyTimetrial)(time, idMap, isShroomless, user, interaction.client);
        await interaction.reply(response);
    },
};
