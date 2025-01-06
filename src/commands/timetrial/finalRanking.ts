import {
  ActionRowBuilder,
  ButtonBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { timetrialFinalRanking } from "../../controller/timetrialController";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("final_ranking")
    .setDescription("Ranking TT de la YF"),
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const response = await timetrialFinalRanking(interaction.client, false);
      interaction.reply({
        content: "Classement TT de la YF",
        embeds: response.embed,
        components: response.buttons != undefined ? [response.buttons] : [],
        files: response.file,
      });
    } catch (e) {
      console.log(e);
    }
  },
};
