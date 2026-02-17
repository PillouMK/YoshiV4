"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
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
        (0, generalController_1.botLogs)(interaction.client, `${interaction.user.username} used /set_fc : updated fc`);
        const add_fc = (0, generalController_1.saveUserFriendCode)(id, fc_input);
        interaction.reply({
            content: add_fc,
        });
    },
};
