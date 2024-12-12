"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const fc_json_1 = tslib_1.__importDefault(require("../../database/fc.json"));
const generalController_1 = require("../../controller/generalController");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("set_fc")
        .setDescription("Ajouter Code ami du joueur")
        .addStringOption((option) => option
        .setName("friendcode")
        .setDescription("Code ami switch : XXXX-XXXX-XXXX-XXXX")
        .setRequired(true))
        .addUserOption((option) => option
        .setName("player")
        .setDescription("Heure souhaitée")
        .setRequired(false)),
    async execute(interaction) {
        let id = "";
        const fcJson = fc_json_1.default;
        const fc_path = "./src/database/fc.json";
        const player = interaction.options.getUser("player");
        const fc_input = interaction.options.getString("friendcode");
        const regex = /^\d{4}-\d{4}-\d{4}$/;
        if (!regex.test(fc_input)) {
            (0, generalController_1.botLogs)(interaction.client, `${interaction.user.username} used /set_fc : wrong fc format`);
            interaction.reply({
                content: `${fc_input} n'est pas au bon format\nLe Code ami doit être au format XXXX-XXXX-XXXX-XXXX`,
            });
            return;
        }
        id = player == null ? (id = interaction.user.id) : (id = player.id);
        if (fcJson.friendcode[id] != undefined) {
            (0, generalController_1.botLogs)(interaction.client, `${interaction.user.username} used /set_fc : updated fc`);
            fcJson.friendcode[id] = fc_input;
            (0, generalController_1.saveJSONToFile)(fcJson, fc_path);
            interaction.reply({
                content: "Code ami modifié",
            });
        }
        else {
            (0, generalController_1.botLogs)(interaction.client, `${interaction.user.username} used /set_fc : added fc`);
            fcJson.friendcode[id] = fc_input;
            (0, generalController_1.saveJSONToFile)(fcJson, fc_path);
            interaction.reply({
                content: "Code ami modifié",
            });
        }
    },
};
