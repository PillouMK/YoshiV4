import { addBlank } from "../controller/generalController";
import {
  EmbedBuilder,
  ButtonBuilder,
  APIEmbedField,
  ActionRowBuilder,
  ButtonStyle,
  AttachmentBuilder,
} from "discord.js";
import { GetMapStats, MapStats } from "../model/map-stats.dto";
import { globalData } from "../global";
import { Team } from "../model/team.dto";
import { Roster } from "../model/roster.dto";

export interface ProjectMapData {
  projectMapValid: ProjectMap[];
  projectMapNotValid: ProjectMap[];
}

type ProjectMap = {
  idMap: string;
  nameMap: string;
  initialGame: string;
  score: number;
  iteration: number;
};

type MaxLengthField = {
  idMap: number;
  iteration: number;
  score: number;
};

type RankingField = {
  map: APIEmbedField;
  score: APIEmbedField;
  iteration: APIEmbedField;
};

type RankingMessage = {
  embed: EmbedBuilder[];
  buttons: ActionRowBuilder<ButtonBuilder>;
  file: AttachmentBuilder;
  content: string;
};

type ProjectMapValues = {
  [key: string]: ProjectMapData | undefined;
};

export const projectMap: ProjectMapValues = {};

export const maxLengthFields = (mapStats: MapStats[]): MaxLengthField => {
  if (mapStats.length == 0) {
    return {
      idMap: 0,
      iteration: 0,
      score: 0,
    };
  }
  const maxLength: MaxLengthField = {
    idMap: Math.max(
      ...mapStats.map((elt) => {
        return elt.tag.toString().length;
      })
    ),
    iteration: Math.max(
      ...mapStats.map((elt) => {
        return elt.iteration.toString().length;
      })
    ),
    score: Math.max(
      ...mapStats.map((elt) => {
        return elt.weighted_average.toString().length;
      })
    ),
  };
  return maxLength;
};

export const makeProjectMapRankingFields = (
  map_stats: MapStats[]
): RankingField[] => {
  const rankingFields: RankingField[] = [];
  let idMapField: string = "";
  let scoreField: string = "";
  let iterationField: string = "";
  const maxLength: MaxLengthField = maxLengthFields(map_stats);
  map_stats.forEach((map: MapStats, index: number) => {
    const space = index < 9 ? ` ` : "";
    idMapField += `\`${index + 1}${space} : \` **${map.tag}** \n`;
    scoreField += `\`${addBlank(
      map.weighted_average.toString(),
      maxLength.score
    )} pts\`\n`;
    const win_rate = map.win_rate * 100;
    iterationField += `\`${addBlank(
      map.iteration.toString(),
      maxLength.iteration
    )} - ${addBlank(`${win_rate.toString()}%`, 4)}\`\n`;

    if (idMapField.length > 1000) {
      rankingFields.push({
        map: { name: `__Map :__`, value: idMapField, inline: true },
        score: { name: `__Score :__`, value: scoreField, inline: true },
        iteration: {
          name: `__Iteration / Winrate :__`,
          value: iterationField,
          inline: true,
        },
      });
      idMapField = "";
      scoreField = "";
      iterationField = "";
    }
  });
  if (idMapField.length > 0) {
    rankingFields.push({
      map: { name: `__Map :__`, value: idMapField, inline: true },
      score: { name: `__Score :__`, value: scoreField, inline: true },
      iteration: {
        name: `__Iteration / Winrate :__`,
        value: iterationField,
        inline: true,
      },
    });
  }
  return rankingFields;
};

export const makeProjectMapMobileRankingField = (
  map_stats: MapStats[]
): APIEmbedField[] => {
  const maxLength: MaxLengthField = maxLengthFields(map_stats);
  const rankingField: APIEmbedField[] = [];
  let field: string = "";
  map_stats.forEach((map: MapStats, index: number) => {
    const space = index < 9 ? ` ` : "";
    const win_rate = map.win_rate * 100;
    const idMap: string = addBlank(map.tag, maxLength.idMap);
    const score: string = addBlank(
      map.weighted_average.toString(),
      maxLength.idMap
    );
    const iteration: string = addBlank(
      map.iteration.toString(),
      maxLength.idMap
    );
    const win_rate_s = addBlank(`${win_rate.toString()}%`, 4);

    if (field.length > 1000) {
      rankingField.push({
        name: "__Map:     Score:     Iteration/Winrate:__",
        value: field,
        inline: false,
      });
      field = "";
    }
    field += `\`${
      index + 1
    }${space} : ${idMap} | ${score} pts | ${iteration} - ${win_rate_s}\`\n`;
  });
  if (field.length > 0) {
    rankingField.push({
      name: "__Map:     Score:     Iteration/Winrate:__",
      value: field,
      inline: false,
    });
  }
  return rankingField;
};

