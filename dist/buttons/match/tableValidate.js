"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const yfApiController_1 = require("../../controller/yfApiController");
const global_1 = require("../../global");
const axios_1 = tslib_1.__importDefault(require("axios"));
module.exports = {
    data: {
        name: "tableValidate",
    },
    async execute(interaction, args) {
        const id = args[0];
        const team_id = interaction.guildId;
        const matchData = global_1.globalData.getFullMatchPreview(id);
        const matchCount = await (0, yfApiController_1._getAllMatchsPublished)(team_id);
        const match = await (0, yfApiController_1._getMatch)(id, team_id);
        const channel_result_id = global_1.globalData.getTeam(team_id)?.result_channel_id;
        console.log(global_1.globalData.getTeam(team_id));
        console.log(channel_result_id);
        await interaction.deferReply();
        await interaction.message.edit({
            components: [],
        });
        if (matchData == null) {
            interaction.editReply({
                content: "j'ai perdu les données locales du match",
            });
            return;
        }
        const channel = (await interaction.client.channels.fetch(channel_result_id));
        const response = await axios_1.default.get(matchData.table_url, {
            responseType: "arraybuffer",
        });
        const buffer = Buffer.from(response.data, "binary");
        const file = new discord_js_1.AttachmentBuilder(buffer, { name: "image.png" });
        const msg = await channel.send({
            content: `IT ${matchCount.data.length + 1} | ${match.data.opponent}`,
            files: [file],
        });
        const matchPublish = {
            message_id: msg.id,
            own_team: matchData.data.own_team,
            table_url: matchData.table_url,
        };
        const publishMatch = await (0, yfApiController_1._publishMatch)(matchPublish, id, team_id);
        if (publishMatch.statusCode == 201) {
            await interaction.editReply({
                content: "Match posté !",
            });
        }
        else {
            await interaction.editReply({
                content: "Erreur, match non enregistré",
            });
        }
    },
};
