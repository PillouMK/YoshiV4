"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const timetrialController_1 = require("../../controller/timetrialController");
const generalController_1 = require("../../controller/generalController");
const global_1 = require("../../global");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("classement")
        .setDescription("Classement Timetrial")
        .addStringOption((option) => option
        .setName("map")
        .setDescription("Map souhaitée")
        .setRequired(true)
        .setAutocomplete(true))
        .addBooleanOption((option) => option
        .setName("is_mobile")
        .setDescription("Vue Mobile")
        .setRequired(false))
        .addStringOption((option) => option
        .setName("game")
        .setDescription("Jeu")
        .setRequired(false)
        .setAutocomplete(true))
        .addBooleanOption((option) => option.setName("no_item").setDescription("Sans item ?").setRequired(false)),
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
        const map_tag = interaction.options.getString("map").split(" ");
        const game_id = interaction.options.getString("game") ?? "MKWORLD";
        const isMobile = interaction.options.getBoolean("is_mobile") ?? false;
        const isShroomless = interaction.options.getBoolean("no_item") ?? false;
        const user = interaction.user;
        const team_id = interaction.guildId;
        await interaction.deferReply();
        const message = await (0, timetrialController_1.makeTimetrialMessage)(map_tag[0], game_id, team_id, isShroomless, user, isMobile);
        await interaction.editReply({
            content: message.content,
            embeds: message.embed,
            components: message.buttons != undefined ? [message.buttons] : [],
        });
    },
};
