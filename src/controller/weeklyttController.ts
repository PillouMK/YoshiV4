import {
  ActionRowBuilder,
  APIEmbedField,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  TextChannel,
  User,
} from "discord.js";
import {
  isTimeValid,
  msToTime,
  timeToMs,
  emote_string,
} from "./timetrialController";
import { addBlank, botLogs } from "./generalController";
import fs from "fs";
import settings from "../settings.json";
import { MapMK } from "../model/map.dto";
import { LIST_MAPS, LOGO_YF } from "..";
import { Timetrial } from "../model/timetrial.dto";
import path from "path";
import { JsonStore } from "../model/json";

const weeklyPath = path.resolve(process.cwd(), "data", "weeklyMap.json");
const weeklyStore = new JsonStore<weeklyMap[]>(weeklyPath, []);
const weekly = weeklyStore.load();

type weeklyMap = {
  idMap: string;
  isShroomless: boolean;
  goldTime: number;
  silverTime: number;
  bronzeTime: number;
};

export type weeklyMapAPI = {
  idMap: string;
  isShroomless: boolean;
  goldTime: number;
  silverTime: number;
  bronzeTime: number;
  isObligatory: boolean;
  roster: string;
};

type weeklyFloors = {
  goldArray: Timetrial[];
  silverArray: Timetrial[];
  bronzeArray: Timetrial[];
  outArray: Timetrial[];
};

type Weeklytt = {
  map: weeklyMap;
  weeklyTimetrial: weeklyFloors;
};

type WeeklyAnnouncement = {
  embed: EmbedBuilder[];
  file: AttachmentBuilder;
  content: string;
};

type WeeklyMessage = {
  embed: EmbedBuilder[];
  content: string;
  buttons?: ActionRowBuilder<ButtonBuilder>;
};

export const setWeeklyMap = (
  bot: Client,
  idMap: string,
  isShroomless: boolean,
  goldTime: string,
  silverTime: string,
  bronzeTime: string,
): string => {
  const times = [
    { label: "gold", value: goldTime },
    { label: "silver", value: silverTime },
    { label: "bronze", value: bronzeTime },
  ];

  for (const weeklyMap of weekly) {
    if (weeklyMap.idMap === idMap && weeklyMap.isShroomless === isShroomless) {
      const errorMessage = `${idMap} ${
        isShroomless ? "No item" : "Item"
      } est déjà set`;
      botLogs(bot, `${idMap} ${isShroomless} already set`);
      return errorMessage;
    }
  }

  for (const { label, value } of times) {
    if (!isTimeValid(value)) {
      const errorMessage = `${value} n'est pas un temps valide`;
      botLogs(bot, `Error time is not valid (${label}): ${value}`);
      return errorMessage;
    }
  }

  const goldMs: number = timeToMs(goldTime);
  const silverMs: number = timeToMs(silverTime);
  const bronzeMs: number = timeToMs(bronzeTime);

  if (goldMs > silverMs || silverMs > bronzeMs) {
    const errorMessage = `Les temps doivent respecter l'ordre croissant : gold (${goldTime}) < silver (${silverTime}) < bronze (${bronzeTime})`;
    botLogs(
      bot,
      `Time aren't well ordered : gold ${goldTime}, silver ${silverTime}, bronze ${bronzeTime}`,
    );
    return errorMessage;
  }

  const weeklyMapObject: weeklyMap = {
    idMap: idMap,
    isShroomless: isShroomless,
    goldTime: timeToMs(goldTime),
    silverTime: timeToMs(silverTime),
    bronzeTime: timeToMs(bronzeTime),
  };

  weekly.push(weeklyMapObject);
  weeklyStore.save(weekly);

  return `${idMap} en ${isShroomless ? "No item" : "Item"} bien enregistré`;
};

const sendWeeklyAnnounce = (bot: Client) => {
  const channel: TextChannel = bot.channels.cache.get(
    settings.channels.announcement,
  ) as TextChannel;
  const message: WeeklyAnnouncement = makeEmbedWeeklyAnnounce();
  channel.send({
    content: message.content,
    embeds: message.embed,
    files: [message.file],
  });
};

const makeEmbedWeeklyMap = (length: number) => {
  return new EmbedBuilder()
    .setColor(0x1f8b4c)
    .setTitle("Weekly TT maps de la semaine !")
    .setThumbnail(LOGO_YF)
    .setTimestamp(Date.now())
    .setFooter({ text: `Weekly Map (${length.toString()})` });
};

