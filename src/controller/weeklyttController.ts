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
  Timetrial,
  emote_string,
} from "./timetrialController";
import {
  getWeeklyTT,
  patchWeeklyTT,
  postMapWeekly,
  postWeeklyTT,
} from "./yfApiController";
import { addBlank, botLogs, saveJSONToFile } from "./generalController";
import fs from "fs";
import settings from "../settings.json";
import { MapMK } from "../model/map.dto";
import { LIST_MAPS, LOGO_YF } from "..";

const weeklyDataPath: string = "./src/database/weeklyMap.json";

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

export const getAllWeeklyMap = async (): Promise<weeklyMap[]> => {
  try {
    const maps = await getWeeklyTT();
    const weeklyttArray: Weeklytt[] = maps.data.arrayResponse;

    const weeklyMaps: weeklyMap[] = weeklyttArray.map((weeklytt) => ({
      idMap: weeklytt.map.idMap,
      isShroomless: weeklytt.map.isShroomless,
      goldTime: weeklytt.map.goldTime,
      silverTime: weeklytt.map.silverTime,
      bronzeTime: weeklytt.map.bronzeTime,
    }));
    return weeklyMaps;
  } catch (error) {
    console.error("Error fetching weekly maps:", error);
    throw new Error("Unable to fetch weekly maps.");
  }
};

