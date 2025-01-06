import { ButtonInteraction } from "discord.js";
import { botLogs } from "../../controller/generalController";
import { makeTimetrialMessage } from "../../controller/timetrialController";

module.exports = {
  data: {
    name: "timetrial",
  },

  async execute(interaction: ButtonInteraction, args: string[]) {
    await interaction.deferUpdate();

    const idRoster = args[0] === "YF" ? undefined : args[0];
    const idMap = args[1];
    const isShroomless = args[2] === "true";
    const isMobile = args[3] === "true";
    const user = interaction.user;

    try {
      const message = await makeTimetrialMessage(
        idMap,
        idRoster,
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
        `${user.username} successfully updated ranking on ${idMap}`
      );
    } catch (e: any) {
      botLogs(interaction.client, e);
      console.log(e);
    }
  },
};
