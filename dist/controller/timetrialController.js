"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateFinalRanking = exports.makeListButtonRanking = exports.makeFields = exports.makeEmbedRanking = exports.timetrialFinalRanking = exports.updateTimetrial = exports.msToTime = exports.timeToMs = exports.isTimeValid = exports.makeListButton = exports.makeEmbedTimetrial = exports.makeTimetrialFields = exports.emote_string = exports.makeTimetrialMessage = exports.getTimetrialsDataByMap = void 0;
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const yfApiController_1 = require("./yfApiController");
const generalController_1 = require("./generalController");
const settings_json_1 = tslib_1.__importDefault(require("../settings.json"));
const terminaison = ["st", "nd", "rd", "th"];
const testTime = /[\d]{1}[\:|\.][\d]{2}[\.|\:][\d]{3}/;
const getTimetrialsDataByMap = async (idMap, idRoster) => {
    const response = await (0, yfApiController_1.getTimetrialsByMap)(idMap, idRoster);
    if (response.statusCode !== 200) {
        return undefined;
    }
    const data = {
        infoMap: response.data.infoMap,
        timetrials: {
            arrayShroom: response.data.timetrials.arrayShroom,
            arrayShroomless: response.data.timetrials.arrayShroomless,
        },
    };
    return data;
};
exports.getTimetrialsDataByMap = getTimetrialsDataByMap;
const makeTimetrialMessage = async (idMap, idRoster, isShroomless, user, isMobile) => {
    const data = await (0, exports.getTimetrialsDataByMap)(idMap, idRoster);
    if (data == undefined) {
        return {
            content: "Une erreur est survenue",
        };
    }
    const info = {
        date: new Date(),
        idRoster: idRoster ?? "YF",
        isEmpty: isShroomless
            ? data.timetrials.arrayShroomless == null
            : data.timetrials.arrayShroom == null,
        isMobile: isMobile,
        isShroomless: isShroomless,
    };
    const times = !isShroomless
        ? data.timetrials.arrayShroom
        : data.timetrials.arrayShroomless;
    const fields = (0, exports.makeTimetrialFields)(times, user, isShroomless);
    const embed = (0, exports.makeEmbedTimetrial)(data.infoMap, fields, info);
    const buttons = (0, exports.makeListButton)(isShroomless, isMobile, idRoster ?? "YF", idMap);
    return {
        content: `Dernier edit initié par ${user.username}`,
        embed: [embed],
        buttons: buttons,
    };
};
exports.makeTimetrialMessage = makeTimetrialMessage;
const emote_string = (isShroomless) => {
    return isShroomless
        ? ` <:shroomless:1359564972300173322>`
        : ` <:shrooms:1359564923713228861>`;
};
exports.emote_string = emote_string;
const makeTimetrialFields = (data, user, isShroomless) => {
    let members = "";
    let times = "";
    let diffs = "";
    let mobileField = "";
    if (data == null) {
        return undefined;
    }
    const emoteEmbed = (0, exports.emote_string)(isShroomless);
    const indexUser = data.findIndex((x) => x.idPlayer === user.id);
    const maxLength = Math.max(...data.map((el) => el.name.length)) > 10
        ? 10
        : Math.max(...data.map((el) => el.name.length));
    data.forEach((timetrial, index) => {
        if (index < 10) {
            let place = index + 1 < 4 ? terminaison[index] : terminaison[3];
            let placement = index < 9 ? `\`${index + 1}${place}.\`` : `\`${index + 1}${place}\``;
            members += `${placement} : **${timetrial.name}**\n`;
            times += `\`${timetrial.duration}\`\n`;
            diffs += `\`(${timetrial.difference})\`\n`;
            placement = index < 9 ? `${index + 1}${place} ` : `${index + 1}${place}`;
            mobileField += `\`${placement} ${(0, generalController_1.addBlank)(timetrial.name.slice(0, 10), maxLength, true)} ${timetrial.duration} (${timetrial.difference})\` \n`;
        }
    });
    if (indexUser != -1 && indexUser >= 10) {
        let element = data[indexUser];
        let place = terminaison[3];
        let placement = indexUser < 9
            ? `\`${indexUser + 1}${place}.\``
            : `\`${indexUser + 1}${place}\``;
        members += `${placement} : **${element.name}**\n`;
        times += `\`${element.duration}\`\n`;
        diffs += `\`(${element.difference})\`\n`;
        placement =
            indexUser < 9 ? `${indexUser + 1}${place} ` : `${indexUser + 1}${place}`;
        mobileField += `\`${placement} ${(0, generalController_1.addBlank)(element.name.slice(0, 10), maxLength, true)} ${element.duration} (${element.difference})\` \n`;
    }
    return {
        members: { name: "__Membre :__", value: members, inline: true },
        time: { name: "__Temps :__", value: times, inline: true },
        diff: { name: "__diff :__", value: diffs, inline: true },
        mobileField: {
            name: `__Membre:       Time:       Diff:__ ${emoteEmbed}`,
            value: mobileField,
            inline: false,
        },
    };
};
exports.makeTimetrialFields = makeTimetrialFields;
const makeEmbedTimetrial = (infoMap, fields, info) => {
    const title = `Classement : ${infoMap.initialGame} ${infoMap.nameMap}`;
    const emoteEmbed = (0, exports.emote_string)(info.isShroomless);
    const colorEmbed = (0, generalController_1.rosterColor)(info.idRoster);
    const isDLC = infoMap.DLC ? "DLC" : "Not DLC";
    const isRetro = infoMap.retro ? "Retro" : "Not retro";
    const quoteShroomless = info.isShroomless ? "shroomless" : "items";
    const quoteRoster = info.idRoster != undefined ? `pour le roster ${info.idRoster}` : "";
    let classementEmbed = new discord_js_1.EmbedBuilder()
        .setColor(colorEmbed)
        .setFooter({ text: `${infoMap.idMap} - ${isDLC} - ${isRetro}` })
        .setTimestamp(info.date);
    if (info.isEmpty) {
        return classementEmbed
            .setColor(0xec1c24)
            .setTitle(`${title} ${emoteEmbed}`)
            .setFooter({ text: `${infoMap.idMap} - ${isDLC} - ${isRetro}` })
            .setThumbnail(infoMap.minia)
            .addFields({
            name: "__Erreur:__",
            value: `Il n'y a pas de temps sur ${infoMap.nameMap} en ${quoteShroomless} ${quoteRoster}`,
            inline: true,
        });
    }
    if (!info.isMobile) {
        return classementEmbed
            .setTitle(`${emoteEmbed} ${title}`)
            .setThumbnail(infoMap.minia)
            .addFields(fields.members)
            .addFields(fields.time)
            .addFields(fields.diff)
            .setTimestamp(info.date);
    }
    else {
        return classementEmbed
            .setColor(colorEmbed)
            .setFooter({ text: `${infoMap.idMap} - ${isDLC} - ${isRetro}` })
            .setAuthor({ name: title, iconURL: infoMap.minia })
            .addFields(fields.mobileField);
    }
};
exports.makeEmbedTimetrial = makeEmbedTimetrial;
const makeListButton = (isShroomless, isMobile, idRoster, idMap) => {
    const viewLabel = isMobile ? "PC" : "Mobile";
    const emoji = isMobile ? "💻" : "📱";
    const itemLabel = isShroomless ? "With items" : "No items";
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`timetrial-YF-${idMap}-${isShroomless}-${isMobile}`)
        .setLabel("Yoshi")
        .setStyle(discord_js_1.ButtonStyle.Secondary)
        .setDisabled(idRoster == "YF"))
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`timetrial-YFG-${idMap}-${isShroomless}-${isMobile}`)
        .setLabel("Galaxy")
        .setStyle(discord_js_1.ButtonStyle.Success)
        .setDisabled(idRoster == "YFG"))
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`timetrial-YFO-${idMap}-${isShroomless}-${isMobile}`)
        .setLabel("Odyssey")
        .setStyle(discord_js_1.ButtonStyle.Primary)
        .setDisabled(idRoster == "YFO"))
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`timetrial-${idRoster}-${idMap}-${!isShroomless}-${isMobile}`)
        .setLabel(itemLabel)
        .setStyle(discord_js_1.ButtonStyle.Danger))
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`timetrial-${idRoster}-${idMap}-${isShroomless}-${!isMobile}`)
        .setLabel(viewLabel)
        .setEmoji(emoji)
        .setStyle(discord_js_1.ButtonStyle.Secondary));
    return row;
};
exports.makeListButton = makeListButton;
const isTimeValid = (time) => {
    return testTime.test(time) || time.length === 8;
};
exports.isTimeValid = isTimeValid;
const timeToMs = (time) => {
    let milli = parseInt(time.slice(5), 10);
    let minToMil = parseInt(time.slice(0, 1), 10) * 60000;
    let secTomil = parseInt(time.slice(2, 4), 10) * 1000;
    return minToMil + secTomil + milli;
};
exports.timeToMs = timeToMs;
const msToTime = (s, isDiff = false) => {
    function pad(n, z) {
        z = z || 2;
        return ("00" + n).slice(-z);
    }
    let ms = s % 1000;
    s = (s - ms) / 1000;
    let secs = s % 60;
    s = (s - secs) / 60;
    let mins = s % 60;
    return !isDiff
        ? pad(mins) + ":" + pad(secs) + "." + pad(ms, 3)
        : secs + "." + pad(ms, 3);
};
exports.msToTime = msToTime;
const updateTimetrial = async (time, idMap, isShroomless, user, bot) => {
    if (!(0, exports.isTimeValid)(time)) {
        (0, generalController_1.botLogs)(bot, `Error time is not valid : ${time}`);
        return `${time} n'est pas un temps valide`;
    }
    const timeInMs = (0, exports.timeToMs)(time);
    const patchTime = await (0, yfApiController_1.patchTimetrial)(user.id, idMap, timeInMs, isShroomless);
    const response = isShroomless ? `en shroomless` : `avec items`;
    if (patchTime.statusCode != 200) {
        const postTime = await (0, yfApiController_1.postTimetrial)(user.id, idMap, timeInMs, isShroomless);
        if (postTime.statusCode != 201) {
            (0, generalController_1.botLogs)(bot, `Error when adding time : ${postTime.data.toString()}`);
            return `Erreur : ${postTime.data.toString()}`;
        }
        else {
            (0, generalController_1.botLogs)(bot, `${user.username} successfully added time (${idMap}, ${time}, ${isShroomless})`);
            return `Nouveau temps : ${time} ${response}`;
        }
    }
    else {
        (0, generalController_1.botLogs)(bot, `${user.username} successfully updated time (${idMap}, ${time}, ${isShroomless})`);
        return `Nouveau temps : ${patchTime.data.newTime} (${patchTime.data.diff}s) ${response}\nTon ancien temps était : ${patchTime.data.oldTime}`;
    }
};
exports.updateTimetrial = updateTimetrial;
const timetrialFinalRanking = async (bot, isMobile) => {
    const classement = await (0, yfApiController_1.getAllPlayers)();
    if (classement.statusCode != 200) {
        (0, generalController_1.botLogs)(bot, `Error when getAllPlayers - ${classement.data}`);
        return {
            content: "Erreur lors de la récupération des joueurs",
        };
    }
    const embed = (0, exports.makeEmbedRanking)(classement.data, isMobile);
    const buttons = (0, exports.makeListButtonRanking)(isMobile);
    return {
        content: "",
        embed: [embed],
        buttons: buttons,
        file: [generalController_1.YOSHI_FAMILY_LOGO],
    };
};
exports.timetrialFinalRanking = timetrialFinalRanking;
const makeEmbedRanking = (classement, isMobile) => {
    const fields = (0, exports.makeFields)(classement);
    let rankingEmbed = new discord_js_1.EmbedBuilder()
        .setColor((0, generalController_1.rosterColor)(""))
        .setFooter({ text: "1er = 10 pts, 2nd = 9 pts, [...] 10ème = 1 pts" })
        .setTimestamp(Date.now());
    if (isMobile) {
        rankingEmbed.addFields(fields.mobileField);
        rankingEmbed.setAuthor({
            name: `Classement Timetrial YF :`,
            iconURL: "attachment://LaYoshiFamily.png",
        });
    }
    else {
        rankingEmbed.addFields(fields.members, fields.points, fields.tops);
        rankingEmbed.setThumbnail("attachment://LaYoshiFamily.png");
        rankingEmbed.setTitle(`----------------- Classement Timetrial YF -----------------`);
    }
    return rankingEmbed;
};
exports.makeEmbedRanking = makeEmbedRanking;
const makeFields = (classement) => {
    const maxLengthPts = classement[0].tt_points.toString().length;
    const maxLengthName = Math.max(...classement
        .filter((player) => player.tt_points > 0)
        .map((player) => player.name.length)) + 3;
    let fieldMobile = "";
    let fieldPLayer = "";
    let fieldTt_point = "";
    let fieldTt_tops = "";
    const fieldsMobile = [];
    classement.forEach((player, index) => {
        if (player.tt_points == 0)
            return;
        const name = (0, generalController_1.addBlank)(player.name, maxLengthName, true);
        const tt_points = (0, generalController_1.addBlank)(player.tt_points.toString(), maxLengthPts);
        const tt_top1 = (0, generalController_1.addBlank)(player.tt_top1.toString(), 2);
        const tt_top3 = (0, generalController_1.addBlank)(player.tt_top3.toString(), 2);
        const space = index < 9 ? ` ` : ``;
        if (fieldMobile.length < 900) {
            fieldMobile += `\`${index + 1}${space} : ${name}${tt_points}pts | ${tt_top1} - ${tt_top3}\`\n`;
        }
        else {
            fieldsMobile.push({
                name: "__Membre:       Points:         Top 1 & Top 3:__",
                value: fieldMobile,
                inline: false,
            });
            fieldMobile = `\`${index + 1}${space} : ${name}${tt_points}pts | ${tt_top1} - ${tt_top3}\`\n`;
        }
        fieldPLayer += `\`${index + 1}${space} :\` **${name}** \n`;
        fieldTt_point += `\`${tt_points} pts\`\n`;
        fieldTt_tops += `\`${tt_top1}  -  ${tt_top3}\`\n`;
    });
    fieldsMobile.push({
        name: "__Membre:       Points:         Top 1 & Top 3:__",
        value: fieldMobile,
        inline: false,
    });
    return {
        members: { name: "__Membre :__", value: fieldPLayer, inline: true },
        points: { name: "__Points :__", value: fieldTt_point, inline: true },
        tops: { name: "__Tops :__", value: fieldTt_tops, inline: true },
        mobileField: fieldsMobile,
    };
};
exports.makeFields = makeFields;
const makeListButtonRanking = (isMobile) => {
    const labelView = isMobile ? "Vue PC" : "Vue Mobile";
    const row = new discord_js_1.ActionRowBuilder().addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`ranking-${!isMobile}`)
        .setLabel(labelView)
        .setStyle(discord_js_1.ButtonStyle.Success));
    return row;
};
exports.makeListButtonRanking = makeListButtonRanking;
const updateFinalRanking = async (bot) => {
    const newMsg = await (0, exports.timetrialFinalRanking)(bot, false);
    const channelId = settings_json_1.default.channels.rankings;
    const msgId = settings_json_1.default.rankingTimetrial.msgId;
    try {
        const channel = (await bot.channels.fetch(channelId));
        const message = (await channel.messages.fetch(msgId));
        message.edit({
            content: newMsg.content,
            components: newMsg.buttons != undefined ? [newMsg.buttons] : [],
            embeds: newMsg.embed,
            files: newMsg.file,
        });
        const successMessage = `Yoshi successfully updated Final Ranking message`;
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
exports.updateFinalRanking = updateFinalRanking;
