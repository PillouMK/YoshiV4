import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { stopWar } from "../../controller/botwarController";
import { updateProjectMapMessage } from "../../controller/projectmapController";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("stopwar")
    .setDescription("Stopper le war")
    .addBooleanOption((option) =>
      option
        .setName("force")
        .setDescription(
          "Forcer l'arrêt du war si les 12 courses n'ont pas été jouée"
        )
        .setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const idChannel: string = interaction.channelId;
    const isForce: boolean = interaction.options.getBoolean("force") ?? false;

    const stopTheWar = await stopWar(interaction.client, idChannel, isForce);
    await interaction.reply(stopTheWar);
  },
};
