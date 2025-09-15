"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeFields = exports.makeEmbedRanking = exports.msToTime = exports.timeToMs = exports.isTimeValid = exports.updateTimetrial = exports.makeListButton = exports.makeEmbedTimetrial = exports.makeTimetrialFields = exports.emote_string = exports.makeTimetrialMessage = void 0;
const discord_js_1 = require("discord.js");
const yfApiController_1 = require("./yfApiController");
const generalController_1 = require("./generalController");
const terminaison = ["st", "nd", "rd", "th"];
const testTime = /\d[:.]\d{2}[.:]\d{3}/;
const makeTimetrialMessage = async (map_tag, game_id, team_id, isShroomless, user, isMobile) => {
    const timetrials = await (0, yfApiController_1._getTimetrialsByMap)(map_tag, game_id, team_id);
    if (timetrials.statusCode != 200) {
        return {
            content: "Une erreur est survenue",
        };
    }
    const timetrialsArray = isShroomless
        ? timetrials.data.shroomless
        : timetrials.data.noShroomless;
    const info = {
        date: new Date(),
        isEmpty: !(timetrialsArray.length > 0),
        isMobile: isMobile,
        isShroomless: isShroomless,
    };
    const times = timetrialsArray;
    const fields = (0, exports.makeTimetrialFields)(times, user, isShroomless);
    const embed = (0, exports.makeEmbedTimetrial)(timetrials.data.map, fields, info);
    const buttons = (0, exports.makeListButton)(isShroomless, isMobile, map_tag, game_id);
    return {
        content: `Dernier edit initié par ${user.username}`,
        embed: [embed],
        buttons: buttons,
        file: [(0, generalController_1.MK_MINIA_ATTACHMENT)(game_id, map_tag)],
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
    if (data.length == 0) {
        return undefined;
    }
    const emoteEmbed = (0, exports.emote_string)(isShroomless);
    const indexUser = data.findIndex((x) => x.user_id === user.id);
    const maxLength = Math.max(...data.map((el) => el.user.name.length)) > 10
        ? 10
        : Math.max(...data.map((el) => el.user.name.length));
    data.forEach((timetrial, index) => {
        if (index < 10) {
            const place = index + 1 < 4 ? terminaison[index] : terminaison[3];
            let placement = index < 9 ? `\`${index + 1}${place}.\`` : `\`${index + 1}${place}\``;
            members += `${placement} : **${timetrial.user.name}**\n`;
            times += `\`${(0, exports.msToTime)(timetrial.time)}\`\n`;
            diffs += `\`(${(0, exports.msToTime)(timetrial.time - data[0].time, true)})\`\n`;
            placement = index < 9 ? `${index + 1}${place} ` : `${index + 1}${place}`;
            mobileField += `\`${placement} ${(0, generalController_1.addBlank)(timetrial.user.name.slice(0, 10), maxLength, true)} ${(0, exports.msToTime)(timetrial.time)} (${(0, exports.msToTime)(timetrial.time - data[0].time, true)})\` \n`;
        }
    });
    if (indexUser != -1 && indexUser >= 10) {
        const element = data[indexUser];
        const place = terminaison[3];
        let placement = indexUser < 9
            ? `\`${indexUser + 1}${place}.\``
            : `\`${indexUser + 1}${place}\``;
        members += `${placement} : **${element.user.name}**\n`;
        times += `\`${(0, exports.msToTime)(element.time)}\`\n`;
        diffs += `\`(${(0, exports.msToTime)(element.time - data[0].time, true)})\`\n`;
        placement =
            indexUser < 9 ? `${indexUser + 1}${place} ` : `${indexUser + 1}${place}`;
        mobileField += `\`${placement} ${(0, generalController_1.addBlank)(element.user.name.slice(0, 10), maxLength, true)} ${(0, exports.msToTime)(element.time)} (${(0, exports.msToTime)(element.time - data[0].time, true)})\` \n`;
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
    const title = `Classement : ${infoMap.tag} ${infoMap.name}`;
    const emoteEmbed = (0, exports.emote_string)(info.isShroomless);
    const colorEmbed = 0x2ecc71;
    const quoteShroomless = info.isShroomless ? "shroomless" : "items";
    const classementEmbed = new discord_js_1.EmbedBuilder()
        .setColor(colorEmbed)
        .setFooter({ text: `${infoMap.game_id} - ${infoMap.tag}` })
        .setTimestamp(info.date);
    if (info.isEmpty) {
        return classementEmbed
            .setColor(0xec1c24)
            .setTitle(`${title} ${emoteEmbed}`)
            .setFooter({ text: `${infoMap.game_id} - ${infoMap.tag}` })
            .setThumbnail(`attachment://${infoMap.tag}.png`)
            .addFields({
            name: "__Erreur:__",
            value: `Il n'y a pas de temps sur ${infoMap.name} en ${quoteShroomless}`,
            inline: true,
        });
    }
    if (!info.isMobile) {
        return classementEmbed
            .setTitle(`${emoteEmbed} ${title}`)
            .setThumbnail(`attachment://${infoMap.tag}.png`)
            .addFields(fields.members)
            .addFields(fields.time)
            .addFields(fields.diff)
            .setTimestamp(info.date);
    }
    else {
        return classementEmbed
            .setColor(colorEmbed)
            .setFooter({ text: `${infoMap.game_id} - ${infoMap.tag}` })
            .setAuthor({ name: title, iconURL: `attachment://${infoMap.tag}.png` })
            .addFields(fields.mobileField);
    }
};
exports.makeEmbedTimetrial = makeEmbedTimetrial;
const makeListButton = (isShroomless, isMobile, map_tag, game_id) => {
    const viewLabel = isMobile ? "PC" : "Mobile";
    const emoji = isMobile ? "💻" : "📱";
    const itemLabel = isShroomless ? "With items" : "No items";
    const row = new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`timetrial-${map_tag}-${game_id}-${!isShroomless}-${isMobile}`)
        .setLabel(itemLabel)
        .setStyle(discord_js_1.ButtonStyle.Success))
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`timetrial-${map_tag}-${game_id}-${isShroomless}-${!isMobile}`)
        .setLabel(viewLabel)
        .setEmoji(emoji)
        .setStyle(discord_js_1.ButtonStyle.Secondary));
    return row;
};
exports.makeListButton = makeListButton;
const updateTimetrial = async (time, map_tag, isShroomless, user, game_id, bot) => {
    if (!(0, exports.isTimeValid)(time)) {
        (0, generalController_1.botLogs)(bot, `Error time is not valid : ${time}`);
        return `${time} n'est pas un temps valide`;
    }
    const timeInMs = (0, exports.timeToMs)(time);
    const upsert = {
        game_id: game_id,
        is_shroomless: isShroomless,
        map_tag: map_tag,
        time: timeInMs,
        user_id: user.id,
    };
    const updateTime = await (0, yfApiController_1._upsertTimetrial)(upsert);
    const response = isShroomless ? `en shroomless` : `avec items`;
    if (updateTime.statusCode == 201) {
        const res = updateTime;
        (0, generalController_1.botLogs)(bot, `${user.username} successfully updated time (${map_tag}, ${time}, ${isShroomless})`);
        const delta = res.data.delta ? `(${(0, exports.msToTime)(res.data.delta, true)}s)` : "";
        const old_time = res.data.old_time
            ? `Ton ancien temps était : ${(0, exports.msToTime)(res.data.old_time)}`
            : ``;
        return `Nouveau temps sur ${map_tag} pour ${res.data.timetrial.user.name} : ${(0, exports.msToTime)(res.data.new_time)} ${delta}${response}\n${old_time}`;
    }
    else {
        return `Erreur lors de la commande : ${updateTime.data.message}`;
    }
};
exports.updateTimetrial = updateTimetrial;
const isTimeValid = (time) => {
    return testTime.test(time) || time.length === 8;
};
exports.isTimeValid = isTimeValid;
const timeToMs = (time) => {
    const milli = parseInt(time.slice(5), 10);
    const minToMil = parseInt(time.slice(0, 1), 10) * 60000;
    const secTomil = parseInt(time.slice(2, 4), 10) * 1000;
    return minToMil + secTomil + milli;
};
exports.timeToMs = timeToMs;
const msToTime = (s, isDiff = false) => {
    function pad(n, z) {
        z = z || 2;
        return ("00" + n).slice(-z);
    }
    const ms = s % 1000;
    s = (s - ms) / 1000;
    const secs = s % 60;
    s = (s - secs) / 60;
    const mins = s % 60;
    return !isDiff
        ? pad(mins) + ":" + pad(secs) + "." + pad(ms, 3)
        : secs + "." + pad(ms, 3);
};
exports.msToTime = msToTime;
const makeEmbedRanking = (classement, isMobile) => {
    const fields = (0, exports.makeFields)(classement);
    const rankingEmbed = new discord_js_1.EmbedBuilder()
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
