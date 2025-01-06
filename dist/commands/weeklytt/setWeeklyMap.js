"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const generalController_1 = require("../../controller/generalController");
const __1 = require("../..");
const weeklyttController_1 = require("../../controller/weeklyttController");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("set_weekly_map")
        .setDescription("Set up les prochaines maps weekly")
        .addStringOption((option) => option
        .setName("map")
        .setDescription("Tag de la map")
        .setRequired(true)
        .setAutocomplete(true))
        .addBooleanOption((option) => option
        .setName("shroomless")
        .setDescription("TT avec ou sans item")
        .setRequired(true))
        .addStringOption((option) => option.setName("goldtime").setDescription("Temps Gold").setRequired(true))
        .addStringOption((option) => option
        .setName("silvertime")
        .setDescription("Temps silver")
        .setRequired(true))
        .addStringOption((option) => option
        .setName("bronzetime")
        .setDescription("Temps bronze")
        .setRequired(true)),
    async autocomplete(interaction) {
        const value = interaction.options.getFocused().toLocaleLowerCase();
        const filtered = (0, generalController_1.filterMapList)(__1.LIST_MAPS, value);
        if (!interaction)
            return;
        const choices = filtered.map((choice) => ({
            name: `${choice.idMap} | ${choice.initialGame} ${choice.nameMap}`,
            value: choice.idMap,
        }));
        await interaction.respond(choices);
    },
    async execute(interaction) {
        const isShroomless = interaction.options.getBoolean("shroomless");
        const idMap = interaction.options.getString("map").split(" ")[0];
        const goldTime = interaction.options.getString("goldtime");
        const silverTime = interaction.options.getString("silvertime");
        const bronzeTime = interaction.options.getString("bronzetime");
        const user = interaction.user;
        (0, generalController_1.botLogs)(interaction.client, `${user.username} used /set_weekly_map command`);
        const response = (0, weeklyttController_1.setWeeklyMap)(interaction.client, idMap, isShroomless, goldTime, silverTime, bronzeTime);
        await interaction.reply(response);
    },
};
