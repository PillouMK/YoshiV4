import {
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
  TextChannel,
} from "discord.js";
import * as dayjs from "dayjs";
import * as timezone from "dayjs/plugin/timezone";
import * as utc from "dayjs/plugin/utc";
import fs from "fs";
import { globalData } from "../global";
import { UserBDD } from "../model/user.dto";
import { Roster } from "../model/roster.dto";
import path from "path";
import { JsonStore } from "../model/json";
dayjs.extend(timezone.default);
dayjs.extend(utc.default);

const lineupPath = path.resolve(process.cwd(), "data", "lineup.json");
const DEFAULT_LINEUP: LineUpData = {
  lineup: [],
  save: [],
  temp_save: [],
};
const lineupStore = new JsonStore<LineUpData>(lineupPath, DEFAULT_LINEUP);
const lineup = lineupStore.load();

interface LineUpData {
  lineup: LineUpItem[][];
  save: LineUp[];
  temp_save: LineUp[];
}

export type LineUpMessage = {
  embed: EmbedBuilder[];
  buttons: ActionRowBuilder<ButtonBuilder>;
  hour: string;
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
  roster?: string;
  status: StatusLineUp;
};

export type LineUp = {
  hour: string;
  isMix: boolean;
  id: string;
  idChannel: string;
};

export const convertValidsHoursToNumberArray = (hours: string): number[] => {
  const hoursToArray: string[] = hours.split(" ");
  const validsHours: number[] = [];
  hoursToArray.forEach((hour) => {
    if (/^(0[0-9]|1[0-9]|2[0-3])$/.test(hour)) {
      validsHours.push(Number(hour));
    }
  });
  return validsHours;
};

const sortByRoster = async (
  roster_id: string,
  lineup: LineUpItem[],
): Promise<LineUpItem[]> => {
  const lineUpByRoster: LineUpItem[] = [];
  lineup.forEach((element) => {
    if (element.roster === roster_id) {
      lineUpByRoster.push(element);
    }
  });
  return lineUpByRoster;
};

const makeLineupFields = (
  lineUpByRoster: LineUpItem[],
  name?: string,
): APIEmbedField => {
  const field: APIEmbedField = { name: "", inline: false, value: "" };
  const lineupCan: string[] = [];
  const lineupMaybe: string[] = [];

  lineUpByRoster.forEach((elt: LineUpItem) => {
    if (elt.status == 0) lineupCan.push(elt.userName);
    if (elt.status == 1) lineupMaybe.push(elt.userName);
  });

  field.name = `__YF ${name} : (${lineupCan.length}/6)__`;

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
  const field: APIEmbedField = { name: "", inline: false, value: "" };
  const lineupSub: string[] = [];

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
  const field: APIEmbedField = { name: "", inline: false, value: "" };
  const lineupCant: string[] = [];

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
  isMix: boolean,
  team: string,
): Promise<LineUpMessage[]> => {
  const hourArray: number[] = convertValidsHoursToNumberArray(hours);
  const response: LineUpMessage[] = [];
  for (const hour of hourArray) {
    const _lineUpData = JSON.parse(
      fs.readFileSync(lineupPath, "utf-8"),
    ) as LineUpData;
    const lineUpByHour = _lineUpData.lineup[hour];
    const _team = globalData.getTeam(team);
    const embed = makeEmbedLineup(hour.toString(), isMix);

    if (isMix) {
      embed.addFields(makeLineupFields(lineUpByHour, _team?.name));
    } else {
      let rosters: Roster[] | undefined = _team?.rosters;
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
    const res: LineUpMessage = {
      embed: [embed],
      buttons: buttonList,
      hour: hour.toString(),
    };
    response.push(res);
  }
  return response;
};

function getTimestampForHour(hour: string): string {
  const offsetWithFrance = getTimezoneOffsetInHours("Europe/Paris");
  const now = new Date(Date.now());
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
  isMix: boolean,
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
        .setStyle(ButtonStyle.Success),
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`maybe-${hour.toString()}-${idView}`)
        .setLabel(`Maybe`)
        .setStyle(ButtonStyle.Primary),
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`sub-${hour.toString()}-${idView}`)
        .setLabel(`Sub`)
        .setStyle(ButtonStyle.Secondary),
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`cant-${hour.toString()}-${idView}`)
        .setLabel(`Can't`)
        .setStyle(ButtonStyle.Danger),
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`lineupToggle-${hour.toString()}-${idViewToggle}`)
        .setEmoji("<:refresh:1359564875419877669>")
        .setLabel(labelView)
        .setStyle(ButtonStyle.Secondary),
    );
};

