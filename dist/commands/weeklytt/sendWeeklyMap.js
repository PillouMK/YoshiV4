"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const generalController_1 = require("../../controller/generalController");
const __1 = require("../..");
const weeklyttController_1 = require("../../controller/weeklyttController");
const settings_json_1 = tslib_1.__importDefault(require("../../settings.json"));
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("send_weekly_map")
        .setDescription("Commence une nouvelle session weekly"),
    async execute(interaction) {
        const member = await interaction.client.guilds.cache
            .get(settings_json_1.default.serverId)
            .members.fetch(interaction.user.id);
        if (member.roles.cache.has(__1.ADMIN_ROLE)) {
            (0, generalController_1.botLogs)(interaction.client, `${interaction.user.username} used /send_weekly_map command`);
            const response = await (0, weeklyttController_1.sendWeeklyMap)(interaction.client);
            await interaction.reply(response);
        }
        else {
            await interaction.reply("Tu n'as pas les permissions pour utiliser cette commande");
        }
    },
};
