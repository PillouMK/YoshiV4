import {
  Embed,
  EmbedBuilder,
  ButtonBuilder,
  Collection,
  GuildMember,
  Role,
  APIEmbedField,
  ActionRowBuilder,
  ButtonStyle,
  User,
  Client,
} from "discord.js";
import lineUpData from "../database/lineup.json";
import { saveJSONToFile, sortByRoleId } from "../controller/generalController";
import { timeStamp } from "console";
import * as dayjs from "dayjs";
import * as timezone from "dayjs/plugin/timezone";
import * as utc from "dayjs/plugin/utc";
import { off } from "process";
import { ROLE_YF, ROLES } from "..";
import fs from "fs";
dayjs.extend(timezone.default);
dayjs.extend(utc.default);

const lineUp: LineUpData = lineUpData as LineUpData;

interface LineUpData {
  lineup: LineUpItem[][];
}

export type LineUpMessage = {
  embed: EmbedBuilder[];
  buttons: ActionRowBuilder<ButtonBuilder>;
};

export enum StatusLineUp {
  Can,
  Maybe,
  Sub,
  Cant,
}

export type LineUpItem = {
  userId: string;
  userName: string;
  status: StatusLineUp;
};

export type LineUp = {
  hour: string;
  isMix: boolean;
  id: string;
  idChannel: string;
};

const lineupPath: string = "./src/database/lineup.json";

export const convertValidsHoursToNumberArray = (hours: string): number[] => {
  const hoursToArray: string[] = hours.split(" ");
  let validsHours: number[] = [];
  hoursToArray.forEach((hour) => {
    if (/^(0[0-9]|1[0-9]|2[0-3])$/.test(hour)) {
      validsHours.push(Number(hour));
    }
  });
  return validsHours;
};

const sortByRoster = async (
  idRoster: string,
  lineup: LineUpItem[],
  listMembers: Collection<string, GuildMember>
): Promise<LineUpItem[]> => {
  let lineUpByRoster: LineUpItem[] = [];
  lineup.forEach((element) => {
    let member = listMembers.find((member) => member.id === element.userId);
    if (member?.roles.cache.find((role) => role.id === idRoster)) {
      lineUpByRoster.push(element);
    }
  });
  return lineUpByRoster;
};

const makeLineupFields = (
  lineUpByRoster: LineUpItem[],
  role: Role
): APIEmbedField => {
  let field: APIEmbedField = { name: "", inline: false, value: "" };
  let lineupCan: string[] = [];
  let lineupMaybe: string[] = [];

  lineUpByRoster.forEach((elt: LineUpItem) => {
    if (elt.status == 0) lineupCan.push(elt.userName);
    if (elt.status == 1) lineupMaybe.push(elt.userName);
  });

  field.name = `__YF ${role.name} : (${lineupCan.length}/6)__`;

  if (lineupCan.length > 0) {
    field.value = `${lineupCan.join(" / ")}`;
    field.value += lineupMaybe.length > 0 ? " / " : "";
  }
  if (lineupMaybe.length > 0) {
    field.value += `(${lineupMaybe.join(") / (")})`;
  }
  if (lineupCan.length < 6) field.value += ` +${6 - lineupCan.length}`;
  return field;
};

const makeSubFields = (lineUp: LineUpItem[]): APIEmbedField => {
  let field: APIEmbedField = { name: "", inline: false, value: "" };
  let lineupSub: string[] = [];

  lineUp.forEach((elt: LineUpItem) => {
    if (elt.status == 2) lineupSub.push(elt.userName);
  });

  field.name = `__Subs : (${lineupSub.length})__`;

  if (lineupSub.length > 0) {
    field.value = `${lineupSub.join(" / ")}`;
  } else {
    field.value = `Aucun Sub`;
  }
  return field;
};

const makeCantFields = (lineUp: LineUpItem[]): APIEmbedField => {
  let field: APIEmbedField = { name: "", inline: false, value: "" };
  let lineupCant: string[] = [];

  lineUp.forEach((elt: LineUpItem) => {
    if (elt.status == 3) lineupCant.push(elt.userName);
  });

  field.name = `__Cant : (${lineupCant.length})__`;

  if (lineupCant.length > 0) {
    field.value = `${lineupCant.join(" / ")}`;
  } else {
    field.value = `Aucun can't`;
  }
  return field;
};

export const lineupResponse = async (
  hours: string,
  roles: Role[],
  listMembers: Collection<string, GuildMember>
): Promise<LineUpMessage[]> => {
  const hourArray: number[] = convertValidsHoursToNumberArray(hours);
  const isMix: boolean = roles.length === 1;
  let response: LineUpMessage[] = [];
  hourArray.forEach(async (hour) => {
    const _lineUpData = JSON.parse(
      fs.readFileSync(lineupPath, "utf-8")
    ) as LineUpData;
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
    const res: LineUpMessage = {
      embed: [embed],
      buttons: buttonList,
    };
    response.push(res);
  });
  return response;
};

