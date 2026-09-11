import { MapMK_V2 } from "src/model/map.dto";
import settings from "../settings.json";
import {
  AttachmentBuilder,
  Client,
  GuildMember,
  PartialGuildMember,
  Role,
  TextChannel,
  User,
} from "discord.js";
import { MatchOpponent, MatchPreview, MatchUser } from "../model/match.dto";
import path from "path";
import { JsonStore } from "../model/json";
import { _createUser, _getUser } from "./yfApiController";
import { UserCreate } from "../model/user.dto";

interface FriendCodes {
  friendcode: {
    [idPlayer: string]: string;
  };
  names: {
    [idPlayer: string]: string;
  };
}

const friendcodePath = path.resolve(process.cwd(), "data", "fc.json");
const DEFAULT_FRIEND_CODE: FriendCodes = {
  friendcode: {},
  names: {},
};
const friencodeStore = new JsonStore<FriendCodes>(
  friendcodePath,
  DEFAULT_FRIEND_CODE,
);
const friendcode = friencodeStore.load();

export const saveUserFriendCode = (user_id: string, fc: string): string => {
  const TEXT =
    friendcode.friendcode[user_id] != undefined
      ? "Code ami modifié"
      : "Code ami ajouté";
  friendcode.friendcode[user_id] = fc;
  friencodeStore.save(friendcode);
  return TEXT;
};

export const getUserFriendCode = (user_id: string): string => {
  if (friendcode.friendcode[user_id]) return friendcode.friendcode[user_id];
  else return "Pas de code-ami enregistré";
};

export const filterMapList = (LIST_MAPS: MapMK_V2[], value: string) => {
  return LIST_MAPS.filter((map) =>
    map.tag.toLocaleLowerCase().includes(value),
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
  isAfter: boolean = false,
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
  "./image/LaYoshiFamily.png",
);

export const MK_MINIA_ATTACHMENT = (
  game_id: string,
  map_tag: string,
): AttachmentBuilder => {
  return new AttachmentBuilder(`./image/${game_id}/${map_tag}.png`);
};

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
      settings.botLogs.channelId,
    )) as TextChannel;
    const msg: string = `\`\`\`${getCurrentDateTimeString()} : ${message}\`\`\``;
    channel.send({ content: msg });
  } catch (e) {
    console.log(e);
  }
};

export const playerAddInGuild = async (bot: Client, member: GuildMember) => {
  const player = await _getUser(member.id);
  if (player.statusCode === 200) {
    botLogs(
      bot,
      `${member.user.username} joined the server and is already in the database`,
    );
    console.log(
      `${member.user.username} joined the server and is already in the database`,
    );
  } else {
    const user: UserCreate = {
      id: member.id,
      name: member.user.username,
      flag: "fr",
    };
    const addPlayer = await _createUser(user);
    if (addPlayer.statusCode === 201) {
      botLogs(
        bot,
        `${member.user.username} joined the server and was added to the database`,
      );
      console.log(
        `${member.user.username} joined the server and was added to the database`,
      );
    } else {
      botLogs(
        bot,
        `${member.user.username} joined the server but could not be added to the database`,
      );
      botLogs(
        bot,
        `Error: ${addPlayer.statusCode} - ${JSON.stringify(addPlayer.data)}`,
      );
      console.log(
        `${member.user.username} joined the server but could not be added to the database`,
      );
      console.log(
        `Error: ${addPlayer.statusCode} - ${JSON.stringify(addPlayer.data)}`,
      );
    }
  }
};

export const playerRemovedInGuild = async (
  bot: Client,
  member: GuildMember | PartialGuildMember,
) => {};

// Match

export function generateMatchPreviewText(users: User[]): string {
  const lines = users.map((user) => `${user.username} - ${user.id} - SCORE +`);
  const opponentLines = Array(6).fill("joueurX - SCORE +");
  return [...lines, "|", ...opponentLines].join("\n");
}

export function parseMatchPreviewText(
  input: string,
  title?: string | null,
  theme?: string | null,
): MatchPreview | string {
  const own_team: MatchUser[] = [];
  const opponent_team: MatchOpponent[] = [];

  const [table, table2] = input.trim().replace(/\s/g, "").split("|");

  const own_team_table = table.split("+");
  const opponent_team_table = table2.split("+");

  for (const elt of own_team_table) {
    if (elt === "") continue;
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
    } else {
      own_team.push({
        score: _score,
        user_id: id,
      });
    }
  }

  for (const elt of opponent_team_table) {
    if (elt === "") continue;
    const [name, score] = elt.split("-");
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
      });
    } else {
      opponent_team.push({
        name: name,
        score: _score,
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

function checkNumberOfRaces(text: string): number | undefined {
  const match = text.match(/\((\d+)\)$/);
  if (match) {
    return Number(match[1]);
  }
  return undefined;
}

export const makeMessageLink = (team_id: string, msg_id: string): string => {
  return `https://discord.com/channels/${team_id}/${msg_id}`;
};
