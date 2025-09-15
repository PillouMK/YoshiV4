"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.rankingMessage = exports.makeEmbedProjectMap = exports.makeProjectMapMobileRankingField = exports.makeProjectMapRankingFields = exports.maxLengthFields = exports.projectMap = void 0;
const generalController_1 = require("../controller/generalController");
const discord_js_1 = require("discord.js");
const global_1 = require("../global");
exports.projectMap = {};
const maxLengthFields = (mapStats) => {
    if (mapStats.length == 0) {
        return {
            idMap: 0,
            iteration: 0,
            score: 0,
        };
    }
    const maxLength = {
        idMap: Math.max(...mapStats.map((elt) => {
            return elt.tag.toString().length;
        })),
        iteration: Math.max(...mapStats.map((elt) => {
            return elt.iteration.toString().length;
        })),
        score: Math.max(...mapStats.map((elt) => {
            return elt.weighted_average.toString().length;
        })),
    };
    return maxLength;
};
exports.maxLengthFields = maxLengthFields;
const makeProjectMapRankingFields = (map_stats) => {
    const rankingFields = [];
    let idMapField = "";
    let scoreField = "";
    let iterationField = "";
    const maxLength = (0, exports.maxLengthFields)(map_stats);
    map_stats.forEach((map, index) => {
        const space = index < 9 ? ` ` : "";
        idMapField += `\`${index + 1}${space} : \` **${map.tag}** \n`;
        scoreField += `\`${(0, generalController_1.addBlank)(map.weighted_average.toString(), maxLength.score)} pts\`\n`;
        const win_rate = map.win_rate * 100;
        iterationField += `\`${(0, generalController_1.addBlank)(map.iteration.toString(), maxLength.iteration)} - ${(0, generalController_1.addBlank)(`${win_rate.toString()}%`, 4)}\`\n`;
        if (idMapField.length > 1000) {
            rankingFields.push({
                map: { name: `__Map :__`, value: idMapField, inline: true },
                score: { name: `__Score :__`, value: scoreField, inline: true },
                iteration: {
                    name: `__Iteration / Winrate :__`,
                    value: iterationField,
                    inline: true,
                },
            });
            idMapField = "";
            scoreField = "";
            iterationField = "";
        }
    });
    if (idMapField.length > 0) {
        rankingFields.push({
            map: { name: `__Map :__`, value: idMapField, inline: true },
            score: { name: `__Score :__`, value: scoreField, inline: true },
            iteration: {
                name: `__Iteration / Winrate :__`,
                value: iterationField,
                inline: true,
            },
        });
    }
    return rankingFields;
};
exports.makeProjectMapRankingFields = makeProjectMapRankingFields;
const makeProjectMapMobileRankingField = (map_stats) => {
    const maxLength = (0, exports.maxLengthFields)(map_stats);
    const rankingField = [];
    let field = "";
    map_stats.forEach((map, index) => {
        const space = index < 9 ? ` ` : "";
        const win_rate = map.win_rate * 100;
        const idMap = (0, generalController_1.addBlank)(map.tag, maxLength.idMap);
        const score = (0, generalController_1.addBlank)(map.weighted_average.toString(), maxLength.idMap);
        const iteration = (0, generalController_1.addBlank)(map.iteration.toString(), maxLength.idMap);
        const win_rate_s = (0, generalController_1.addBlank)(`${win_rate.toString()}%`, 4);
        if (field.length > 1000) {
            rankingField.push({
                name: "__Map:     Score:     Iteration/Winrate:__",
                value: field,
                inline: false,
            });
            field = "";
        }
        field += `\`${index + 1}${space} : ${idMap} | ${score} pts | ${iteration} - ${win_rate_s}\`\n`;
    });
    if (field.length > 0) {
        rankingField.push({
            name: "__Map:     Score:     Iteration/Winrate:__",
            value: field,
            inline: false,
        });
    }
    return rankingField;
};
exports.makeProjectMapMobileRankingField = makeProjectMapMobileRankingField;
const makeEmbedProjectMap = (map_stats, isMobile, team, roster) => {
    const rankingEmbed = new discord_js_1.EmbedBuilder()
        .setColor(0x2ecc71)
        .setThumbnail("attachment://LaYoshiFamily.png")
        .setTitle(`---------------- Stats : ${team.name} ----------------`)
        .setTimestamp(Date.now())
        .setFooter({
        text: `project Map ${team.name} ${roster ? roster.name : ""}`,
    });
    if (!isMobile) {
        if (map_stats.stats.length == 0) {
            rankingEmbed.addFields({
                name: `__**Données valides :**__`,
                value: `Aucune données valides`,
                inline: false,
            });
        }
        else {
            const rankingFields = (0, exports.makeProjectMapRankingFields)(map_stats.stats);
            rankingEmbed.addFields({
                name: `.`,
                value: `__**Données valides :**__`,
                inline: false,
            });
            rankingFields.forEach((element) => {
                rankingEmbed.addFields(element.map, element.score, element.iteration);
            });
        }
    }
    else {
        if (map_stats.stats.length == 0) {
            rankingEmbed.addFields({
                name: `__**Données valides :**__`,
                value: `Aucune données valides`,
                inline: false,
            });
        }
        else {
            const rankingFieldsValid = (0, exports.makeProjectMapMobileRankingField)(map_stats.stats);
            rankingEmbed.addFields({
                name: `.`,
                value: `__**Données valides :**__`,
                inline: false,
            });
            rankingFieldsValid.forEach((element) => {
                rankingEmbed.addFields(element);
            });
        }
    }
    return rankingEmbed;
};
exports.makeEmbedProjectMap = makeEmbedProjectMap;
const rankingMessage = (map_stats, isMobile, team_id, roster_tag, month) => {
    const team = global_1.globalData.getTeam(team_id);
    const roster = global_1.globalData.getRoster(team_id, roster_tag ?? "") ?? undefined;
    const content = messageRecap(team, month, roster);
    const buttons = makeButtonList(roster_tag, isMobile);
    const file = new discord_js_1.AttachmentBuilder("./image/LaYoshiFamily.png", { description: "Team logo" });
    const embed = (0, exports.makeEmbedProjectMap)(map_stats, isMobile, team, roster);
    return {
        embed: [embed],
        buttons: buttons,
        content: content,
        file: file,
    };
};
exports.rankingMessage = rankingMessage;
const messageRecap = (team, month, roster) => {
    return `**ProjectMap ${team.name} ${roster ? `- ${roster.name}**` : `**`} : ${month ? `** données des ${month} derniers mois` : ``}\n`;
};
const makeButtonList = (roster_tag, isMobile) => {
    const labelView = isMobile ? "Vue PC" : "Vue Mobile";
    const idView = isMobile ? "pc" : "mobile";
    return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`projectmap-${idView}-${roster_tag ?? ""}`)
        .setLabel(labelView)
        .setStyle(discord_js_1.ButtonStyle.Primary));
};
