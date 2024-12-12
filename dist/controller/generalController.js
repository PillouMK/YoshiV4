"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.botLogs = exports.YOSHI_FAMILY_LOGO = exports.addBlank = exports.rosterColor = exports.sortByRoleId = exports.filterMapList = exports.saveJSONToFile = void 0;
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
    return LIST_MAPS.filter((map) => map.idMap.toLocaleLowerCase().includes(value)).slice(0, 25);
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