function getTimestampForHour(hour: string): string {
  const offsetWithFrance = getTimezoneOffsetInHours("Europe/Paris");
  let now = new Date(Date.now());
  now.setHours(parseInt(hour) + offsetWithFrance, 0, 0, 0);
  return (now.valueOf() / 1000).toString();
}

const timestampDiscord = (timeStamp: string): string => `<t:${timeStamp}:t>`;

const getTimezoneOffsetInHours = (targetTimeZone: string) => {
  const serverTime = dayjs.default();
  const targetTime = serverTime.tz(targetTimeZone);
  return serverTime.utcOffset() / 60 - targetTime.utcOffset() / 60;
};

const makeEmbedLineup = (hour: string, isMix: boolean): EmbedBuilder => {
  const isMixLabel = !isMix ? "Line up par roster" : "Line up mixte";
  const timestamp: string = timestampDiscord(getTimestampForHour(hour));
  const title: string = `${isMixLabel} ${timestamp} :`;

  return new EmbedBuilder()
    .setColor(3066993)
    .setTitle(title)
    .setTimestamp(new Date())
    .setFooter({ text: isMixLabel });
};

const makeButtonList = (
  hour: number,
  isMix: boolean
): ActionRowBuilder<ButtonBuilder> => {
  const labelView: string = !isMix
    ? "Voir line up mixte"
    : "Voir line up roster";
  const idView = !isMix ? "roster" : "mix";
  const idViewToggle = isMix ? "roster" : "mix";
  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`can-${hour.toString()}-${idView}`)
        .setLabel(`Can`)
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`maybe-${hour.toString()}-${idView}`)
        .setLabel(`Maybe`)
        .setStyle(ButtonStyle.Primary)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`sub-${hour.toString()}-${idView}`)
        .setLabel(`Sub`)
        .setStyle(ButtonStyle.Secondary)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`cant-${hour.toString()}-${idView}`)
        .setLabel(`Can't`)
        .setStyle(ButtonStyle.Danger)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`lineupToggle-${hour.toString()}-${idViewToggle}`)
        .setEmoji("<:refresh:1053464938380808252>")
        .setLabel(labelView)
        .setStyle(ButtonStyle.Secondary)
    );
};

export const addMember = (
  hour: string,
  member: User,
  status: StatusLineUp
): string => {
  let lineupByHour = lineUp.lineup[parseInt(hour)];
  const index = lineupByHour.findIndex((elt) => elt.userId === member.id);
  if (index === -1) {
    lineupByHour.push({
      userId: member.id,
      userName: member.username,
      status: status,
    });
    saveJSONToFile(lineUp, lineupPath);
    return `${member.username} bien ajouté à ${timestampDiscord(
      getTimestampForHour(hour)
    )}`;
  } else {
    if (lineupByHour[index].status !== status) {
      lineupByHour[index].status = status;
      saveJSONToFile(lineUp, lineupPath);
      return `${member.username} bien passé en ${
        StatusLineUp[status]
      } à ${timestampDiscord(getTimestampForHour(hour))}`;
    }
    return `${member.username} est déjà en ${
      StatusLineUp[status]
    } à ${timestampDiscord(getTimestampForHour(hour))}`;
  }
};

export const resetAllLineups = () => {
  const _lineUpData = JSON.parse(fs.readFileSync(lineupPath, "utf-8"));
  _lineUpData.lineup.forEach((element: any, index: string | number) => {
    _lineUpData.lineup[index] = [];
  });
  console.log(_lineUpData.lineup);
  saveJSONToFile(_lineUpData, lineupPath);
};

const EditSavedMessages = async (lineup: LineUp, bot: Client) => {
  const guild = await bot.guilds.cache.get("135721923568074753");
  const fetchedRoles = await guild?.roles.fetch();
  const fetchedMembers = await guild?.members.fetch();
  const channel = await bot.channels.cache.get(lineup.idChannel);
  if (channel!.isTextBased()) {
    const msg = await channel!.messages.fetch(lineup.id);
    const rolesId: string[] = lineup.isMix ? [ROLE_YF] : ROLES;
    let roleList: Role[] = [];
    fetchedRoles?.forEach((role) => {
      if (rolesId.includes(role.id)) roleList.push(role);
    });
    sortByRoleId(roleList, ROLES[0]);
    const res: LineUpMessage[] = await lineupResponse(
      lineup.hour,
      roleList,
      fetchedMembers!
    );
    await msg.edit({
      embeds: res[0].embed,
      components: [res[0].buttons],
    });
  }
};
