"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const botwarController_1 = require("../../controller/botwarController");
const generalController_1 = require("../../controller/generalController");
const global_1 = require("../../global");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("edit_race")
        .setDescription("Editer une course 6v6")
        .addStringOption((option) => option
        .setName("spots")
        .setDescription("les 6 spots, séparés par un espace")
        .setRequired(true))
        .addStringOption((option) => option
        .setName("map")
        .setDescription("Tag de la map jouée")
        .setRequired(true)
        .setAutocomplete(true))
        .addIntegerOption((option) => option
        .setName("race")
        .setDescription("numéro de la course")
        .setRequired(false)
        .setAutocomplete(true)),
    async autocomplete(interaction) {
        const channelId = interaction.channelId;
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name === "map") {
            const filtered = (0, generalController_1.filterMapList)(global_1.globalData.getAllMaps(), focusedOption.value);
            await interaction.respond(filtered.map((choice) => ({
                name: `${choice.tag} | ${choice.name}`,
                value: choice.tag.toString(),
            })));
        }
        else if (focusedOption.name === "race") {
            const races = (0, botwarController_1.getNumberOfRace)(channelId);
            const choices = [];
            for (let i = 1; i <= races; i++) {
                choices.push(i);
            }
            await interaction.respond(choices.map((choice) => ({
                name: choice.toString(),
                value: choice,
            })));
        }
        else {
            return;
        }
    },
    async execute(interaction) {
        const spots = interaction.options.getString("spots").split(" ");
        const map = interaction.options.getString("map").split(" ");
        const idChannel = interaction.channelId;
        const race = interaction.options.getInteger("race") ?? (0, botwarController_1.getNumberOfRace)(idChannel);
        const newRace = await (0, botwarController_1.editRace)(spots, map[0], idChannel, race.toString());
        try {
            const msg = await interaction.reply(newRace);
            (0, botwarController_1.set_last_message_id)(msg.id, interaction.channelId);
        }
        catch (e) {
            console.log(e.requestBody.requestBody);
        }
    },
};
