import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { botLogs } from "../../controller/generalController";

import { getWeeklytt } from "../../controller/weeklyttController";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("weeklytt")
    .setDescription("Afficher les temps weekly"),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.user;

    botLogs(interaction.client, `${user.username} used /weeklytt command`);
    const response = await getWeeklytt(interaction.client);

    await interaction.reply({
      content: response.content,
      embeds: response.embed,
      components: response.buttons != undefined ? [response.buttons] : [],
    });
  },
};
