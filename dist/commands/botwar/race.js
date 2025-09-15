"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const botwarController_1 = require("../../controller/botwarController");
const generalController_1 = require("../../controller/generalController");
const global_1 = require("../../global");
const bot_war_json_1 = tslib_1.__importDefault(require("../../database/bot-war.json"));
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
        const filtered = (0, generalController_1.filterMapList)(global_1.globalData.getAllMaps(), value);
        if (!interaction)
            return;
        const choices = filtered.map((choice) => ({
            name: `${choice.tag} | ${choice.name}`,
            value: choice.tag.toString(),
        }));
        await interaction.respond(choices);
    },
    async execute(interaction) {
        const botwar = bot_war_json_1.default;
        const botwarPath = "./src/database/bot-war.json";
        const spots = interaction.options.getString("spots").split(" ");
        const map = interaction.options.getString("map").split(" ");
        const idChannel = interaction.channelId;
        const newRace = await (0, botwarController_1.raceAdd)(spots, map[0], idChannel);
        const war = botwar.channels[idChannel];
        try {
            const msg = await interaction.reply(newRace);
            war.paramWar.last_message_id = `${interaction.channelId}/${msg.id}`;
            (0, generalController_1.saveJSONToFile)(botwar, botwarPath);
        }
        catch (e) {
            console.log(e.requestBody.requestBody);
        }
    },
};
