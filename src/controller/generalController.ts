import fs from "fs";
import { MapMK } from "src/model/mapDAO";
import settings from "../settings.json";
import {
  AttachmentBuilder,
  Client,
  ClientApplication,
  GuildMember,
  PartialGuildMember,
  Role,
  TextChannel,
} from "discord.js";
import { getPlayerById, patchPlayer, postPlayer } from "./yfApiController";

export const saveJSONToFile = <T>(data: T, filePath: string): void => {
  try {
    // Convert object in JSON
    const jsonData = JSON.stringify(data, null, 2); // 2 for indent

    // write content in JSON file
    fs.writeFileSync(filePath, jsonData, "utf-8");

    console.log(`Données sauvegardées dans le fichier : ${filePath}`);
  } catch (error) {
    console.error("Error saving JSON data:", error);
  }
};

export const filterMapList = (LIST_MAPS: MapMK[], value: string) => {
  return LIST_MAPS.filter((map) =>
    map.idMap.toLocaleLowerCase().includes(value)
  ).slice(0, 25);
};

export const sortByRoleId = (roleList: Role[], roleId: string) => {
  roleList.sort((role1, role2) => {
    if (role1.id === roleId) return -1;
    if (role2.id === roleId) return 1;
    return 0;
  });

  return roleList;
};

export const rosterColor = (idRoster: string): number => {
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

export const addBlank = (
  string: string,
  number: number,
  isAfter: boolean = false
): string => {
  if (!isAfter) {
    while (string.length < number) {
      string = ` ` + string;
    }
    return string;
  } else {
    while (string.length < number) {
      string = string + ` `;
    }
    return string;
  }
};

export const YOSHI_FAMILY_LOGO = new AttachmentBuilder(
  "./image/LaYoshiFamily.png"
);

const getCurrentDateTimeString = (): string => {
  const now = new Date();

  // Récupérer les composants de la date
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0"); // +1 car les mois sont indexés à partir de 0
  const day = String(now.getDate()).padStart(2, "0");

  // Récupérer les composants de l'heure
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const seconds = String(now.getSeconds()).padStart(2, "0");

  // Assembler la chaîne formatée
  const dateTimeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;

  return dateTimeString;
};

export const botLogs = async (bot: Client, message: string) => {
  try {
    const channel = (await bot.channels.fetch(
      settings.botLogs.channelId
    )) as TextChannel;
    const msg: string = `\`\`\`${getCurrentDateTimeString()} : ${message}\`\`\``;
    channel.send({ content: msg });
  } catch (e) {
    console.log(e);
  }
};

export const playerAddInGuild = async (bot: Client, member: GuildMember) => {
  if (member.guild.id === "135721923568074753") {
    let player = await getPlayerById(member.user.id);
    if (player.statusCode === 404) {
      let addPlayer = await postPlayer(
        member.user.id,
        member.user.username,
        "NR"
      );
      if (addPlayer.statusCode === 201) {
        botLogs(bot, `${member.user.username} a rejoins le serveur`);
        console.log(`${member.user.username} bien ajouté`);
      } else if (addPlayer.statusCode === 404) {
        botLogs(bot, `Erreur ajout pour : ${addPlayer.data}`);
        console.log("fail ajout :", addPlayer.data);
      } else {
        botLogs(bot, `Erreur API ajout pour : ${addPlayer.data}`);
        console.log(`Problème API lors de l'ajout de ${member.user.username}`);
      }
    } else if (player.statusCode === 200) {
      botLogs(bot, `${member.user.username} est revenu sur le serveur`);
      console.log(`${member.user.username} existe déjà`);
    }
  } else {
    console.log("wrong server");
  }
};

export const playerRemovedInGuild = async (
  bot: Client,
  member: GuildMember | PartialGuildMember
) => {
  if (member.guild.id === "135721923568074753") {
    botLogs(bot, `${member.user.username} a quitté le serveur`);
    let playerRemoved = await patchPlayer(member.id, undefined, "NR");
    if (playerRemoved.statusCode === 200) {
      botLogs(bot, `${member.user.username} role mise à jour: NR`);
      console.log(`${member.user.username} bien update`);
    } else {
      botLogs(bot, `${member.user.username} erreur lors de l'update du rôle`);
      console.log("erreur update", playerRemoved.data);
    }
  } else {
    console.log("wrong server");
  }
};

const galaxy_id = "643871029210513419";
const odyssey_id = "643569712353116170";

export const playerRosterChange = async (
  bot: Client,
  oldMember: GuildMember | PartialGuildMember,
  newMember: GuildMember | PartialGuildMember
) => {
  botLogs(bot, `${newMember.user.username} rôle mis à jour`);

  const oldRoles = new Set(oldMember.roles.cache.keys());
  const newRoles = new Set(newMember.roles.cache.keys());

  // Rôles ajoutés
  const addedRoles = [...newRoles].filter((id) => !oldRoles.has(id));

  // Rôles supprimés
  const removedRoles = [...oldRoles].filter((id) => !newRoles.has(id));

  const handleRoleChange = async (roleId: string, isAdded: boolean) => {
    if (roleId === galaxy_id || roleId === odyssey_id) {
      const idRoster = roleId === galaxy_id ? "YFG" : "YFO";

      if (isAdded) {
        // Rôle ajouté
        const result = await patchPlayer(
          newMember.user.id,
          newMember.user.username,
          idRoster
        );
        if (result.statusCode === 200) {
          console.log(`${newMember.user.username} est désormais ${idRoster}`);
        } else {
          console.error("Échec de la modification :", result.data);
        }
      } else {
        // Rôle supprimé
        const hasOppositeRole =
          roleId === galaxy_id
            ? newRoles.has(odyssey_id)
            : newRoles.has(galaxy_id);

        const newRoster = hasOppositeRole
          ? roleId === galaxy_id
            ? "YFO"
            : "YFG"
          : "NR";

        const result = await patchPlayer(
          newMember.user.id,
          newMember.user.username,
          newRoster
        );
        if (result.statusCode === 200) {
          console.log(`${newMember.user.username} est désormais ${newRoster}`);
        } else {
          console.error("Échec de la modification :", result.data);
        }
      }
    }
  };

  // Traiter les rôles ajoutés
  for (const roleId of addedRoles) {
    await handleRoleChange(roleId, true);
  }

  // Traiter les rôles supprimés
  for (const roleId of removedRoles) {
    await handleRoleChange(roleId, false);
  }
};
