"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetAllLineups = exports.addMember = exports.lineupResponse = exports.convertValidsHoursToNumberArray = exports.StatusLineUp = void 0;
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const lineup_json_1 = tslib_1.__importDefault(require("../database/lineup.json"));
const generalController_1 = require("../controller/generalController");
const dayjs = tslib_1.__importStar(require("dayjs"));
const timezone = tslib_1.__importStar(require("dayjs/plugin/timezone"));
const utc = tslib_1.__importStar(require("dayjs/plugin/utc"));
const __1 = require("..");
const fs_1 = tslib_1.__importDefault(require("fs"));
dayjs.extend(timezone.default);
dayjs.extend(utc.default);
const lineUp = lineup_json_1.default;
var StatusLineUp;
(function (StatusLineUp) {
    StatusLineUp[StatusLineUp["Can"] = 0] = "Can";
    StatusLineUp[StatusLineUp["Maybe"] = 1] = "Maybe";
    StatusLineUp[StatusLineUp["Sub"] = 2] = "Sub";
    StatusLineUp[StatusLineUp["Cant"] = 3] = "Cant";
})(StatusLineUp || (exports.StatusLineUp = StatusLineUp = {}));
const lineupPath = "./src/database/lineup.json";
const convertValidsHoursToNumberArray = (hours) => {
    const hoursToArray = hours.split(" ");
    let validsHours = [];
    hoursToArray.forEach((hour) => {
        if (/^(0[0-9]|1[0-9]|2[0-3])$/.test(hour)) {
            validsHours.push(Number(hour));
        }
    });
    return validsHours;
};
exports.convertValidsHoursToNumberArray = convertValidsHoursToNumberArray;
const sortByRoster = async (idRoster, lineup, listMembers) => {
    let lineUpByRoster = [];
    lineup.forEach((element) => {
        let member = listMembers.find((member) => member.id === element.userId);
        if (member?.roles.cache.find((role) => role.id === idRoster)) {
            lineUpByRoster.push(element);
        }
    });
    return lineUpByRoster;
};
const makeLineupFields = (lineUpByRoster, role) => {
    let field = { name: "", inline: false, value: "" };
    let lineupCan = [];
    let lineupMaybe = [];
    lineUpByRoster.forEach((elt) => {
        if (elt.status == 0)
            lineupCan.push(elt.userName);
        if (elt.status == 1)
            lineupMaybe.push(elt.userName);
    });
    field.name = `__YF ${role.name} : (${lineupCan.length}/6)__`;
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
    let field = { name: "", inline: false, value: "" };
    let lineupSub = [];
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
    let field = { name: "", inline: false, value: "" };
    let lineupCant = [];
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
const lineupResponse = async (hours, roles, listMembers) => {
    const hourArray = (0, exports.convertValidsHoursToNumberArray)(hours);
    const isMix = roles.length === 1;
    let response = [];
    hourArray.forEach(async (hour) => {
        const _lineUpData = JSON.parse(fs_1.default.readFileSync(lineupPath, "utf-8"));
        const lineUpByHour = _lineUpData.lineup[hour];
        let embed = makeEmbedLineup(hour.toString(), isMix);
        for (const role of roles) {
            console.log(role.name);
            const sortedData = await sortByRoster(role.id, lineUpByHour, listMembers);
            embed.addFields(makeLineupFields(sortedData, role));
        }
        if (lineUpByHour.findIndex((elt) => elt.status == StatusLineUp.Sub) != -1)
            embed.addFields(makeSubFields(lineUpByHour));
        if (lineUpByHour.findIndex((elt) => elt.status == StatusLineUp.Cant) != -1)
            embed.addFields(makeCantFields(lineUpByHour));
        const buttonList = makeButtonList(hour, isMix);
        const res = {
            embed: [embed],
            buttons: buttonList,
        };
        response.push(res);
    });
    return response;
};
exports.lineupResponse = lineupResponse;
function getTimestampForHour(hour) {
    const offsetWithFrance = getTimezoneOffsetInHours("Europe/Paris");
    let now = new Date(Date.now());
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
        .setEmoji("<:refresh:1053464938380808252>")
        .setLabel(labelView)
        .setStyle(discord_js_1.ButtonStyle.Secondary));
};
const addMember = (hour, member, status) => {
    let lineupByHour = lineUp.lineup[parseInt(hour)];
    const index = lineupByHour.findIndex((elt) => elt.userId === member.id);
    if (index === -1) {
        lineupByHour.push({
            userId: member.id,
            userName: member.username,
            status: status,
        });
        (0, generalController_1.saveJSONToFile)(lineUp, lineupPath);
        return `${member.username} bien ajouté à ${timestampDiscord(getTimestampForHour(hour))}`;
    }
    else {
        if (lineupByHour[index].status !== status) {
            lineupByHour[index].status = status;
            (0, generalController_1.saveJSONToFile)(lineUp, lineupPath);
            return `${member.username} bien passé en ${StatusLineUp[status]} à ${timestampDiscord(getTimestampForHour(hour))}`;
        }
        return `${member.username} est déjà en ${StatusLineUp[status]} à ${timestampDiscord(getTimestampForHour(hour))}`;
    }
};
exports.addMember = addMember;
const resetAllLineups = () => {
    const _lineUpData = JSON.parse(fs_1.default.readFileSync(lineupPath, "utf-8"));
    _lineUpData.lineup.forEach((element, index) => {
        _lineUpData.lineup[index] = [];
    });
    console.log(_lineUpData.lineup);
    (0, generalController_1.saveJSONToFile)(_lineUpData, lineupPath);
};
exports.resetAllLineups = resetAllLineups;
const EditSavedMessages = async (lineup, bot) => {
    const guild = await bot.guilds.cache.get("135721923568074753");
    const fetchedRoles = await guild?.roles.fetch();
    const fetchedMembers = await guild?.members.fetch();
    const channel = await bot.channels.cache.get(lineup.idChannel);
    if (channel.isTextBased()) {
        const msg = await channel.messages.fetch(lineup.id);
        const rolesId = lineup.isMix ? [__1.ROLE_YF] : __1.ROLES;
        let roleList = [];
        fetchedRoles?.forEach((role) => {
            if (rolesId.includes(role.id))
                roleList.push(role);
        });
        (0, generalController_1.sortByRoleId)(roleList, __1.ROLES[0]);
        const res = await (0, exports.lineupResponse)(lineup.hour, roleList, fetchedMembers);
        await msg.edit({
            embeds: res[0].embed,
            components: [res[0].buttons],
        });
    }
};
