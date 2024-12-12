"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const fc_json_1 = tslib_1.__importDefault(require("../../database/fc.json"));
const generalController_1 = require("../../controller/generalController");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("fc")
        .setDescription("Code ami du joueur")
        .addUserOption((option) => option
        .setName("player")
        .setDescription("Heure souhaitée")
        .setRequired(false)),
    async execute(interaction) {
        let id = "";
        const fcJson = fc_json_1.default.friendcode;
        const player = interaction.options.getUser("player");
        if (player == null)
            id = interaction.user.id;
        else
            id = player.id;
        (0, generalController_1.botLogs)(interaction.client, `${interaction.user.username} used /fc command`);
        if (fcJson[id] != undefined) {
            interaction.reply({
                content: fcJson[id],
            });
        }
        else {
            ("Je ne possède pas le code ami de cet utilisateur");
        }
    },
};
