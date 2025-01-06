"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const generalController_1 = require("../../controller/generalController");
const settings_json_1 = tslib_1.__importDefault(require("../../settings.json"));
const __1 = require("../..");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("bot_test")
        .setDescription("Test de data"),
    async execute(interaction) {
        const member = await interaction.client.guilds.cache
            .get(settings_json_1.default.serverId)
            .members.fetch(interaction.user.id);
        if (member.roles.cache.has(__1.ADMIN_ROLE)) {
            (0, generalController_1.botLogs)(interaction.client, `${interaction.user.username} used /bot_test command`);
            await interaction.reply("test");
        }
        else {
            await interaction.reply("Tu n'as pas les permissions pour utiliser cette commande");
        }
    },
};
