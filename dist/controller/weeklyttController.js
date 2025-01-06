"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeListButton = exports.makeWeeklyttFields = exports.makeWeeklyttEmbed = exports.getWeeklytt = exports.updateWeeklyTimetrial = exports.makeEmbedWeeklyAnnounce = exports.sendWeeklyMap = exports.setWeeklyMap = exports.getAllWeeklyMap = void 0;
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const timetrialController_1 = require("./timetrialController");
const yfApiController_1 = require("./yfApiController");
const generalController_1 = require("./generalController");
const fs_1 = tslib_1.__importDefault(require("fs"));
const settings_json_1 = tslib_1.__importDefault(require("../settings.json"));
const __1 = require("..");
const weeklyDataPath = "./src/database/weeklyMap.json";
const getAllWeeklyMap = async () => {
    try {
        const maps = await (0, yfApiController_1.getWeeklyTT)();
        const weeklyttArray = maps.data.arrayResponse;
        const weeklyMaps = weeklyttArray.map((weeklytt) => ({
            idMap: weeklytt.map.idMap,
            isShroomless: weeklytt.map.isShroomless,
            goldTime: weeklytt.map.goldTime,
            silverTime: weeklytt.map.silverTime,
            bronzeTime: weeklytt.map.bronzeTime,
        }));
        return weeklyMaps;
    }
    catch (error) {
        console.error("Error fetching weekly maps:", error);
        throw new Error("Unable to fetch weekly maps.");
    }
};
exports.getAllWeeklyMap = getAllWeeklyMap;
const setWeeklyMap = (bot, idMap, isShroomless, goldTime, silverTime, bronzeTime) => {
    const _weeklyMapData = JSON.parse(fs_1.default.readFileSync(weeklyDataPath, "utf-8"));
    const times = [
        { label: "gold", value: goldTime },
        { label: "silver", value: silverTime },
        { label: "bronze", value: bronzeTime },
    ];
    for (let weeklyMap of _weeklyMapData) {
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
const sendWeeklyMap = async (bot) => {
    const _weeklyMapData = JSON.parse(fs_1.default.readFileSync(weeklyDataPath, "utf-8"));
    let weeklyMapToSend = [];
    for (let map of _weeklyMapData) {
        weeklyMapToSend.push({
            idMap: map.idMap,
            isShroomless: map.isShroomless,
            goldTime: map.goldTime,
            silverTime: map.silverTime,
            bronzeTime: map.bronzeTime,
            isObligatory: true,
            roster: "YFG",
        });
    }
    let post = await (0, yfApiController_1.postMapWeekly)(weeklyMapToSend);
    if (post.statusCode === 201) {
        sendWeeklyAnnounce(bot);
        return "Nouvelle maps envoyées !";
    }
    else {
        (0, generalController_1.botLogs)(bot, `Error when /send_weekly : ${post.statusCode} : ${post.data}`);
        return `Une erreur est survenue : ${post.data}`;
    }
};
exports.sendWeeklyMap = sendWeeklyMap;
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
    let fields = [];
    _weeklyMapData.forEach((element, index) => {
        const emoteIsShroomless = element.isShroomless
            ? "<:no_mushroom_bot:1033130955470295131>"
            : "<:mushroom_bot:1033128412405047356>";
        let title = `${element.idMap} : ${emoteIsShroomless}`;
        let textFloor = `:first_place:\`Gold   : ${(0, timetrialController_1.msToTime)(element.goldTime)}\`\n:second_place:\`Silver : ${(0, timetrialController_1.msToTime)(element.silverTime)}\`\n:third_place:\`Bronze : ${(0, timetrialController_1.msToTime)(element.bronzeTime)}\``;
        if (index % 2 == 0 && index != 0)
            fields.push({ name: "\u200b", value: "\u200b" });
        fields.push({ name: title, value: textFloor, inline: true });
    });
    return fields;
};
const makeEmbedWeeklyAnnounce = () => {
    const _weeklyMapData = JSON.parse(fs_1.default.readFileSync(weeklyDataPath, "utf-8"));
    const file = new discord_js_1.AttachmentBuilder("./image/LaYoshiFamily.png");
    let embed = makeEmbedWeeklyMap(_weeklyMapData.length);
    const fields = makeWeeklyMapEmbedFields(_weeklyMapData);
    embed.addFields(fields);
    return {
        embed: [embed],
        file: file,
        content: "<@&199252384612876289> TT de la semaine :",
    };
};
exports.makeEmbedWeeklyAnnounce = makeEmbedWeeklyAnnounce;
const updateWeeklyTimetrial = async (time, idMap, isShroomless, user, bot) => {
    if (!(0, timetrialController_1.isTimeValid)(time)) {
        (0, generalController_1.botLogs)(bot, `Error time is not valid : ${time}`);
        return `${time} n'est pas un temps valide`;
    }
    const timeInMs = (0, timetrialController_1.timeToMs)(time);
    const patchTime = await (0, yfApiController_1.patchWeeklyTT)(user.id, idMap, timeInMs, isShroomless);
    const response = isShroomless ? `en shroomless` : `avec items`;
    if (patchTime.statusCode == 404) {
        const postTime = await (0, yfApiController_1.postWeeklyTT)(user.id, idMap, timeInMs, isShroomless);
        if (postTime.statusCode != 201) {
            (0, generalController_1.botLogs)(bot, `Error when adding time : ${postTime.data.toString()}`);
            return `Erreur : ${postTime.data.toString()}`;
        }
        else {
            let endText = "";
            if (postTime.data.ttExist && postTime.data.newIsBetter) {
                endText = `Tu as battu ton record qui était de ${postTime.data.timetrial}: C'est enregistré !`;
            }
            (0, generalController_1.botLogs)(bot, `${user.username} successfully added time (${idMap}, ${time}, ${isShroomless})`);
            return `Nouveau temps weekly : ${time} ${response}${endText}`;
        }
    }
    else {
        let endText = "";
        if (patchTime.data.newIsBetter) {
            endText += `\nTu as également battu ton record personnel qui était de : ${patchTime.data.timetrial}`;
        }
        (0, generalController_1.botLogs)(bot, `${user.username} successfully updated time (${idMap}, ${time}, ${isShroomless})`);
        return `Nouveau temps weekly : ${patchTime.data.newWeekly} (${patchTime.data.diff}s) ${response}\nTon ancien temps était : ${patchTime.data.oldWeekly}${endText}`;
    }
};
exports.updateWeeklyTimetrial = updateWeeklyTimetrial;
const getWeeklytt = async (bot, idMap, isShroomless) => {
    const req = await (0, yfApiController_1.getWeeklyTT)();
    if (req.statusCode === 200) {
        const weeklytt = req.data.arrayResponse;
        let weeklyttByMap;
        if (idMap != undefined) {
            weeklyttByMap = weeklytt.find((v) => v.map.idMap === idMap && isShroomless == v.map.isShroomless);
        }
        else {
            weeklyttByMap = weeklytt[0];
        }
        const currentMap = `${weeklyttByMap.map.idMap}-${weeklyttByMap.map.isShroomless}`;
        let listMap = weeklytt.map((elt) => elt.map);
        let embed = (0, exports.makeWeeklyttEmbed)(weeklyttByMap.map);
        const fields = (0, exports.makeWeeklyttFields)(weeklyttByMap);
        const buttons = (0, exports.makeListButton)(listMap, currentMap);
        embed.addFields(fields);
        return {
            content: "",
            embed: [embed],
            buttons: buttons,
        };
    }
    else {
        (0, generalController_1.botLogs)(bot, `Erreur lors de la récupération des données : ${req.statusCode} - ${req.data}`);
        return {
            content: `Erreur lors de la récupération des données : ${req.statusCode} - ${req.data}`,
            embed: [],
        };
    }
};
exports.getWeeklytt = getWeeklytt;
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
    let fieldGold = weeklytt.weeklyTimetrial.goldArray;
    let fieldSilver = weeklytt.weeklyTimetrial.silverArray;
    let fieldBronze = weeklytt.weeklyTimetrial.bronzeArray;
    let fieldOut = weeklytt.weeklyTimetrial.outArray;
    let arrayFields = [fieldGold, fieldSilver, fieldBronze, fieldOut];
    for (let element of arrayFields) {
        const maxLength = element.length
            ? Math.max(...element.map((el) => el.name.length))
            : 0;
        let valueField = "";
        element.forEach((elt) => {
            const name = (0, generalController_1.addBlank)(elt.name, maxLength, true);
            valueField += `\`${name} : ${elt.duration}\`\n`;
        });
        if (valueField == "") {
            valueField = "\u200b";
        }
        let field = {
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
    for (let weeklyMap of listMap) {
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
