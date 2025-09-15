import {
  APIEmbedField,
  ActionRowBuilder,
  AttachmentBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  EmbedBuilder,
  Message,
  TextChannel,
  User,
} from "discord.js";
import { _getTimetrialsByMap, _upsertTimetrial } from "./yfApiController";
import {
  MK_MINIA_ATTACHMENT,
  YOSHI_FAMILY_LOGO,
  addBlank,
  botLogs,
  rosterColor,
} from "./generalController";
import { Player } from "../model/player";
import settings from "../settings.json";
import {
  Timetrial,
  TimetrialCreated,
  TimetrialRanking,
  TimetrialUpsert,
} from "../model/timetrial.dto";
import { ResponseAPI } from "../model/responseYF";
import { MapMK_V2 } from "../model/map.dto";

type InfoTimetrial = {
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
  mobileField: APIEmbedField[];
};

export type TimetrialMessage = {
  content: string;
  embed?: EmbedBuilder[];
  buttons?: ActionRowBuilder<ButtonBuilder>;
  file?: AttachmentBuilder[];
};

const terminaison = ["st", "nd", "rd", "th"];
const testTime = /\d[:.]\d{2}[.:]\d{3}/;

export const makeTimetrialMessage = async (
  map_tag: string,
  game_id: string,
  team_id: string,
  isShroomless: boolean,
  user: User,
  isMobile: boolean
): Promise<TimetrialMessage> => {
  const timetrials: ResponseAPI<TimetrialRanking> = await _getTimetrialsByMap(
    map_tag,
    game_id,
    team_id
  );
  if (timetrials.statusCode != 200) {
    return {
      content: "Une erreur est survenue",
    };
  }
  const timetrialsArray = isShroomless
    ? timetrials.data.shroomless
    : timetrials.data.noShroomless;

  const info: InfoTimetrial = {
    date: new Date(),
    isEmpty: !(timetrialsArray.length > 0),
    isMobile: isMobile,
    isShroomless: isShroomless,
  };
  const times = timetrialsArray;
  const fields = makeTimetrialFields(times, user, isShroomless);
  const embed = makeEmbedTimetrial(timetrials.data.map, fields, info);
  const buttons = makeListButton(isShroomless, isMobile, map_tag, game_id);
  return {
    content: `Dernier edit initié par ${user.username}`,
    embed: [embed],
    buttons: buttons,
    file: [MK_MINIA_ATTACHMENT(game_id, map_tag)],
  };
};

