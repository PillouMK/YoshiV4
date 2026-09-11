import { Client, GuildMember, PartialGuildMember } from "discord.js";
import { botLogs } from "./generalController";

export const handleTeamUpdate = async (
  bot: Client,
  oldMember: GuildMember | PartialGuildMember,
) => {};

export const playerRosterChange = async (
  bot: Client,
  oldMember: GuildMember | PartialGuildMember,
  newMember: GuildMember | PartialGuildMember,
) => {
  botLogs(bot, `${newMember.user.username} rôle mis à jour`);

  const oldRoles = new Set(oldMember.roles.cache.keys());
  const newRoles = new Set(newMember.roles.cache.keys());

  // Rôles ajoutés
  const addedRoles = [...newRoles].filter((id) => !oldRoles.has(id));

  // Rôles supprimés
  const removedRoles = [...oldRoles].filter((id) => !newRoles.has(id));

  const handleRoleChange = async (roleId: string, isAdded: boolean) => {};

  // Traiter les rôles ajoutés
  for (const roleId of addedRoles) {
    await handleRoleChange(roleId, true);
  }

  // Traiter les rôles supprimés
  for (const roleId of removedRoles) {
    await handleRoleChange(roleId, false);
  }
};
