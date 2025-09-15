import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Client,
  TextChannel,
} from "discord.js";
import { _getAllMatchsDone } from "./yfApiController";
import { ResponseAPI } from "../model/responseYF";
import { MatchCreated } from "../model/match.dto";
import { makeMessageLink } from "./generalController";

export const makeTableButtonList = (
  match_id: string
): ActionRowBuilder<ButtonBuilder> => {
  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`tableValidate-${match_id.toString()}`)
        .setLabel(`Valider`)
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`tableDelete-${match_id.toString()}`)
        .setLabel(`Supprimer`)
        .setStyle(ButtonStyle.Danger)
    );
};

export const recallMissingMatches = async (
  bot: Client,
  team_id: string,
  result_channel_id: string
) => {
  const matchMissing: ResponseAPI<MatchCreated[]> = await _getAllMatchsDone(
    team_id
  );
  let msg =
    "<@&199252384612876289> Yoshi pas content, il manque les résultats des matchs suivants :\n";

  if (matchMissing.data.length > 0) {
    for (const match of matchMissing.data) {
      msg += `Match \`${match.id}\` - ${makeMessageLink(
        team_id,
        match.last_message_id ?? ""
      )}\n`;
    }
    const channel = (await bot.channels.fetch(
      result_channel_id
    )) as TextChannel;

    try {
      await channel.send({
        content: msg,
      });
    } catch (e) {
      console.error(e);
    }
  }
};