export const addMember = (
  hour: string,
  member: UserBDD,
  status: StatusLineUp,
): string => {
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
    return `${member.name} ajouté en **${
      StatusLineUp[status]
    }** à ${timestampDiscord(getTimestampForHour(hour))}`;
  } else {
    if (lineupByHour[index].status !== status) {
      lineupByHour[index].status = status;
      lineupStore.save(lineup);
      return `${name} bien passé en **${
        StatusLineUp[status]
      }** à ${timestampDiscord(getTimestampForHour(hour))}`;
    }
    return `${name} est déjà en **${
      StatusLineUp[status]
    }** à ${timestampDiscord(getTimestampForHour(hour))}`;
  }
};

export const resetAllLineups = async (bot: Client, team: string) => {
  for (const msg of lineup.temp_save) {
    deleteLineupMsgById(msg.id, msg.idChannel, bot);
  }
  lineup.temp_save = [];
  lineup.lineup.forEach((element: any, index: number) => {
    lineup.lineup[index] = [];
  });
  (lineup.save as LineUp[]).forEach(async (elt) => {
    await EditSavedMessages(elt, bot, team);
  });
  lineupStore.save(lineup);
};

const deleteLineupMsgById = async (
  idMsg: string,
  idChannel: string,
  bot: Client,
) => {
  try {
    const channel = await bot.channels.fetch(idChannel);

    if (channel && channel.isTextBased() && channel instanceof TextChannel) {
      const message = await channel.messages.fetch(idMsg);
      await message.delete();
      console.log(`Message avec l'ID ${idMsg} supprimé.`);
    } else {
      console.error("Le canal spécifié n'est pas un TextChannel.");
    }
  } catch (error) {
    console.error(
      "Erreur lors de la récupération ou de la suppression du message :",
      error,
    );
  }
};

export const updateLineupsByHour = async (
  bot: Client,
  hour: string,
  team: string,
) => {
  const lineupTempMsg = lineup.temp_save.filter((elt) => elt.hour === hour);
  for (const lineup of lineupTempMsg) {
    EditSavedMessages(lineup, bot, team);
  }
  const lineupSavedMsg = lineup.save.filter((elt) => elt.hour === hour);
  for (const lineup of lineupSavedMsg) {
    EditSavedMessages(lineup, bot, team);
  }
};

export const pushTempMessage = (
  idMsg: string,
  idChannel: string,
  hour: string,
) => {
  const temp_lineup: LineUp = {
    id: idMsg,
    idChannel: idChannel,
    hour: hour,
    isMix: false,
  };
  lineup.temp_save.push(temp_lineup);
  lineupStore.save(lineup);
};

export const toggleMessage = (idMsg: string, isMix: boolean) => {
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

export const EditSavedMessages = async (
  lineup: LineUp,
  bot: Client,
  team: string,
) => {
  const channel = bot.channels.cache.get(lineup.idChannel);
  if (channel!.isTextBased()) {
    const msg = await channel!.messages.fetch(lineup.id);
    const res: LineUpMessage[] = await lineupResponse(
      lineup.hour,
      lineup.isMix,
      team,
    );
    await msg.edit({
      embeds: res[0].embed,
      components: [res[0].buttons],
    });
  }
};