export const emote_string = (isShroomless: boolean): string => {
  return isShroomless
    ? ` <:shroomless:1359564972300173322>`
    : ` <:shrooms:1359564923713228861>`;
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
  if (data.length == 0) {
    return undefined;
  }
  const emoteEmbed = emote_string(isShroomless);
  const indexUser = data.findIndex((x) => x.user_id === user.id);
  const maxLength =
    Math.max(...data.map((el) => el.user.name!.length)) > 10
      ? 10
      : Math.max(...data.map((el) => el.user.name!.length));
  data.forEach((timetrial, index) => {
    if (index < 10) {
      const place = index + 1 < 4 ? terminaison[index] : terminaison[3];
      let placement =
        index < 9 ? `\`${index + 1}${place}.\`` : `\`${index + 1}${place}\``;
      members += `${placement} : **${timetrial.user.name}**\n`;
      times += `\`${msToTime(timetrial.time)}\`\n`;
      diffs += `\`(${msToTime(timetrial.time - data[0].time, true)})\`\n`;

      // mobile field
      placement = index < 9 ? `${index + 1}${place} ` : `${index + 1}${place}`;
      mobileField += `\`${placement} ${addBlank(
        timetrial.user.name!.slice(0, 10),
        maxLength,
        true
      )} ${msToTime(timetrial.time)} (${msToTime(
        timetrial.time - data[0].time,
        true
      )})\` \n`;
    }
  });
  if (indexUser != -1 && indexUser >= 10) {
    const element = data[indexUser];
    const place = terminaison[3];
    let placement =
      indexUser < 9
        ? `\`${indexUser + 1}${place}.\``
        : `\`${indexUser + 1}${place}\``;
    members += `${placement} : **${element.user.name!}**\n`;
    times += `\`${msToTime(element.time)}\`\n`;
    diffs += `\`(${msToTime(element.time - data[0].time, true)})\`\n`;

    // mobile field
    placement =
      indexUser < 9 ? `${indexUser + 1}${place} ` : `${indexUser + 1}${place}`;
    mobileField += `\`${placement} ${addBlank(
      element.user.name!.slice(0, 10),
      maxLength,
      true
    )} ${msToTime(element.time)} (${msToTime(
      element.time - data[0].time,
      true
    )})\` \n`;
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
  infoMap: MapMK_V2,
  fields: TimetrialFields | undefined,
  info: InfoTimetrial
): EmbedBuilder => {
  const title = `Classement : ${infoMap.tag} ${infoMap.name}`;
  const emoteEmbed: string = emote_string(info.isShroomless);
  const colorEmbed = 0x2ecc71;
  const quoteShroomless = info.isShroomless ? "shroomless" : "items";
  const classementEmbed = new EmbedBuilder()
    .setColor(colorEmbed)
    .setFooter({ text: `${infoMap.game_id} - ${infoMap.tag}` })
    .setTimestamp(info.date);
  if (info.isEmpty) {
    return classementEmbed
      .setColor(0xec1c24)
      .setTitle(`${title} ${emoteEmbed}`)
      .setFooter({ text: `${infoMap.game_id} - ${infoMap.tag}` })
      .setThumbnail(`attachment://${infoMap.tag}.png`)
      .addFields({
        name: "__Erreur:__",
        value: `Il n'y a pas de temps sur ${infoMap.name} en ${quoteShroomless}`,
        inline: true,
      });
  }
  if (!info.isMobile) {
    return classementEmbed
      .setTitle(`${emoteEmbed} ${title}`)
      .setThumbnail(`attachment://${infoMap.tag}.png`)
      .addFields(fields!.members)
      .addFields(fields!.time)
      .addFields(fields!.diff)
      .setTimestamp(info.date);
  } else {
    return classementEmbed
      .setColor(colorEmbed)
      .setFooter({ text: `${infoMap.game_id} - ${infoMap.tag}` })
      .setAuthor({ name: title, iconURL: `attachment://${infoMap.tag}.png` })
      .addFields(fields!.mobileField);
  }
};

export const makeListButton = (
  isShroomless: boolean,
  isMobile: boolean,
  map_tag: string,
  game_id: string
): ActionRowBuilder<ButtonBuilder> => {
  const viewLabel = isMobile ? "PC" : "Mobile";
  const emoji = isMobile ? "💻" : "📱";
  const itemLabel = isShroomless ? "With items" : "No items";

  const row = new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(
          `timetrial-${map_tag}-${game_id}-${!isShroomless}-${isMobile}`
        )
        .setLabel(itemLabel)
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId(
          `timetrial-${map_tag}-${game_id}-${isShroomless}-${!isMobile}`
        )
        .setLabel(viewLabel)
        .setEmoji(emoji)
        .setStyle(ButtonStyle.Secondary)
    );

  return row;
};

export const updateTimetrial = async (
  time: string,
  map_tag: string,
  isShroomless: boolean,
  user: User,
  game_id: string,
  bot: Client
): Promise<string> => {
  if (!isTimeValid(time)) {
    botLogs(bot, `Error time is not valid : ${time}`);
    return `${time} n'est pas un temps valide`;
  }
  const timeInMs = timeToMs(time);
  const upsert: TimetrialUpsert = {
    game_id: game_id,
    is_shroomless: isShroomless,
    map_tag: map_tag,
    time: timeInMs,
    user_id: user.id,
  };
  const updateTime: ResponseAPI<any> = await _upsertTimetrial(upsert);
  const response = isShroomless ? `en shroomless` : `avec items`;
  if (updateTime.statusCode == 201) {
    const res = updateTime as ResponseAPI<TimetrialCreated>;
    botLogs(
      bot,
      `${user.username} successfully updated time (${map_tag}, ${time}, ${isShroomless})`
    );
    const delta = res.data.delta ? `(${msToTime(res.data.delta, true)}s)` : "";
    const old_time = res.data.old_time
      ? `Ton ancien temps était : ${msToTime(res.data.old_time)}`
      : ``;
    return `Nouveau temps sur ${map_tag} pour ${
      res.data.timetrial.user.name
    } : ${msToTime(res.data.new_time)} ${delta}${response}\n${old_time}`;
  } else {
    return `Erreur lors de la commande : ${updateTime.data.message}`;
  }
};

