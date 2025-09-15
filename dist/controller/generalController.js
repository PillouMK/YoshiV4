"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.makeMessageLink = exports.playerRosterChange = exports.playerRemovedInGuild = exports.playerAddInGuild = exports.botLogs = exports.MK_MINIA_ATTACHMENT = exports.YOSHI_FAMILY_LOGO = exports.addBlank = exports.rosterColor = exports.sortByRoleId = exports.filterMapList = exports.saveJSONToFile = void 0;
exports.generateMatchPreviewText = generateMatchPreviewText;
exports.parseMatchPreviewText = parseMatchPreviewText;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const settings_json_1 = tslib_1.__importDefault(require("../settings.json"));
const discord_js_1 = require("discord.js");
const saveJSONToFile = (data, filePath) => {
    try {
        const jsonData = JSON.stringify(data, null, 2);
        fs_1.default.writeFileSync(filePath, jsonData, "utf-8");
        console.log(`Données sauvegardées dans le fichier : ${filePath}`);
    }
    catch (error) {
        console.error("Error saving JSON data:", error);
    }
};
exports.saveJSONToFile = saveJSONToFile;
const filterMapList = (LIST_MAPS, value) => {
    return LIST_MAPS.filter((map) => map.tag.toLocaleLowerCase().includes(value)).slice(0, 25);
};
exports.filterMapList = filterMapList;
const sortByRoleId = (roleList, roleId) => {
    roleList.sort((role1, role2) => {
        if (role1.id === roleId)
            return -1;
        if (role2.id === roleId)
            return 1;
        return 0;
    });
    return roleList;
};
exports.sortByRoleId = sortByRoleId;
const rosterColor = (idRoster) => {
    switch (idRoster) {
        case "YFG":
            return 0x2ecc71;
        case "YFO":
            return 0x3498db;
        case "YFS":
            return 0xff9c41;
        default:
            return 0x2ecc71;
    }
};
exports.rosterColor = rosterColor;
const addBlank = (string, number, isAfter = false) => {
    if (!isAfter) {
        while (string.length < number) {
            string = ` ` + string;
        }
        return string;
    }
    else {
        while (string.length < number) {
            string = string + ` `;
        }
        return string;
    }
};
exports.addBlank = addBlank;
exports.YOSHI_FAMILY_LOGO = new discord_js_1.AttachmentBuilder("./image/LaYoshiFamily.png");
const MK_MINIA_ATTACHMENT = (game_id, map_tag) => {
    return new discord_js_1.AttachmentBuilder(`./image/${game_id}/${map_tag}.png`);
};
exports.MK_MINIA_ATTACHMENT = MK_MINIA_ATTACHMENT;
const getCurrentDateTimeString = () => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, "0");
    const day = String(now.getDate()).padStart(2, "0");
    const hours = String(now.getHours()).padStart(2, "0");
    const minutes = String(now.getMinutes()).padStart(2, "0");
    const seconds = String(now.getSeconds()).padStart(2, "0");
    const dateTimeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    return dateTimeString;
};
const botLogs = async (bot, message) => {
    try {
        const channel = (await bot.channels.fetch(settings_json_1.default.botLogs.channelId));
        const msg = `\`\`\`${getCurrentDateTimeString()} : ${message}\`\`\``;
        channel.send({ content: msg });
    }
    catch (e) {
        console.log(e);
    }
};
exports.botLogs = botLogs;
const playerAddInGuild = async (bot, member) => { };
exports.playerAddInGuild = playerAddInGuild;
const playerRemovedInGuild = async (bot, member) => { };
exports.playerRemovedInGuild = playerRemovedInGuild;
const galaxy_id = "643871029210513419";
const odyssey_id = "643569712353116170";
const playerRosterChange = async (bot, oldMember, newMember) => {
    (0, exports.botLogs)(bot, `${newMember.user.username} rôle mis à jour`);
    const oldRoles = new Set(oldMember.roles.cache.keys());
    const newRoles = new Set(newMember.roles.cache.keys());
    const addedRoles = [...newRoles].filter((id) => !oldRoles.has(id));
    const removedRoles = [...oldRoles].filter((id) => !newRoles.has(id));
    const handleRoleChange = async (roleId, isAdded) => { };
    for (const roleId of addedRoles) {
        await handleRoleChange(roleId, true);
    }
    for (const roleId of removedRoles) {
        await handleRoleChange(roleId, false);
    }
};
exports.playerRosterChange = playerRosterChange;
function generateMatchPreviewText(users) {
    const lines = users.map((user) => `${user.username} - ${user.id} - SCORE +`);
    const opponentLines = Array(6).fill("joueurX - FLAG - SCORE +");
    return [...lines, "|", ...opponentLines].join("\n");
}
function parseMatchPreviewText(input, title, theme) {
    const own_team = [];
    const opponent_team = [];
    const [table, table2] = input.trim().replace(/\s/g, "").split("|");
    const own_team_table = table.split("+");
    const opponent_team_table = table2.split("+");
    for (const elt of own_team_table) {
        if (elt === "")
            continue;
        const [name, id, score] = elt.split("-");
        const nb_race = checkNumberOfRaces(name);
        const _score = Number(score);
        if (isNaN(_score)) {
            return `${score} n'est pas un nombre`;
        }
        if (nb_race) {
            own_team.push({
                score: _score,
                user_id: id,
                number_race: nb_race,
            });
        }
        else {
            own_team.push({
                score: _score,
                user_id: id,
            });
        }
    }
    for (const elt of opponent_team_table) {
        if (elt === "")
            continue;
        const [name, flag, score] = elt.split("-");
        const nb_race = checkNumberOfRaces(name);
        const _score = Number(score);
        if (isNaN(_score)) {
            return `${score} n'est pas un nombre`;
        }
        if (nb_race) {
            opponent_team.push({
                name: name,
                score: _score,
                number_race: nb_race,
                ...(flag !== "FLAG" && { flag }),
            });
        }
        else {
            opponent_team.push({
                name: name,
                score: _score,
                ...(flag !== "FLAG" && { flag }),
            });
        }
    }
    return {
        own_team,
        opponent_team,
        ...(title && { title }),
        ...(theme && { theme }),
    };
}
function checkNumberOfRaces(text) {
    const match = text.match(/\((\d+)\)$/);
    if (match) {
        return Number(match[1]);
    }
    return undefined;
}
const makeMessageLink = (team_id, msg_id) => {
    return `https://discord.com/channels/${team_id}/${msg_id}`;
};
exports.makeMessageLink = makeMessageLink;
