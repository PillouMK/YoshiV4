import {
  APIEmbedField,
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  User,
} from "discord.js";
import {
  getAllPlayers,
  getTimetrialsByMap,
  patchTimetrial,
  postTimetrial,
} from "./yfApiController";
import {
  YOSHI_FAMILY_LOGO,
  addBlank,
  botLogs,
  rosterColor,
} from "./generalController";
import { Player } from "../model/player";

type TimetrialData = {
  infoMap: InfoMap;
  timetrials: {
    arrayShroom: Timetrial[];
    arrayShroomless: Timetrial[];
  };
};

type InfoMap = {
  idMap: string;
  nameMap: string;
  minia: string;
  initialGame: string;
  DLC: boolean;
  retro: boolean;
};

type Timetrial = {
  idPlayer: string;
  name: string;
  date: string;
  rosterName: string;
  idRoster: string;
  difference: string;
  duration: string;
};

type InfoTimetrial = {
  idRoster: string;
  isShroomless: boolean;
  isMobile: boolean;
  isEmpty: boolean;
  date: Date;
};

type TimetrialFields = {
  members: APIEmbedField;
  time: APIEmbedField;
  diff: APIEmbedField;
  mobileField: APIEmbedField;
};

type RankingFields = {
  members: APIEmbedField;
  points: APIEmbedField;
  tops: APIEmbedField;
  mobileField: APIEmbedField;
};

export type TimetrialMessage = {
  content: string;
  embed?: EmbedBuilder[];
  buttons?: ActionRowBuilder<ButtonBuilder>;
  file?: AttachmentBuilder[];
};

const terminaison = ["st", "nd", "rd", "th"];
const testTime = /[\d]{1}[\:|\.][\d]{2}[\.|\:][\d]{3}/;

export const getTimetrialsDataByMap = async (
  idMap: string,
  idRoster: string | undefined
): Promise<TimetrialData | undefined> => {
  const response = await getTimetrialsByMap(idMap, idRoster);
  if (response.statusCode !== 200) {
    return undefined;
  }
  const data: TimetrialData = {
    infoMap: response.data.infoMap,
    timetrials: {
      arrayShroom: response.data.timetrials.arrayShroom,
      arrayShroomless: response.data.timetrials.arrayShroomless,
    },
  };
  return data;
};

export const makeTimetrialMessage = async (
  idMap: string,
  idRoster: string | undefined,
  isShroomless: boolean,
  user: User,
  isMobile: boolean
): Promise<TimetrialMessage> => {
  const data = await getTimetrialsDataByMap(idMap, idRoster);
  if (data == undefined) {
    return {
      content: "Une erreur est survenue",
    };
  }

  const info: InfoTimetrial = {
    date: new Date(),
    idRoster: idRoster ?? "YF",
    isEmpty: isShroomless
      ? data.timetrials.arrayShroomless == null
      : data.timetrials.arrayShroom == null,
    isMobile: isMobile,
    isShroomless: isShroomless,
  };
  const times = !isShroomless
    ? data.timetrials.arrayShroom
    : data.timetrials.arrayShroomless;
  const fields = makeTimetrialFields(times, user, isShroomless);
  const embed = makeEmbedTimetrial(data.infoMap, fields, info);
  const buttons = makeListButton(
    isShroomless,
    isMobile,
    idRoster ?? "YF",
    idMap
  );
  return {
    content: `Dernier edit initié par ${user.username}`,
    embed: [embed],
    buttons: buttons,
  };
};

const emote = (isShroomless: boolean): string => {
  return isShroomless
    ? ` <:no_mushroom_bot:1033130955470295131>`
    : ` <:mushroom_bot:1033128412405047356>`;
};

export const makeTimetrialFields = (
  data: Timetrial[],
  user: User,
  isShroomless: boolean
): TimetrialFields | undefined => {
  let members: string = "";
  let times: string = "";
  let diffs: string = "";
  let mobileField: string = "";
  if (data == null) {
    return undefined;
  }
  const emoteEmbed = emote(isShroomless);
  const indexUser = data.findIndex((x) => x.idPlayer === user.id);
  const maxLength =
    Math.max(...data.map((el) => el.name.length)) > 10
      ? 10
      : Math.max(...data.map((el) => el.name.length));
  data.forEach((timetrial, index) => {
    if (index < 10) {
      let place = index + 1 < 4 ? terminaison[index] : terminaison[3];
      let placement =
        index < 9 ? `\`${index + 1}${place}.\`` : `\`${index + 1}${place}\``;
      members += `${placement} : **${timetrial.name}**\n`;
      times += `\`${timetrial.duration}\`\n`;
      diffs += `\`(${timetrial.difference})\`\n`;

      // mobile field
      placement = index < 9 ? `${index + 1}${place} ` : `${index + 1}${place}`;
      mobileField += `\`${placement} ${addBlank(
        timetrial.name.slice(0, 10),
        maxLength,
        true
      )} ${timetrial.duration} (${timetrial.difference})\` \n`;
    }
  });
  if (indexUser != -1 && indexUser >= 10) {
    let element = data[indexUser];
    let place = terminaison[3];
    let placement =
      indexUser < 9
        ? `\`${indexUser + 1}${place}.\``
        : `\`${indexUser + 1}${place}\``;
    members += `${placement} : **${element.name}**\n`;
    times += `\`${element.duration}\`\n`;
    diffs += `\`(${element.difference})\`\n`;

    // mobile field
    placement =
      indexUser < 9 ? `${indexUser + 1}${place} ` : `${indexUser + 1}${place}`;
    mobileField += `\`${placement} ${addBlank(
      element.name.slice(0, 10),
      maxLength,
      true
    )} ${element.duration} (${element.difference})\` \n`;
  }
  return {
    members: { name: "__Membre :__", value: members, inline: true },
    time: { name: "__Temps :__", value: times, inline: true },
    diff: { name: "__diff :__", value: diffs, inline: true },
    mobileField: {
      name: `__Membre:       Time:       Diff:__ ${emoteEmbed}`,
      value: mobileField,
      inline: false,
    },
  };
};