export const makeEmbedProjectMap = (
  map_stats: GetMapStats,
  isMobile: boolean,
  team: Team,
  roster: Roster | undefined
): EmbedBuilder => {
  const rankingEmbed = new EmbedBuilder()
    .setColor(0x2ecc71)
    .setThumbnail("attachment://LaYoshiFamily.png")
    .setTitle(`---------------- Stats : ${team.name} ----------------`)
    .setTimestamp(Date.now())
    .setFooter({
      text: `project Map ${team.name} ${roster ? roster.name : ""}`,
    });
  if (!isMobile) {
    if (map_stats.stats.length == 0) {
      rankingEmbed.addFields({
        name: `__**Données valides :**__`,
        value: `Aucune données valides`,
        inline: false,
      });
    } else {
      const rankingFields = makeProjectMapRankingFields(map_stats.stats);
      rankingEmbed.addFields({
        name: `.`,
        value: `__**Données valides :**__`,
        inline: false,
      });
      rankingFields.forEach((element) => {
        rankingEmbed.addFields(element.map, element.score, element.iteration);
      });
    }
  } else {
    if (map_stats.stats.length == 0) {
      rankingEmbed.addFields({
        name: `__**Données valides :**__`,
        value: `Aucune données valides`,
        inline: false,
      });
    } else {
      const rankingFieldsValid = makeProjectMapMobileRankingField(
        map_stats.stats
      );
      rankingEmbed.addFields({
        name: `.`,
        value: `__**Données valides :**__`,
        inline: false,
      });
      rankingFieldsValid.forEach((element) => {
        rankingEmbed.addFields(element);
      });
    }
  }
  return rankingEmbed;
};

export const rankingMessage = (
  map_stats: GetMapStats,
  isMobile: boolean,
  team_id: string,
  roster_tag: string | undefined,
  month: number | undefined
): RankingMessage => {
  const team = globalData.getTeam(team_id)!;
  const roster = globalData.getRoster(team_id, roster_tag ?? "") ?? undefined;
  const content = messageRecap(team, month, roster);
  const buttons = makeButtonList(roster_tag, isMobile);
  const file: AttachmentBuilder = new AttachmentBuilder(
    "./image/LaYoshiFamily.png",
    { description: "Team logo" }
  );
  const embed = makeEmbedProjectMap(map_stats, isMobile, team, roster);
  return {
    embed: [embed],
    buttons: buttons,
    content: content,
    file: file,
  };
};

const messageRecap = (
  team: Team,
  month: number | undefined,
  roster: Roster | undefined
) => {
  return `**ProjectMap ${team.name} ${roster ? `- ${roster.name}**` : `**`} : ${
    month ? `** données des ${month} derniers mois` : ``
  }\n`;
};

const makeButtonList = (
  roster_tag: string | undefined,
  isMobile: boolean
): ActionRowBuilder<ButtonBuilder> => {
  const labelView: string = isMobile ? "Vue PC" : "Vue Mobile";
  const idView = isMobile ? "pc" : "mobile";
  return new ActionRowBuilder<ButtonBuilder>().addComponents(
    new ButtonBuilder()
      .setCustomId(`projectmap-${idView}-${roster_tag ?? ""}`)
      .setLabel(labelView)
      .setStyle(ButtonStyle.Primary)
  );
};

// export const updateProjectMapMessage = async (
//   bot: Client,
//   idRoster: string,
//   month: number,
//   iteration: number,
//   isMobile: Boolean
// ) => {
//   const projectMap = await getProjectMapData(idRoster, 3, 10);

//   const newMsg = rankingMessage(
//     idRoster,
//     month,
//     iteration,
//     projectMap!.projectMapValid,
//     projectMap!.projectMapNotValid,
//     isMobile
//   );
//   const channelId = settings.channels.rankings;
//   const msgId = (settings.projectMap as any)[idRoster];
//   try {
//     const channel = (await bot.channels.fetch(channelId)) as TextChannel;
//     const message = (await channel.messages.fetch(msgId)) as Message;

//     message.edit({
//       content: newMsg.content,
//       components: [newMsg.buttons],
//       embeds: newMsg.embed,
//       files: [newMsg.file],
//     });
//     const successMessage = `Yoshi successfully updated ProjectMap ${idRoster} message`;
//     botLogs(bot, successMessage);
//   } catch (e) {
//     const errorMessage = `Erreur projetMap : ${e}`;
//     try {
//       botLogs(bot, errorMessage);
//     } catch (error) {
//       console.log(error);
//     }
//   }
// };
