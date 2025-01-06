"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resfreshProjectMap = exports.updateProjectMapMessage = exports.rankingMessage = exports.makeEmbedProjectMap = exports.makeProjectMapMobileRankingField = exports.makeProjectMapRankingFields = exports.maxLengthFields = exports.getProjectMapData = exports.projectMap = void 0;
const tslib_1 = require("tslib");
const generalController_1 = require("../controller/generalController");
const yfApiController_1 = require("./yfApiController");
const discord_js_1 = require("discord.js");
const settings_json_1 = tslib_1.__importDefault(require("../settings.json"));
exports.projectMap = {};
const getProjectMapData = async (idRoster, month, iteration) => {
    const response = await (0, yfApiController_1.getProjectMap)(idRoster, month, iteration);
    if (response.statusCode !== 200) {
        return undefined;
    }
    const data = {
        projectMapValid: response.data.projectMapValid,
        projectMapNotValid: response.data.projectMapNotValid,
    };
    return data;
};
exports.getProjectMapData = getProjectMapData;
const maxLengthFields = (projectMap) => {
    if (projectMap == undefined) {
        return {
            idMap: 0,
            iteration: 0,
            score: 0,
        };
    }
    let maxLength = {
        idMap: Math.max(...projectMap.map((elt) => {
            return elt.idMap.toString().length;
        })),
        iteration: Math.max(...projectMap.map((elt) => {
            return elt.iteration.toString().length;
        })),
        score: Math.max(...projectMap.map((elt) => {
            return elt.score.toString().length;
        })),
    };
    return maxLength;
};
exports.maxLengthFields = maxLengthFields;
const makeProjectMapRankingFields = (projectMap) => {
    let rankingFields = [];
    let idMapField = "";
    let scoreField = "";
    let iterationField = "";
    let maxLength = (0, exports.maxLengthFields)(projectMap);
    if (projectMap == undefined) {
    }
    projectMap.forEach((element, index) => {
        let space = index < 9 ? ` ` : "";
        idMapField += `\`${index + 1}${space} : \` **${element.idMap}** \n`;
        scoreField += `\`${(0, generalController_1.addBlank)(element.score.toString(), maxLength.score)} pts\`\n`;
        iterationField += `\`${(0, generalController_1.addBlank)(element.iteration.toString(), maxLength.iteration)}\`\n`;
        if (idMapField.length > 1000) {
            rankingFields.push({
                map: { name: `__Map :__`, value: idMapField, inline: true },
                score: { name: `__Score :__`, value: scoreField, inline: true },
                iteration: {
                    name: `__Iteration :__`,
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
                name: `__Iteration :__`,
                value: iterationField,
                inline: true,
            },
        });
    }
    return rankingFields;
};
exports.makeProjectMapRankingFields = makeProjectMapRankingFields;
const makeProjectMapMobileRankingField = (projectMap) => {
    let maxLength = (0, exports.maxLengthFields)(projectMap);
    let rankingField = [];
    let field = "";
    projectMap.forEach((element, index) => {
        let space = index < 9 ? ` ` : "";
        let idMap = (0, generalController_1.addBlank)(element.idMap, maxLength.idMap);
        let score = (0, generalController_1.addBlank)(element.score.toString(), maxLength.idMap);
        let iteration = (0, generalController_1.addBlank)(element.iteration.toString(), maxLength.idMap);
        if (field.length > 1000) {
            rankingField.push({
                name: "__Map :     Score :     Iteration :__",
                value: field,
                inline: false,
            });
            field = "";
        }
        field += `\`${index + 1}${space} : ${idMap} | ${score} pts | ${iteration}\`\n`;
    });
    if (field.length > 0) {
        rankingField.push({
            name: "__Map :     Score :     Iteration :__",
            value: field,
            inline: false,
        });
    }
    return rankingField;
};
exports.makeProjectMapMobileRankingField = makeProjectMapMobileRankingField;
const makeEmbedProjectMap = (idRoster, projetMapValid, projetMapNotValid, isMobile) => {
    let rankingEmbed = new discord_js_1.EmbedBuilder()
        .setColor((0, generalController_1.rosterColor)(idRoster))
        .setThumbnail("attachment://LaYoshiFamily.png")
        .setTitle(`----------------- ProjectMap ${idRoster} -----------------`)
        .setTimestamp(Date.now())
        .setFooter({ text: `project Map ${idRoster}` });
    if (!isMobile) {
        if (projetMapValid == undefined) {
            rankingEmbed.addFields({
                name: `__**Données valides :**__`,
                value: `Aucune données valides`,
                inline: false,
            });
        }
        else {
            const rankingFieldsValid = (0, exports.makeProjectMapRankingFields)(projetMapValid);
            rankingEmbed.addFields({
                name: `.`,
                value: `__**Données valides :**__`,
                inline: false,
            });
            rankingFieldsValid.forEach((element) => {
                rankingEmbed.addFields(element.map, element.score, element.iteration);
            });
        }
        const rankingFieldsNotValid = (0, exports.makeProjectMapRankingFields)(projetMapNotValid);
        rankingEmbed.addFields({
            name: `.`,
            value: `__**Données non-valides :**__`,
            inline: false,
        });
        rankingFieldsNotValid.forEach((element) => {
            rankingEmbed.addFields(element.map, element.score, element.iteration);
        });
    }
    else {
        if (projetMapValid == undefined) {
            rankingEmbed.addFields({
                name: `__**Données valides :**__`,
                value: `Aucune données valides`,
                inline: false,
            });
        }
        else {
            const rankingFieldsValid = (0, exports.makeProjectMapMobileRankingField)(projetMapValid);
            rankingEmbed.addFields({
                name: `.`,
                value: `__**Données valides :**__`,
                inline: false,
            });
            rankingFieldsValid.forEach((element) => {
                rankingEmbed.addFields(element);
            });
        }
        const rankingFieldsNotValid = (0, exports.makeProjectMapMobileRankingField)(projetMapNotValid);
        rankingEmbed.addFields({
            name: `.`,
            value: `__**Données non-valides :**__`,
            inline: false,
        });
        rankingFieldsNotValid.forEach((element) => {
            rankingEmbed.addFields(element);
        });
    }
    return rankingEmbed;
};
exports.makeEmbedProjectMap = makeEmbedProjectMap;
const rankingMessage = (idRoster, month, iteration, projetMapValid, projetMapNotValid, isMobile) => {
    console.log("rankingMessage", month);
    const content = messageRecap(idRoster, month, iteration);
    const buttons = makeButtonList(idRoster, isMobile);
    const file = new discord_js_1.AttachmentBuilder("./image/LaYoshiFamily.png");
    const embed = (0, exports.makeEmbedProjectMap)(idRoster, projetMapValid, projetMapNotValid, isMobile);
    return {
        embed: [embed],
        buttons: buttons,
        content: content,
        file: file,
    };
};
exports.rankingMessage = rankingMessage;
const messageRecap = (idRoster, month, iteration) => {
    console.log("messageRecap", month);
    let saut2ligne = ".\n\n\n";
    let endMsg = "Affichage des données valides et non valides";
    return `${saut2ligne}**ProjectMap ${idRoster} : ** données des ${month} derniers mois, données jugées valides à partir de ${iteration} itérations\n${endMsg}`;
};
const makeButtonList = (idRoster, isMobile) => {
    const labelView = isMobile ? "Vue PC" : "Vue Mobile";
    const idView = isMobile ? "pc" : "mobile";
    return new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`projectmap-${idView}-${idRoster}`)
        .setLabel(labelView)
        .setStyle(discord_js_1.ButtonStyle.Primary));
};
const updateProjectMapMessage = async (bot, idRoster, month, iteration, isMobile) => {
    const projectMap = await (0, exports.getProjectMapData)(idRoster, 3, 10);
    const newMsg = (0, exports.rankingMessage)(idRoster, month, iteration, projectMap.projectMapValid, projectMap.projectMapNotValid, isMobile);
    const channelId = settings_json_1.default.channels.rankings;
    const msgId = settings_json_1.default.projectMap[idRoster];
    try {
        const channel = (await bot.channels.fetch(channelId));
        const message = (await channel.messages.fetch(msgId));
        message.edit({
            content: newMsg.content,
            components: [newMsg.buttons],
            embeds: newMsg.embed,
            files: [newMsg.file],
        });
        const successMessage = `Yoshi successfully updated ProjectMap ${idRoster} message`;
        (0, generalController_1.botLogs)(bot, successMessage);
    }
    catch (e) {
        const errorMessage = `Erreur projetMap : ${e}`;
        try {
            (0, generalController_1.botLogs)(bot, errorMessage);
        }
        catch (error) {
            console.log(error);
        }
    }
};
exports.updateProjectMapMessage = updateProjectMapMessage;
const resfreshProjectMap = async (Bot, idRoster) => { };
exports.resfreshProjectMap = resfreshProjectMap;