export const makeEmbedTimetrial = (
  infoMap: InfoMap,
  fields: TimetrialFields | undefined,
  info: InfoTimetrial
): EmbedBuilder => {
  const title = `Classement : ${infoMap.initialGame} ${infoMap.nameMap}`;
  const emoteEmbed: string = emote(info.isShroomless);
  const colorEmbed = rosterColor(info.idRoster);
  const isDLC = infoMap.DLC ? "DLC" : "Not DLC";
  const isRetro = infoMap.retro ? "Retro" : "Not retro";
  const quoteShroomless = info.isShroomless ? "shroomless" : "items";
  const quoteRoster =
    info.idRoster != undefined ? `pour le roster ${info.idRoster}` : "";
  let classementEmbed = new EmbedBuilder()
    .setColor(colorEmbed)
    .setFooter({ text: `${infoMap.idMap} - ${isDLC} - ${isRetro}` })
    .setTimestamp(info.date);
  if (info.isEmpty) {
    return classementEmbed
      .setColor(0xec1c24)
      .setTitle(`${title} ${emoteEmbed}`)
      .setFooter({ text: `${infoMap.idMap} - ${isDLC} - ${isRetro}` })
      .setThumbnail(infoMap.minia)
      .addFields({
        name: "__Erreur:__",
        value: `Il n'y a pas de temps sur ${infoMap.nameMap} en ${quoteShroomless} ${quoteRoster}`,
        inline: true,
      });
  }
  if (!info.isMobile) {
    return classementEmbed
      .setTitle(`${emoteEmbed} ${title}`)
      .setThumbnail(infoMap.minia)
      .addFields(fields!.members)
      .addFields(fields!.time)
      .addFields(fields!.diff)
      .setTimestamp(info.date);
  } else {
    return classementEmbed
      .setColor(colorEmbed)
      .setFooter({ text: `${infoMap.idMap} - ${isDLC} - ${isRetro}` })
      .setAuthor({ name: title, iconURL: infoMap.minia })
      .addFields(fields!.mobileField);
  }
};

export const makeListButton = (
  isShroomless: boolean,
  isMobile: boolean,
  idRoster: string,
  idMap: string
): ActionRowBuilder<ButtonBuilder> => {
  const viewLabel = isMobile ? "PC" : "Mobile";
  const emoji = isMobile ? "💻" : "📱";
  const itemLabel = isShroomless ? "With items" : "No items";

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`timetrial-YF-${idMap}-${isShroomless}-${isMobile}`)
        .setLabel("Yoshi")
        .setStyle(ButtonStyle.Secondary)
        .setDisabled(idRoster == "YF")
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`timetrial-YFG-${idMap}-${isShroomless}-${isMobile}`)
        .setLabel("Galaxy")
        .setStyle(ButtonStyle.Success)
        .setDisabled(idRoster == "YFG")
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`timetrial-YFO-${idMap}-${isShroomless}-${isMobile}`)
        .setLabel("Odyssey")
        .setStyle(ButtonStyle.Primary)
        .setDisabled(idRoster == "YFO")
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId(
          `timetrial-${idRoster}-${idMap}-${!isShroomless}-${isMobile}`
        )
        .setLabel(itemLabel)
        .setStyle(ButtonStyle.Danger)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId(
          `timetrial-${idRoster}-${idMap}-${isShroomless}-${!isMobile}`
        )
        .setLabel(viewLabel)
        .setEmoji(emoji)
        .setStyle(ButtonStyle.Secondary)
    );

  return row;
};

export const isTimeValid = (time: string): boolean => {
  return testTime.test(time) || time.length === 8;
};

