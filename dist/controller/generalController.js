"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerRosterChange = exports.playerRemovedInGuild = exports.playerAddInGuild = exports.botLogs = exports.YOSHI_FAMILY_LOGO = exports.addBlank = exports.rosterColor = exports.sortByRoleId = exports.filterMapList = exports.saveJSONToFile = void 0;
const tslib_1 = require("tslib");
const fs_1 = tslib_1.__importDefault(require("fs"));
const settings_json_1 = tslib_1.__importDefault(require("../settings.json"));
const discord_js_1 = require("discord.js");
const yfApiController_1 = require("./yfApiController");
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
const playerAddInGuild = async (bot, member) => {
    if (member.guild.id === "135721923568074753") {
        let player = await (0, yfApiController_1.getPlayerById)(member.user.id);
        if (player.statusCode === 404) {
            let addPlayer = await (0, yfApiController_1.postPlayer)(member.user.id, member.user.username, "NR");
            if (addPlayer.statusCode === 201) {
                (0, exports.botLogs)(bot, `${member.user.username} a rejoins le serveur`);
                console.log(`${member.user.username} bien ajouté`);
            }
            else if (addPlayer.statusCode === 404) {
                (0, exports.botLogs)(bot, `Erreur ajout pour : ${addPlayer.data}`);
                console.log("fail ajout :", addPlayer.data);
            }
            else {
                (0, exports.botLogs)(bot, `Erreur API ajout pour : ${addPlayer.data}`);
                console.log(`Problème API lors de l'ajout de ${member.user.username}`);
            }
        }
        else if (player.statusCode === 200) {
            (0, exports.botLogs)(bot, `${member.user.username} est revenu sur le serveur`);
            console.log(`${member.user.username} existe déjà`);
        }
    }
    else {
        console.log("wrong server");
    }
};
exports.playerAddInGuild = playerAddInGuild;
const playerRemovedInGuild = async (bot, member) => {
    if (member.guild.id === "135721923568074753") {
        (0, exports.botLogs)(bot, `${member.user.username} a quitté le serveur`);
        let playerRemoved = await (0, yfApiController_1.patchPlayer)(member.id, undefined, "NR");
        if (playerRemoved.statusCode === 200) {
            (0, exports.botLogs)(bot, `${member.user.username} role mise à jour: NR`);
            console.log(`${member.user.username} bien update`);
        }
        else {
            (0, exports.botLogs)(bot, `${member.user.username} erreur lors de l'update du rôle`);
            console.log("erreur update", playerRemoved.data);
        }
    }
    else {
        console.log("wrong server");
    }
};
exports.playerRemovedInGuild = playerRemovedInGuild;
const galaxy_id = "643871029210513419";
const odyssey_id = "643569712353116170";
const playerRosterChange = async (bot, oldMember, newMember) => {
    (0, exports.botLogs)(bot, `${newMember.user.username} rôle mis à jour`);
    const oldRoles = new Set(oldMember.roles.cache.keys());
    const newRoles = new Set(newMember.roles.cache.keys());
    const addedRoles = [...newRoles].filter((id) => !oldRoles.has(id));
    const removedRoles = [...oldRoles].filter((id) => !newRoles.has(id));
    const handleRoleChange = async (roleId, isAdded) => {
        if (roleId === galaxy_id || roleId === odyssey_id) {
            const idRoster = roleId === galaxy_id ? "YFG" : "YFO";
            if (isAdded) {
                const result = await (0, yfApiController_1.patchPlayer)(newMember.user.id, newMember.user.username, idRoster);
                if (result.statusCode === 200) {
                    console.log(`${newMember.user.username} est désormais ${idRoster}`);
                }
                else {
                    console.error("Échec de la modification :", result.data);
                }
            }
            else {
                const hasOppositeRole = roleId === galaxy_id
                    ? newRoles.has(odyssey_id)
                    : newRoles.has(galaxy_id);
                const newRoster = hasOppositeRole
                    ? roleId === galaxy_id
                        ? "YFO"
                        : "YFG"
                    : "NR";
                const result = await (0, yfApiController_1.patchPlayer)(newMember.user.id, newMember.user.username, newRoster);
                if (result.statusCode === 200) {
                    console.log(`${newMember.user.username} est désormais ${newRoster}`);
                }
                else {
                    console.error("Échec de la modification :", result.data);
                }
            }
        }
    };
    for (const roleId of addedRoles) {
        await handleRoleChange(roleId, true);
    }
    for (const roleId of removedRoles) {
        await handleRoleChange(roleId, false);
    }
};
exports.playerRosterChange = playerRosterChange;
