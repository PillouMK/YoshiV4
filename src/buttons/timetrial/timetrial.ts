import { ButtonInteraction } from "discord.js";
import { botLogs } from "../../controller/generalController";
import { makeTimetrialMessage } from "../../controller/timetrialController";

module.exports = {
  data: {
    name: "timetrial",
  },

  async execute(interaction: ButtonInteraction, args: string[]) {
    await interaction.deferUpdate();

    const map_tag = args[0];
    const game_id = args[1];
    const isShroomless = args[2] === "true";
    const isMobile = args[3] === "true";
    const user = interaction.user;
    const team_id = interaction.guildId!;

    try {
      const message = await makeTimetrialMessage(
        map_tag,
        game_id,
        team_id,
        isShroomless,
        user,
        isMobile
      );
      await interaction.editReply({
        content: message.content,
        embeds: message.embed,
        components: message.buttons != undefined ? [message.buttons] : [],
      });
      botLogs(
        interaction.client,
        `${user.username} successfully updated ranking on ${map_tag}`
      );
    } catch (e: any) {
      botLogs(interaction.client, e);
      console.log(e);
    }
  },
};
