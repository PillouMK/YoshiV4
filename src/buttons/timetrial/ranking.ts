import { ButtonInteraction } from "discord.js";
import { botLogs } from "../../controller/generalController";
import { timetrialFinalRanking } from "../../controller/timetrialController";

module.exports = {
  data: {
    name: "ranking",
  },

  async execute(interaction: ButtonInteraction, args: string[]) {
    await interaction.deferUpdate();
    const user = interaction.user;
    const isMobile = args[0] === "true";

    try {
      const message = await timetrialFinalRanking(interaction.client, isMobile);
      await interaction.editReply({
        content: message.content,
        embeds: message.embed,
        components: message.buttons != undefined ? [message.buttons] : [],
      });
      botLogs(
        interaction.client,
        `${user.username} successfully updated timetrial ranking`
      );
    } catch (e: any) {
      botLogs(interaction.client, e);
      console.log(e);
    }
  },
};
