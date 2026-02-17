import { ButtonInteraction, Role } from "discord.js";
import {
  LineUpMessage,
  lineupResponse,
  toggleMessage,
} from "../../controller/lineupController";

module.exports = {
  data: {
    name: "lineupToggle",
  },

  async execute(interaction: ButtonInteraction, args: string[]) {
    await interaction.deferUpdate();
    const hour: string = args[0];
    const isMix: boolean = args[1] === "mix";

    const res: LineUpMessage[] = await lineupResponse(
      hour,
      isMix,
      interaction.guildId!,
    );

    await interaction.editReply({
      embeds: res[0].embed,
      components: [res[0].buttons],
    });
    toggleMessage(interaction.message.id, isMix);
  },
};