export const timeToMs = (time: string): number => {
  // transform x:xx.xxx into millisecond
  let milli: number = parseInt(time.slice(5), 10);
  let minToMil: number = parseInt(time.slice(0, 1), 10) * 60000;
  let secTomil: number = parseInt(time.slice(2, 4), 10) * 1000;
  return minToMil + secTomil + milli;
};

export const updateTimetrial = async (
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

  const patchTime = await patchTimetrial(
    user.id,
    idMap,
    timeInMs,
    isShroomless
  );
  const response = isShroomless ? `en shroomless` : `avec items`;
  if (patchTime.statusCode != 200) {
    const postTime = await postTimetrial(
      user.id,
      idMap,
      timeInMs,
      isShroomless
    );
    if (postTime.statusCode != 201) {
      botLogs(bot, `Error when adding time : ${postTime.data.toString()}`);
      return `Erreur : ${postTime.data.toString()}`;
    } else {
      botLogs(
        bot,
        `${user.username} successfully added time (${idMap}, ${time}, ${isShroomless})`
      );
      return `Nouveau temps : ${time} ${response}`;
    }
  } else {
    botLogs(
      bot,
      `${user.username} successfully updated time (${idMap}, ${time}, ${isShroomless})`
    );
    return `Nouveau temps : ${patchTime.data.newTime} (${patchTime.data.diff}s) ${response}\nTon ancien temps était : ${patchTime.data.oldTime}`;
  }
};

// Timetrial Final Ranking

export const timetrialFinalRanking = async (
  bot: Client,
  isMobile: boolean
): Promise<TimetrialMessage> => {
  const classement = await getAllPlayers();
  if (classement.statusCode != 200) {
    botLogs(bot, `Error when getAllPlayers - ${classement.data}`);
    return {
      content: "Erreur lors de la récupération des joueurs",
    };
  }
  const embed = makeEmbedRanking(classement.data, isMobile);
  const buttons = makeListButtonRanking(isMobile);
  return {
    content: "",
    embed: [embed],
    buttons: buttons,
    file: [YOSHI_FAMILY_LOGO],
  };
};

export const makeEmbedRanking = (
  classement: Player[],
  isMobile: boolean
): EmbedBuilder => {
  const fields = makeFields(classement);
  let rankingEmbed = new EmbedBuilder()
    .setColor(rosterColor(""))
    .setFooter({ text: "1er = 10 pts, 2nd = 9 pts, [...] 10ème = 1 pts" })
    .setTimestamp(Date.now());

  if (isMobile) {
    rankingEmbed.addFields(fields.mobileField);
    rankingEmbed.setAuthor({
      name: `Classement Timetrial YF :`,
      iconURL: "attachment://LaYoshiFamily.png",
    });
  } else {
    rankingEmbed.addFields(fields.members, fields.points, fields.tops);
    rankingEmbed.setThumbnail("attachment://LaYoshiFamily.png");
    rankingEmbed.setTitle(
      `----------------- Classement Timetrial YF -----------------`
    );
  }

  return rankingEmbed;
};

export const makeFields = (classement: Player[]): RankingFields => {
  const maxLengthPts = classement[0].tt_points.toString().length;
  const maxLengthName = Math.max(
    ...classement.map((player) => player.name.length)
  );
  let fieldMobile: string = "";
  let fieldPLayer: string = "";
  let fieldTt_point: string = "";
  let fieldTt_tops: string = "";

  classement.forEach((player, index) => {
    if (player.tt_points == 0) return;
    const name = addBlank(player.name, maxLengthName, true);
    const tt_points = addBlank(player.tt_points.toString(), maxLengthPts);
    const tt_top1 = addBlank(player.tt_top1.toString(), 2);
    const tt_top3 = addBlank(player.tt_top3.toString(), 2);
    const space = index < 9 ? ` ` : ``;

    // sécurité pour pas dépasser 1024 caractères
    if (fieldMobile.length < 980) {
      fieldMobile += `\`${
        index + 1
      }${space} : ${name}${tt_points}pts | ${tt_top1} - ${tt_top3}\`\n`;
    }

    fieldPLayer += `\`${index + 1}${space} :\` **${name}** \n`;
    fieldTt_point += `\`${tt_points} pts\`\n`;
    fieldTt_tops += `\`${tt_top1}  -  ${tt_top3}\`\n`;
  });

  return {
    members: { name: "__Membre :__", value: fieldPLayer, inline: true },
    points: { name: "__Points :__", value: fieldTt_point, inline: true },
    tops: { name: "__Tops :__", value: fieldTt_tops, inline: true },
    mobileField: {
      name: "__Membre:       Points:         Top 1 & Top 3:__",
      value: fieldMobile,
      inline: true,
    },
  };
};

export const makeListButtonRanking = (
  isMobile: boolean
): ActionRowBuilder<ButtonBuilder> => {
  const labelView = isMobile ? "Vue PC" : "Vue Mobile";
  const row = new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`ranking-${!isMobile}`)
      .setLabel(labelView)
      .setStyle(ButtonStyle.Success)
  );
  return row;
};
