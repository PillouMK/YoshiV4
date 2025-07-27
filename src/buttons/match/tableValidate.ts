import {
  AttachmentBuilder,
  ButtonInteraction,
  Client,
  Role,
  TextChannel,
  User,
} from "discord.js";
import {
  LineUpMessage,
  StatusLineUp,
  addMember,
  lineupResponse,
  updateLineupsByHour,
} from "../../controller/lineupController";
import { ROLE_YF, ROLE_YF_TEST, ROLES } from "../..";
import { sortByRoleId } from "../../controller/generalController";
import { _publishMatch } from "../../controller/yfApiController";
import { MatchPreview, MatchPublish } from "../../model/match.dto";
import { globalData } from "../../global";
import axios from "axios";

module.exports = {
  data: {
    name: "tableValidate",
  },

  async execute(interaction: ButtonInteraction, args: string[]) {
    const id: string = args[0];
    const matchData = globalData.getFullMatchPreview(id);
    console.log("url:", matchData?.table_url);

    await interaction.deferReply();

    await interaction.message.edit({
      components: [],
    });

    const channel = (await interaction.client.channels.fetch(
      "459663694381711360"
    )) as TextChannel;

    const response = await axios.get(matchData?.table_url!, {
      responseType: "arraybuffer",
    });

    const buffer = Buffer.from(response.data, "binary");

    const file = new AttachmentBuilder(buffer, { name: "image.png" });

    const msg = await channel.send({
      content: "Match : n°" + id,
      files: [file],
    });

    const matchPublish: MatchPublish = {
      message_id: msg.id,
      own_team: matchData?.data.own_team!,
      table_url: matchData?.table_url!,
    };
    const publishMatch = await _publishMatch(matchPublish, id);
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
