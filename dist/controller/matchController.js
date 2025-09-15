"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.recallMissingMatches = exports.makeTableButtonList = void 0;
const discord_js_1 = require("discord.js");
const yfApiController_1 = require("./yfApiController");
const generalController_1 = require("./generalController");
const makeTableButtonList = (match_id) => {
    return new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`tableValidate-${match_id.toString()}`)
        .setLabel(`Valider`)
        .setStyle(discord_js_1.ButtonStyle.Success))
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`tableDelete-${match_id.toString()}`)
        .setLabel(`Supprimer`)
        .setStyle(discord_js_1.ButtonStyle.Danger));
};
exports.makeTableButtonList = makeTableButtonList;
const recallMissingMatches = async (bot, team_id, result_channel_id) => {
    const matchMissing = await (0, yfApiController_1._getAllMatchsDone)(team_id);
    let msg = "<@&199252384612876289> Yoshi pas content, il manque les résultats des matchs suivants :\n";
    if (matchMissing.data.length > 0) {
        for (const match of matchMissing.data) {
            msg += `Match \`${match.id}\` - ${(0, generalController_1.makeMessageLink)(team_id, match.last_message_id ?? "")}\n`;
        }
        const channel = (await bot.channels.fetch(result_channel_id));
        try {
            await channel.send({
                content: msg,
            });
        }
        catch (e) {
            console.error(e);
        }
    }
};
exports.recallMissingMatches = recallMissingMatches;
