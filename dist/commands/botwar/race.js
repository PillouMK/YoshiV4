"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const botwarController_1 = require("../../controller/botwarController");
const generalController_1 = require("../../controller/generalController");
const __1 = require("../..");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("race")
        .setDescription("course 6v6")
        .addStringOption((option) => option
        .setName("spots")
        .setDescription("les 6 spots, séparés par un espace")
        .setRequired(true))
        .addStringOption((option) => option
        .setName("map")
        .setDescription("Tag de la map jouée")
        .setRequired(true)
        .setAutocomplete(true)),
    async autocomplete(interaction) {
        const value = interaction.options.getFocused().toLocaleLowerCase();
        const filtered = (0, generalController_1.filterMapList)(__1.LIST_MAPS, value);
        if (!interaction)
            return;
        const choices = filtered.map((choice) => ({
            name: `${choice.idMap} | ${choice.initialGame} ${choice.nameMap}`,
            value: choice.idMap,
        }));
        console.log("Choices being sent to autocomplete:", choices);
        await interaction.respond(choices);
    },
    async execute(interaction) {
        const spots = interaction.options.getString("spots").split(" ");
        const map = interaction.options.getString("map").split(" ");
        const idChannel = interaction.channelId;
        const newRace = await (0, botwarController_1.raceAdd)(spots, map[0], idChannel);
        try {
            await interaction.reply(newRace);
        }
        catch (e) {
            console.log(e.requestBody.requestBody);
        }
    },
};
