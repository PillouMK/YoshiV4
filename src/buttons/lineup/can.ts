import { ButtonInteraction } from "discord.js";
import {
  LineUpMessage,
  StatusLineUp,
  addMember,
  lineupResponse,
  updateLineupsByHour,
} from "../../controller/lineupController";
import { _getUser } from "../../controller/yfApiController";

module.exports = {
  data: {
    name: "can",
  },

  async execute(interaction: ButtonInteraction, args: string[]) {
    await interaction.deferUpdate();
    const hour: string = args[0];
    const isMix: boolean = args[1] === "mix";
    const member = await _getUser(interaction.user.id);
    const response = addMember(hour, member.data.user, StatusLineUp.Can);

    const res: LineUpMessage[] = await lineupResponse(
      hour,
      isMix,
      interaction.guildId!,
    );

    await interaction.editReply({
      embeds: res[0].embed,
      components: [res[0].buttons],
    });

    if (interaction.channelId !== "1294743209200844800") {
      await interaction.followUp({
        content: response,
      });
    }
    updateLineupsByHour(interaction.client, hour, interaction.guildId!);
  },
};