const makeWeeklyMapEmbedFields = (
  _weeklyMapData: weeklyMap[],
): APIEmbedField[] => {
  const fields: APIEmbedField[] = [];
  _weeklyMapData.forEach((element, index) => {
    const emoteIsShroomless = element.isShroomless
      ? "<:no_mushroom_bot:1033130955470295131>"
      : "<:mushroom_bot:1033128412405047356>";

    const title = `${element.idMap} : ${emoteIsShroomless}`;
    const textFloor = `:first_place:\`Gold   : ${msToTime(
      element.goldTime,
    )}\`\n:second_place:\`Silver : ${msToTime(
      element.silverTime,
    )}\`\n:third_place:\`Bronze : ${msToTime(element.bronzeTime)}\``;
    if (index % 2 == 0 && index != 0)
      fields.push({ name: "\u200b", value: "\u200b" });
    fields.push({ name: title, value: textFloor, inline: true });
  });
  return fields;
};

export const makeEmbedWeeklyAnnounce = (): WeeklyAnnouncement => {
  const file: AttachmentBuilder = new AttachmentBuilder(
    "./image/LaYoshiFamily.png",
  );
  const embed = makeEmbedWeeklyMap(weekly.length);
  const fields = makeWeeklyMapEmbedFields(weekly);
  embed.addFields(fields);

  return {
    embed: [embed],
    file: file,
    content: "<@&199252384612876289> TT de la semaine :",
  };
};

export const makeWeeklyttEmbed = (map: weeklyMap): EmbedBuilder => {
  const mapMK: MapMK = LIST_MAPS.find((v) => v.idMap === map.idMap)!;
  const title = `Weekly TT : ${mapMK.initialGame} ${mapMK.nameMap}`;

  const emote = emote_string(map.isShroomless);
  return new EmbedBuilder()
    .setColor(0x1f8b4c)
    .setTitle(`${emote} ${title}`)
    .setThumbnail(mapMK.minia)
    .setTimestamp(Date.now())
    .setFooter({ text: `${mapMK.idMap} - ${mapMK.DLC} - ${mapMK.retro}` });
};

export const makeWeeklyttFields = (weeklytt: Weeklytt): APIEmbedField[] => {
  const fields: APIEmbedField[] = [];
  const arrayFloor = [
    {
      nameFloor: "Gold",
      timeFloor: msToTime(weeklytt.map.goldTime),
    },
    {
      nameFloor: "Silver",
      timeFloor: msToTime(weeklytt.map.silverTime),
    },
    {
      nameFloor: "Bronze",
      timeFloor: msToTime(weeklytt.map.bronzeTime),
    },
    {
      nameFloor: "Out",
      timeFloor: "",
    },
  ];
  let index = 0;
  const fieldGold: Timetrial[] = weeklytt.weeklyTimetrial.goldArray;
  const fieldSilver: Timetrial[] = weeklytt.weeklyTimetrial.silverArray;
  const fieldBronze: Timetrial[] = weeklytt.weeklyTimetrial.bronzeArray;
  const fieldOut: Timetrial[] = weeklytt.weeklyTimetrial.outArray;
  const arrayFields = [fieldGold, fieldSilver, fieldBronze, fieldOut];
  for (const element of arrayFields) {
    const maxLength = element.length
      ? Math.max(...element.map((el) => el.user.name!.length))
      : 0;
    let valueField: string = "";
    element.forEach((elt) => {
      const name = addBlank(elt.user.name!, maxLength, true);
      valueField += `\`${name} : ${msToTime(elt.time)}\`\n`;
    });
    if (valueField == "") {
      valueField = "\u200b";
    }
    const field: APIEmbedField = {
      name: `${arrayFloor[index].nameFloor} : ${arrayFloor[index].timeFloor}`,
      value: valueField,
      inline: true,
    };
    if (index == 2) {
      fields.push({
        name: "\u200B",
        value: "\u200B",
        inline: false,
      });
    }
    fields.push(field);
    index++;
  }

  return fields;
};

export const makeListButton = (
  listMap: weeklyMap[],
  currentMap: string,
): ActionRowBuilder<ButtonBuilder> => {
  const arrayButtonStyle = [
    ButtonStyle.Primary,
    ButtonStyle.Secondary,
    ButtonStyle.Success,
    ButtonStyle.Danger,
  ];
  const row = new ActionRowBuilder<ButtonBuilder>();
  let index = 0;
  for (const weeklyMap of listMap) {
    const shroomless = weeklyMap.isShroomless ? "ni" : "item";
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`weeklytt-${weeklyMap.idMap}-${weeklyMap.isShroomless}`)
        .setLabel(`${weeklyMap.idMap} - ${shroomless}`)
        .setStyle(arrayButtonStyle[index % 4])
        .setDisabled(
          currentMap === `${weeklyMap.idMap}-${weeklyMap.isShroomless}`,
        ),
    );
    index++;
  }
  return row;
};
