"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.EditSavedMessages = exports.toggleMessage = exports.pushTempMessage = exports.updateLineupsByHour = exports.resetAllLineups = exports.addMember = exports.lineupResponse = exports.convertValidsHoursToNumberArray = exports.StatusLineUp = void 0;
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const dayjs = tslib_1.__importStar(require("dayjs"));
const timezone = tslib_1.__importStar(require("dayjs/plugin/timezone"));
const utc = tslib_1.__importStar(require("dayjs/plugin/utc"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const global_1 = require("../global");
const path_1 = tslib_1.__importDefault(require("path"));
const json_1 = require("../model/json");
dayjs.extend(timezone.default);
dayjs.extend(utc.default);
const lineupPath = path_1.default.resolve(process.cwd(), "data", "lineup.json");
const DEFAULT_LINEUP = {
    lineup: [],
    save: [],
    temp_save: [],
};
const lineupStore = new json_1.JsonStore(lineupPath, DEFAULT_LINEUP);
const lineup = lineupStore.load();
var StatusLineUp;
(function (StatusLineUp) {
    StatusLineUp[StatusLineUp["Can"] = 0] = "Can";
    StatusLineUp[StatusLineUp["Maybe"] = 1] = "Maybe";
    StatusLineUp[StatusLineUp["Sub"] = 2] = "Sub";
    StatusLineUp[StatusLineUp["Cant"] = 3] = "Cant";
})(StatusLineUp || (exports.StatusLineUp = StatusLineUp = {}));
const convertValidsHoursToNumberArray = (hours) => {
    const hoursToArray = hours.split(" ");
    const validsHours = [];
    hoursToArray.forEach((hour) => {
        if (/^(0[0-9]|1[0-9]|2[0-3])$/.test(hour)) {
            validsHours.push(Number(hour));
        }
    });
    return validsHours;
};
exports.convertValidsHoursToNumberArray = convertValidsHoursToNumberArray;
const sortByRoster = async (roster_id, lineup) => {
    const lineUpByRoster = [];
    lineup.forEach((element) => {
        if (element.roster === roster_id) {
            lineUpByRoster.push(element);
        }
    });
    return lineUpByRoster;
};
const makeLineupFields = (lineUpByRoster, name) => {
    const field = { name: "", inline: false, value: "" };
    const lineupCan = [];
    const lineupMaybe = [];
    lineUpByRoster.forEach((elt) => {
        if (elt.status == 0)
            lineupCan.push(elt.userName);
        if (elt.status == 1)
            lineupMaybe.push(elt.userName);
    });
    field.name = `__YF ${name} : (${lineupCan.length}/6)__`;
    if (lineupCan.length > 0) {
        field.value = `${lineupCan.join(" / ")}`;
        field.value += lineupMaybe.length > 0 ? " / " : "";
    }
    if (lineupMaybe.length > 0) {
        field.value += `(${lineupMaybe.join(") / (")})`;
    }
    if (lineupCan.length < 6)
        field.value += ` +${6 - lineupCan.length}`;
    return field;
};
const makeSubFields = (lineUp) => {
    const field = { name: "", inline: false, value: "" };
    const lineupSub = [];
    lineUp.forEach((elt) => {
        if (elt.status == 2)
            lineupSub.push(elt.userName);
    });
    field.name = `__Subs : (${lineupSub.length})__`;
    if (lineupSub.length > 0) {
        field.value = `${lineupSub.join(" / ")}`;
    }
    else {
        field.value = `Aucun Sub`;
    }
    return field;
};
const makeCantFields = (lineUp) => {
    const field = { name: "", inline: false, value: "" };
    const lineupCant = [];
    lineUp.forEach((elt) => {
        if (elt.status == 3)
            lineupCant.push(elt.userName);
    });
    field.name = `__Cant : (${lineupCant.length})__`;
    if (lineupCant.length > 0) {
        field.value = `${lineupCant.join(" / ")}`;
    }
    else {
        field.value = `Aucun can't`;
    }
    return field;
};
const lineupResponse = async (hours, isMix, team) => {
    const hourArray = (0, exports.convertValidsHoursToNumberArray)(hours);
    const response = [];
    for (const hour of hourArray) {
        const _lineUpData = JSON.parse(fs_1.default.readFileSync(lineupPath, "utf-8"));
        const lineUpByHour = _lineUpData.lineup[hour];
        const _team = global_1.globalData.getTeam(team);
        const embed = makeEmbedLineup(hour.toString(), isMix);
        if (isMix) {
            embed.addFields(makeLineupFields(lineUpByHour, _team?.name));
        }
        else {
            let rosters = _team?.rosters;
            if (rosters != undefined) {
                for (const roster of rosters) {
                    const sortedData = await sortByRoster(roster.id, lineUpByHour);
                    embed.addFields(makeLineupFields(sortedData, roster.name));
                }
            }
        }
        if (lineUpByHour.findIndex((elt) => elt.status == StatusLineUp.Sub) != -1)
            embed.addFields(makeSubFields(lineUpByHour));
        if (lineUpByHour.findIndex((elt) => elt.status == StatusLineUp.Cant) != -1)
            embed.addFields(makeCantFields(lineUpByHour));
        const buttonList = makeButtonList(hour, isMix);
        const res = {
            embed: [embed],
            buttons: buttonList,
            hour: hour.toString(),
        };
        response.push(res);
    }
    return response;
};
exports.lineupResponse = lineupResponse;
function getTimestampForHour(hour) {
    const offsetWithFrance = getTimezoneOffsetInHours("Europe/Paris");
    const now = new Date(Date.now());
    now.setHours(parseInt(hour) + offsetWithFrance, 0, 0, 0);
    return (now.valueOf() / 1000).toString();
}
const timestampDiscord = (timeStamp) => `<t:${timeStamp}:t>`;
const getTimezoneOffsetInHours = (targetTimeZone) => {
    const serverTime = dayjs.default();
    const targetTime = serverTime.tz(targetTimeZone);
    return serverTime.utcOffset() / 60 - targetTime.utcOffset() / 60;
};
const makeEmbedLineup = (hour, isMix) => {
    const isMixLabel = !isMix ? "Line up par roster" : "Line up mixte";
    const timestamp = timestampDiscord(getTimestampForHour(hour));
    const title = `${isMixLabel} ${timestamp} :`;
    return new discord_js_1.EmbedBuilder()
        .setColor(3066993)
        .setTitle(title)
        .setTimestamp(new Date())
        .setFooter({ text: isMixLabel });
};
const makeButtonList = (hour, isMix) => {
    const labelView = !isMix
        ? "Voir line up mixte"
        : "Voir line up roster";
    const idView = !isMix ? "roster" : "mix";
    const idViewToggle = isMix ? "roster" : "mix";
    return new discord_js_1.ActionRowBuilder()
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`can-${hour.toString()}-${idView}`)
        .setLabel(`Can`)
        .setStyle(discord_js_1.ButtonStyle.Success))
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`maybe-${hour.toString()}-${idView}`)
        .setLabel(`Maybe`)
        .setStyle(discord_js_1.ButtonStyle.Primary))
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`sub-${hour.toString()}-${idView}`)
        .setLabel(`Sub`)
        .setStyle(discord_js_1.ButtonStyle.Secondary))
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`cant-${hour.toString()}-${idView}`)
        .setLabel(`Can't`)
        .setStyle(discord_js_1.ButtonStyle.Danger))
        .addComponents(new discord_js_1.ButtonBuilder()
        .setCustomId(`lineupToggle-${hour.toString()}-${idViewToggle}`)
        .setEmoji("<:refresh:1359564875419877669>")
        .setLabel(labelView)
        .setStyle(discord_js_1.ButtonStyle.Secondary));
};
const addMember = (hour, member, status) => {
    const lineupByHour = lineup.lineup[parseInt(hour)];
    const index = lineupByHour.findIndex((elt) => elt.userId === member.id);
    console.log("member", member);
    const name = member.name;
    if (index === -1) {
        lineupByHour.push({
            userId: member.id,
            userName: name,
            status: status,
            roster: member.roster_id,
        });
        lineupStore.save(lineup);
        return `${member.name} ajouté en **${StatusLineUp[status]}** à ${timestampDiscord(getTimestampForHour(hour))}`;
    }
    else {
        if (lineupByHour[index].status !== status) {
            lineupByHour[index].status = status;
            lineupStore.save(lineup);
            return `${name} bien passé en **${StatusLineUp[status]}** à ${timestampDiscord(getTimestampForHour(hour))}`;
        }
        return `${name} est déjà en **${StatusLineUp[status]}** à ${timestampDiscord(getTimestampForHour(hour))}`;
    }
};
exports.addMember = addMember;
const resetAllLineups = async (bot, team) => {
    for (const msg of lineup.temp_save) {
        deleteLineupMsgById(msg.id, msg.idChannel, bot);
    }
    lineup.temp_save = [];
    lineup.lineup.forEach((element, index) => {
        lineup.lineup[index] = [];
    });
    lineup.save.forEach(async (elt) => {
        await (0, exports.EditSavedMessages)(elt, bot, team);
    });
    lineupStore.save(lineup);
};
exports.resetAllLineups = resetAllLineups;
const deleteLineupMsgById = async (idMsg, idChannel, bot) => {
    try {
        const channel = await bot.channels.fetch(idChannel);
        if (channel && channel.isTextBased() && channel instanceof discord_js_1.TextChannel) {
            const message = await channel.messages.fetch(idMsg);
            await message.delete();
            console.log(`Message avec l'ID ${idMsg} supprimé.`);
        }
        else {
            console.error("Le canal spécifié n'est pas un TextChannel.");
        }
    }
    catch (error) {
        console.error("Erreur lors de la récupération ou de la suppression du message :", error);
    }
};
const updateLineupsByHour = async (bot, hour, team) => {
    const lineupTempMsg = lineup.temp_save.filter((elt) => elt.hour === hour);
    for (const lineup of lineupTempMsg) {
        (0, exports.EditSavedMessages)(lineup, bot, team);
    }
    const lineupSavedMsg = lineup.save.filter((elt) => elt.hour === hour);
    for (const lineup of lineupSavedMsg) {
        (0, exports.EditSavedMessages)(lineup, bot, team);
    }
};
exports.updateLineupsByHour = updateLineupsByHour;
const pushTempMessage = (idMsg, idChannel, hour) => {
    const temp_lineup = {
        id: idMsg,
        idChannel: idChannel,
        hour: hour,
        isMix: false,
    };
    lineup.temp_save.push(temp_lineup);
    lineupStore.save(lineup);
};
exports.pushTempMessage = pushTempMessage;
const toggleMessage = (idMsg, isMix) => {
    const _item = lineup.save.find((elt) => elt.id === idMsg);
    if (_item) {
        _item.isMix = isMix;
    }
    const item = lineup.temp_save.find((elt) => elt.id === idMsg);
    if (item) {
        item.isMix = isMix;
        return;
    }
    lineupStore.save(lineup);
};
exports.toggleMessage = toggleMessage;
const EditSavedMessages = async (lineup, bot, team) => {
    const channel = bot.channels.cache.get(lineup.idChannel);
    if (channel.isTextBased()) {
        const msg = await channel.messages.fetch(lineup.id);
        const res = await (0, exports.lineupResponse)(lineup.hour, lineup.isMix, team);
        await msg.edit({
            embeds: res[0].embed,
            components: [res[0].buttons],
        });
    }
};
exports.EditSavedMessages = EditSavedMessages;
