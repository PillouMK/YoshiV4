"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const generalController_1 = require("../../controller/generalController");
const timetrialController_1 = require("../../controller/timetrialController");
const global_1 = require("../../global");
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
        .addStringOption((option) => option
        .setName("game")
        .setDescription("Jeu")
        .setRequired(false)
        .setAutocomplete(true))
        .addBooleanOption((option) => option.setName("no_item").setDescription("No item ?").setRequired(false)),
    async autocomplete(interaction) {
        if (!interaction)
            return;
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name === "map") {
            const selectedGameId = interaction.options.getString("game") ?? "MKWORLD";
            const value = interaction.options.getFocused().toLocaleLowerCase();
            const filtered = (0, generalController_1.filterMapList)(global_1.globalData.getAllMaps(selectedGameId), value);
            if (!interaction)
                return;
            const choices = filtered.map((choice) => ({
                name: `${choice.tag} | ${choice.name}`,
                value: choice.tag.toString(),
            }));
            await interaction.respond(choices);
        }
        else if (focusedOption.name === "game") {
            const games = global_1.globalData.getAllGames();
            const choices = games.map((choice) => ({
                name: `${choice.id} | ${choice.name}`,
                value: choice.id.toString(),
            }));
            await interaction.respond(choices);
        }
    },
    async execute(interaction) {
        const time = interaction.options.getString("time");
        const map_tag = interaction.options.getString("map").split(" ");
        const isShroomless = interaction.options.getBoolean("no_item") ?? false;
        const user = interaction.user;
        const game_id = interaction.options.getString("game") ?? "MKWORLD";
        (0, generalController_1.botLogs)(interaction.client, `${user.username} used /set_tt command`);
        const response = await (0, timetrialController_1.updateTimetrial)(time, map_tag[0], isShroomless, user, game_id, interaction.client);
        await interaction.reply(response);
    },
};