export const setWeeklyMap = (
  bot: Client,
  idMap: string,
  isShroomless: boolean,
  goldTime: string,
  silverTime: string,
  bronzeTime: string
): string => {
  const _weeklyMapData = JSON.parse(
    fs.readFileSync(weeklyDataPath, "utf-8")
  ) as weeklyMap[];
  const times = [
    { label: "gold", value: goldTime },
    { label: "silver", value: silverTime },
    { label: "bronze", value: bronzeTime },
  ];

  for (let weeklyMap of _weeklyMapData) {
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
      `Time aren't well ordered : gold ${goldTime}, silver ${silverTime}, bronze ${bronzeTime}`
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

  _weeklyMapData.push(weeklyMapObject);
  saveJSONToFile(_weeklyMapData, weeklyDataPath);

  return `${idMap} en ${isShroomless ? "No item" : "Item"} bien enregistré`;
};

export const sendWeeklyMap = async (bot: Client): Promise<string> => {
  const _weeklyMapData = JSON.parse(
    fs.readFileSync(weeklyDataPath, "utf-8")
  ) as weeklyMap[];
  let weeklyMapToSend: weeklyMapAPI[] = [];
  for (let map of _weeklyMapData) {
    weeklyMapToSend.push({
      idMap: map.idMap,
      isShroomless: map.isShroomless,
      goldTime: map.goldTime,
      silverTime: map.silverTime,
      bronzeTime: map.bronzeTime,
      isObligatory: true,
      roster: "YFG",
    });
  }
  let post = await postMapWeekly(weeklyMapToSend);
  if (post.statusCode === 201) {
    sendWeeklyAnnounce(bot);
    return "Nouvelle maps envoyées !";
  } else {
    botLogs(bot, `Error when /send_weekly : ${post.statusCode} : ${post.data}`);
    return `Une erreur est survenue : ${post.data}`;
  }
};

const sendWeeklyAnnounce = (bot: Client) => {
  const channel: TextChannel = bot.channels.cache.get(
    settings.channels.announcement
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
  _weeklyMapData: weeklyMap[]
): APIEmbedField[] => {
  let fields: APIEmbedField[] = [];
  _weeklyMapData.forEach((element, index) => {
    const emoteIsShroomless = element.isShroomless
      ? "<:no_mushroom_bot:1033130955470295131>"
      : "<:mushroom_bot:1033128412405047356>";

    let title = `${element.idMap} : ${emoteIsShroomless}`;
    let textFloor = `:first_place:\`Gold   : ${msToTime(
      element.goldTime
    )}\`\n:second_place:\`Silver : ${msToTime(
      element.silverTime
    )}\`\n:third_place:\`Bronze : ${msToTime(element.bronzeTime)}\``;
    if (index % 2 == 0 && index != 0)
      fields.push({ name: "\u200b", value: "\u200b" });
    fields.push({ name: title, value: textFloor, inline: true });
  });
  return fields;
};

export const makeEmbedWeeklyAnnounce = (): WeeklyAnnouncement => {
  const _weeklyMapData = JSON.parse(
    fs.readFileSync(weeklyDataPath, "utf-8")
  ) as weeklyMap[];
  const file: AttachmentBuilder = new AttachmentBuilder(
    "./image/LaYoshiFamily.png"
  );
  let embed = makeEmbedWeeklyMap(_weeklyMapData.length);
  const fields = makeWeeklyMapEmbedFields(_weeklyMapData);
  embed.addFields(fields);

  return {
    embed: [embed],
    file: file,
    content: "<@&199252384612876289> TT de la semaine :",
  };
};

export const updateWeeklyTimetrial = async (
  time: string,
  idMap: string,
  isShroomless: boolean,
  user: User,
  bot: Client
): Promise<string> => {
  if (!isTimeValid(time)) {
    botLogs(bot, `Error time is not valid : ${time}`);
    return `${time} n'est pas un temps valide`;
  }
  const timeInMs = timeToMs(time);

  const patchTime = await patchWeeklyTT(user.id, idMap, timeInMs, isShroomless);
  const response = isShroomless ? `en shroomless` : `avec items`;
  if (patchTime.statusCode == 404) {
    const postTime = await postWeeklyTT(user.id, idMap, timeInMs, isShroomless);
    if (postTime.statusCode != 201) {
      botLogs(bot, `Error when adding time : ${postTime.data.toString()}`);
      return `Erreur : ${postTime.data.toString()}`;
    } else {
      let endText = "";
      if (postTime.data.ttExist && postTime.data.newIsBetter) {
        endText = `Tu as battu ton record qui était de ${postTime.data.timetrial}: C'est enregistré !`;
      }
      botLogs(
        bot,
        `${user.username} successfully added time (${idMap}, ${time}, ${isShroomless})`
      );
      return `Nouveau temps weekly : ${time} ${response}${endText}`;
    }
  } else {
    let endText = "";
    if (patchTime.data.newIsBetter) {
      endText += `\nTu as également battu ton record personnel qui était de : ${patchTime.data.timetrial}`;
    }
    botLogs(
      bot,
      `${user.username} successfully updated time (${idMap}, ${time}, ${isShroomless})`
    );
    return `Nouveau temps weekly : ${patchTime.data.newWeekly} (${patchTime.data.diff}s) ${response}\nTon ancien temps était : ${patchTime.data.oldWeekly}${endText}`;
  }
};

export const getWeeklytt = async (
  bot: Client,
  idMap?: string,
  isShroomless?: boolean
): Promise<WeeklyMessage> => {
  const req = await getWeeklyTT();
  if (req.statusCode === 200) {
    const weeklytt: Weeklytt[] = req.data.arrayResponse;
    let weeklyttByMap: Weeklytt;
    if (idMap != undefined) {
      weeklyttByMap = weeklytt.find(
        (v) => v.map.idMap === idMap && isShroomless == v.map.isShroomless
      )!;
    } else {
      weeklyttByMap = weeklytt[0];
    }
    const currentMap = `${weeklyttByMap.map.idMap}-${weeklyttByMap.map.isShroomless}`;
    let listMap: weeklyMap[] = weeklytt.map((elt) => elt.map);
    let embed = makeWeeklyttEmbed(weeklyttByMap.map);
    const fields: APIEmbedField[] = makeWeeklyttFields(weeklyttByMap);
    const buttons: ActionRowBuilder<ButtonBuilder> = makeListButton(
      listMap,
      currentMap
    );
    embed.addFields(fields);
    return {
      content: "",
      embed: [embed],
      buttons: buttons,
    };
  } else {
    botLogs(
      bot,
      `Erreur lors de la récupération des données : ${req.statusCode} - ${req.data}`
    );
    return {
      content: `Erreur lors de la récupération des données : ${req.statusCode} - ${req.data}`,
      embed: [],
    };
  }
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
  let fieldGold: Timetrial[] = weeklytt.weeklyTimetrial.goldArray;
  let fieldSilver: Timetrial[] = weeklytt.weeklyTimetrial.silverArray;
  let fieldBronze: Timetrial[] = weeklytt.weeklyTimetrial.bronzeArray;
  let fieldOut: Timetrial[] = weeklytt.weeklyTimetrial.outArray;
  let arrayFields = [fieldGold, fieldSilver, fieldBronze, fieldOut];
  for (let element of arrayFields) {
    const maxLength = element.length
      ? Math.max(...element.map((el) => el.name.length))
      : 0;
    let valueField: string = "";
    element.forEach((elt) => {
      const name = addBlank(elt.name, maxLength, true);
      valueField += `\`${name} : ${elt.duration}\`\n`;
    });
    if (valueField == "") {
      valueField = "\u200b";
    }
    let field: APIEmbedField = {
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
  currentMap: string
): ActionRowBuilder<ButtonBuilder> => {
  const arrayButtonStyle = [
    ButtonStyle.Primary,
    ButtonStyle.Secondary,
    ButtonStyle.Success,
    ButtonStyle.Danger,
  ];
  const row = new ActionRowBuilder<ButtonBuilder>();
  let index = 0;
  for (let weeklyMap of listMap) {
    const shroomless = weeklyMap.isShroomless ? "ni" : "item";
    row.addComponents(
      new ButtonBuilder()
        .setCustomId(`weeklytt-${weeklyMap.idMap}-${weeklyMap.isShroomless}`)
        .setLabel(`${weeklyMap.idMap} - ${shroomless}`)
        .setStyle(arrayButtonStyle[index % 4])
        .setDisabled(
          currentMap === `${weeklyMap.idMap}-${weeklyMap.isShroomless}`
        )
    );
    index++;
  }
  return row;
};
