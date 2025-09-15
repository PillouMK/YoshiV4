import { AttachmentBuilder, ButtonInteraction, TextChannel } from "discord.js";

import {
  _getAllMatchsPublished,
  _getMatch,
  _publishMatch,
} from "../../controller/yfApiController";
import { MatchPublish } from "../../model/match.dto";
import { globalData } from "../../global";
import axios from "axios";

module.exports = {
  data: {
    name: "tableValidate",
  },

  async execute(interaction: ButtonInteraction, args: string[]) {
    const id: string = args[0];
    const team_id = interaction.guildId!;
    const matchData = globalData.getFullMatchPreview(id);
    const matchCount = await _getAllMatchsPublished(team_id);
    const match = await _getMatch(id, team_id);
    const channel_result_id = globalData.getTeam(team_id)?.result_channel_id;
    console.log(globalData.getTeam(team_id));
    console.log(channel_result_id);

    await interaction.deferReply();

    await interaction.message.edit({
      components: [],
    });

    if (matchData == null) {
      interaction.editReply({
        content: "j'ai perdu les données locales du match",
      });
      return;
    }

    const channel = (await interaction.client.channels.fetch(
      channel_result_id!
    )) as TextChannel;

    const response = await axios.get(matchData.table_url!, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(response.data, "binary");

    const file = new AttachmentBuilder(buffer, { name: "image.png" });

    const msg = await channel.send({
      content: `IT ${matchCount.data.length + 1} | ${match.data.opponent}`,
      files: [file],
    });

    const matchPublish: MatchPublish = {
      message_id: msg.id,
      own_team: matchData.data.own_team!,
      table_url: matchData.table_url!,
    };
    const publishMatch = await _publishMatch(matchPublish, id, team_id);
    if (publishMatch.statusCode == 201) {
      await interaction.editReply({
        content: "Match posté !",
      });
    } else {
      await interaction.editReply({
        content: "Erreur, match non enregistré",
      });
    }
  },
};
