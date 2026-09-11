"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerRosterChange = exports.handleTeamUpdate = void 0;
const generalController_1 = require("./generalController");
const handleTeamUpdate = async (bot, oldMember) => { };
exports.handleTeamUpdate = handleTeamUpdate;
const playerRosterChange = async (bot, oldMember, newMember) => {
    (0, generalController_1.botLogs)(bot, `${newMember.user.username} rôle mis à jour`);
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
