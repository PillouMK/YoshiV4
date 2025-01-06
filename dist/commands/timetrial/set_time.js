"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const generalController_1 = require("../../controller/generalController");
const __1 = require("../..");
const timetrialController_1 = require("../../controller/timetrialController");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("set_tt")
        .setDescription("Enregistrer un temps")
        .addStringOption((option) => option
        .setName("map")
        .setDescription("Tag de la map jouée")
        .setRequired(true)
        .setAutocomplete(true))
        .addStringOption((option) => option
        .setName("time")
        .setDescription("Temps : xx:xx.xxx")
        .setRequired(true))
        .addBooleanOption((option) => option.setName("no_item").setDescription("No item ?").setRequired(false)),
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
        const time = interaction.options.getString("time");
        const idMap = interaction.options.getString("map").split(" ");
        const isShroomless = interaction.options.getBoolean("no_item") ?? false;
        const user = interaction.user;
        (0, generalController_1.botLogs)(interaction.client, `${user.username} used /set_tt command`);
        const response = await (0, timetrialController_1.updateTimetrial)(time, idMap[0], isShroomless, user, interaction.client);
        await interaction.reply(response);
    },
};