export const isTimeValid = (time: string): boolean => {
  return testTime.test(time) || time.length === 8;
};

export const timeToMs = (time: string): number => {
  // transform x:xx.xxx into millisecond
  const milli: number = parseInt(time.slice(5), 10);
  const minToMil: number = parseInt(time.slice(0, 1), 10) * 60000;
  const secTomil: number = parseInt(time.slice(2, 4), 10) * 1000;
  return minToMil + secTomil + milli;
};

export const msToTime = (s: number, isDiff = false) => {
  // Pad to 2 or 3 digits, default is 2
  function pad(n: number, z?: number) {
    z = z || 2;
    return ("00" + n).slice(-z);
  }

  const ms = s % 1000;
  s = (s - ms) / 1000;
  const secs = s % 60;
  s = (s - secs) / 60;
  const mins = s % 60;

  return !isDiff
    ? pad(mins) + ":" + pad(secs) + "." + pad(ms, 3)
    : secs + "." + pad(ms, 3);
};

// Timetrial Final Ranking

export const makeEmbedRanking = (
  classement: Player[],
  isMobile: boolean
): EmbedBuilder => {
  const fields = makeFields(classement);
  const rankingEmbed = new EmbedBuilder()
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
  const maxLengthName =
    Math.max(
      ...classement
        .filter((player) => player.tt_points > 0)
        .map((player) => player.name.length)
    ) + 3;
  let fieldMobile: string = "";
  let fieldPLayer: string = "";
  let fieldTt_point: string = "";
  let fieldTt_tops: string = "";
  const fieldsMobile: APIEmbedField[] = [];
  classement.forEach((player, index) => {
    if (player.tt_points == 0) return;
    const name = addBlank(player.name, maxLengthName, true);
    const tt_points = addBlank(player.tt_points.toString(), maxLengthPts);
    const tt_top1 = addBlank(player.tt_top1.toString(), 2);
    const tt_top3 = addBlank(player.tt_top3.toString(), 2);
    const space = index < 9 ? ` ` : ``;

    // sécurité pour pas dépasser 1024 caractères
    if (fieldMobile.length < 900) {
      fieldMobile += `\`${
        index + 1
      }${space} : ${name}${tt_points}pts | ${tt_top1} - ${tt_top3}\`\n`;
    } else {
      fieldsMobile.push({
        name: "__Membre:       Points:         Top 1 & Top 3:__",
        value: fieldMobile,
        inline: false,
      });
      fieldMobile = `\`${
        index + 1
      }${space} : ${name}${tt_points}pts | ${tt_top1} - ${tt_top3}\`\n`;
    }

    fieldPLayer += `\`${index + 1}${space} :\` **${name}** \n`;
    fieldTt_point += `\`${tt_points} pts\`\n`;
    fieldTt_tops += `\`${tt_top1}  -  ${tt_top3}\`\n`;
  });
  fieldsMobile.push({
    name: "__Membre:       Points:         Top 1 & Top 3:__",
    value: fieldMobile,
    inline: false,
  });

  return {
    members: { name: "__Membre :__", value: fieldPLayer, inline: true },
    points: { name: "__Points :__", value: fieldTt_point, inline: true },
    tops: { name: "__Tops :__", value: fieldTt_tops, inline: true },
    mobileField: fieldsMobile,
  };
};
