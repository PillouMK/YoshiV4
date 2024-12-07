import {
  ActionRowBuilder,
  ButtonBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { getAllMaps } from "../../controller/yfApiController";
import {
  timetrialFinalRanking,
  updateTimetrial,
} from "../../controller/timetrialController";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bot_test")
    .setDescription("Test de data"),
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      const msg = await timetrialFinalRanking(interaction.client, false);
      const actionRowBuilders: ActionRowBuilder<ButtonBuilder>[] = [
        msg.buttons!,
      ];
      console.log(actionRowBuilders);

      // Convertir ActionRowBuilder en tableau d'objets d'action
      const actionRows = actionRowBuilders.map((actionRowBuilder) =>
        actionRowBuilder.toJSON()
      );
      (interaction.channel as TextChannel)?.send({
        content: "La vue Mobile n'affiche que le joueurs ayant 10 pts ou +",
        embeds: msg.embed,
        files: msg.file,
        components: actionRowBuilders,
      });
    } catch (e) {
      console.log(e);
    }
  },
};
