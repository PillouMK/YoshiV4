"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeListButton = exports.makeWeeklyttFields = exports.makeWeeklyttEmbed = exports.makeEmbedWeeklyAnnounce = exports.setWeeklyMap = void 0;
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const timetrialController_1 = require("./timetrialController");
const generalController_1 = require("./generalController");
const fs_1 = tslib_1.__importDefault(require("fs"));
const settings_json_1 = tslib_1.__importDefault(require("../settings.json"));
const __1 = require("..");
const weeklyDataPath = "./src/database/weeklyMap.json";
const setWeeklyMap = (bot, idMap, isShroomless, goldTime, silverTime, bronzeTime) => {
    const _weeklyMapData = JSON.parse(fs_1.default.readFileSync(weeklyDataPath, "utf-8"));
    const times = [
        { label: "gold", value: goldTime },
        { label: "silver", value: silverTime },
        { label: "bronze", value: bronzeTime },
    ];
    for (const weeklyMap of _weeklyMapData) {
        if (weeklyMap.idMap === idMap && weeklyMap.isShroomless === isShroomless) {
            const errorMessage = `${idMap} ${isShroomless ? "No item" : "Item"} est déjà set`;
            (0, generalController_1.botLogs)(bot, `${idMap} ${isShroomless} already set`);
            return errorMessage;
        }
    }
    for (const { label, value } of times) {
        if (!(0, timetrialController_1.isTimeValid)(value)) {
            const errorMessage = `${value} n'est pas un temps valide`;
            (0, generalController_1.botLogs)(bot, `Error time is not valid (${label}): ${value}`);
            return errorMessage;
        }
    }
    const goldMs = (0, timetrialController_1.timeToMs)(goldTime);
    const silverMs = (0, timetrialController_1.timeToMs)(silverTime);
    const bronzeMs = (0, timetrialController_1.timeToMs)(bronzeTime);
    if (goldMs > silverMs || silverMs > bronzeMs) {
        const errorMessage = `Les temps doivent respecter l'ordre croissant : gold (${goldTime}) < silver (${silverTime}) < bronze (${bronzeTime})`;
        (0, generalController_1.botLogs)(bot, `Time aren't well ordered : gold ${goldTime}, silver ${silverTime}, bronze ${bronzeTime}`);
        return errorMessage;
    }
    const weeklyMapObject = {
        idMap: idMap,
        isShroomless: isShroomless,
        goldTime: (0, timetrialController_1.timeToMs)(goldTime),
        silverTime: (0, timetrialController_1.timeToMs)(silverTime),
        bronzeTime: (0, timetrialController_1.timeToMs)(bronzeTime),
    };
    _weeklyMapData.push(weeklyMapObject);
    (0, generalController_1.saveJSONToFile)(_weeklyMapData, weeklyDataPath);
    return `${idMap} en ${isShroomless ? "No item" : "Item"} bien enregistré`;
};
exports.setWeeklyMap = setWeeklyMap;
const sendWeeklyAnnounce = (bot) => {
    const channel = bot.channels.cache.get(settings_json_1.default.channels.announcement);
    const message = (0, exports.makeEmbedWeeklyAnnounce)();
    channel.send({
        content: message.content,
        embeds: message.embed,
        files: [message.file],
    });
};
const makeEmbedWeeklyMap = (length) => {
    return new discord_js_1.EmbedBuilder()
        .setColor(0x1f8b4c)
        .setTitle("Weekly TT maps de la semaine !")
        .setThumbnail(__1.LOGO_YF)
        .setTimestamp(Date.now())
        .setFooter({ text: `Weekly Map (${length.toString()})` });
};
const makeWeeklyMapEmbedFields = (_weeklyMapData) => {
    const fields = [];
    _weeklyMapData.forEach((element, index) => {
        const emoteIsShroomless = element.isShroomless
            ? "<:no_mushroom_bot:1033130955470295131>"
            : "<:mushroom_bot:1033128412405047356>";
        const title = `${element.idMap} : ${emoteIsShroomless}`;
        const textFloor = `:first_place:\`Gold   : ${(0, timetrialController_1.msToTime)(element.goldTime)}\`\n:second_place:\`Silver : ${(0, timetrialController_1.msToTime)(element.silverTime)}\`\n:third_place:\`Bronze : ${(0, timetrialController_1.msToTime)(element.bronzeTime)}\``;
        if (index % 2 == 0 && index != 0)
            fields.push({ name: "\u200b", value: "\u200b" });
        fields.push({ name: title, value: textFloor, inline: true });
    });
    return fields;
};
const makeEmbedWeeklyAnnounce = () => {
    const _weeklyMapData = JSON.parse(fs_1.default.readFileSync(weeklyDataPath, "utf-8"));
    const file = new discord_js_1.AttachmentBuilder("./image/LaYoshiFamily.png");
    const embed = makeEmbedWeeklyMap(_weeklyMapData.length);
    const fields = makeWeeklyMapEmbedFields(_weeklyMapData);
    embed.addFields(fields);
    return {
        embed: [embed],
        file: file,
        content: "<@&199252384612876289> TT de la semaine :",
    };
};
exports.makeEmbedWeeklyAnnounce = makeEmbedWeeklyAnnounce;
const makeWeeklyttEmbed = (map) => {
    const mapMK = __1.LIST_MAPS.find((v) => v.idMap === map.idMap);
    const title = `Weekly TT : ${mapMK.initialGame} ${mapMK.nameMap}`;
    const emote = (0, timetrialController_1.emote_string)(map.isShroomless);
    return new discord_js_1.EmbedBuilder()
        .setColor(0x1f8b4c)
        .setTitle(`${emote} ${title}`)
        .setThumbnail(mapMK.minia)
        .setTimestamp(Date.now())
        .setFooter({ text: `${mapMK.idMap} - ${mapMK.DLC} - ${mapMK.retro}` });
};
exports.makeWeeklyttEmbed = makeWeeklyttEmbed;
const makeWeeklyttFields = (weeklytt) => {
    const fields = [];
    const arrayFloor = [
        {
            nameFloor: "Gold",
            timeFloor: (0, timetrialController_1.msToTime)(weeklytt.map.goldTime),
        },
        {
            nameFloor: "Silver",
            timeFloor: (0, timetrialController_1.msToTime)(weeklytt.map.silverTime),
        },
        {
            nameFloor: "Bronze",
            timeFloor: (0, timetrialController_1.msToTime)(weeklytt.map.bronzeTime),
        },
        {
            nameFloor: "Out",
            timeFloor: "",
        },
    ];
    let index = 0;
    const fieldGold = weeklytt.weeklyTimetrial.goldArray;
    const fieldSilver = weeklytt.weeklyTimetrial.silverArray;
    const fieldBronze = weeklytt.weeklyTimetrial.bronzeArray;
    const fieldOut = weeklytt.weeklyTimetrial.outArray;
    const arrayFields = [fieldGold, fieldSilver, fieldBronze, fieldOut];
    for (const element of arrayFields) {
        const maxLength = element.length
            ? Math.max(...element.map((el) => el.user.name.length))
            : 0;
        let valueField = "";
        element.forEach((elt) => {
            const name = (0, generalController_1.addBlank)(elt.user.name, maxLength, true);
            valueField += `\`${name} : ${(0, timetrialController_1.msToTime)(elt.time)}\`\n`;
        });
        if (valueField == "") {
            valueField = "\u200b";
        }
        const field = {
            name: `${arrayFloor[index].nameFloor} : ${arrayFloor[index].timeFloor}`,
            value: valueField,
            inline: true,
        };
        if (index == 2) {
            fields.push({
                name: "\u200B",
                value: "\u200B",
                inline: false,
            });
        }
        fields.push(field);
        index++;
    }
    return fields;
};
exports.makeWeeklyttFields = makeWeeklyttFields;
const makeListButton = (listMap, currentMap) => {
    const arrayButtonStyle = [
        discord_js_1.ButtonStyle.Primary,
        discord_js_1.ButtonStyle.Secondary,
        discord_js_1.ButtonStyle.Success,
        discord_js_1.ButtonStyle.Danger,
    ];
    const row = new discord_js_1.ActionRowBuilder();
    let index = 0;
    for (const weeklyMap of listMap) {
        const shroomless = weeklyMap.isShroomless ? "ni" : "item";
        row.addComponents(new discord_js_1.ButtonBuilder()
            .setCustomId(`weeklytt-${weeklyMap.idMap}-${weeklyMap.isShroomless}`)
            .setLabel(`${weeklyMap.idMap} - ${shroomless}`)
            .setStyle(arrayButtonStyle[index % 4])
            .setDisabled(currentMap === `${weeklyMap.idMap}-${weeklyMap.isShroomless}`));
        index++;
    }
    return row;
};
exports.makeListButton = makeListButton;
