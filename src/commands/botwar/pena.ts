import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { addPena } from "../../controller/botwarController";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("pena")
    .setDescription("Ajouter une pénalité à une équipe")
    .addStringOption((option) =>
      option
        .setName("team")
        .setDescription("Team recevant la pénalité")
        .setRequired(true)
        .addChoices({ name: "YF", value: "YF" }, { name: "Adv", value: "adv" })
    )
    .addIntegerOption((option) =>
      option
        .setName("pénalité")
        .setDescription("Nombre de points à retirer")
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const team: string = interaction.options.getString("team")!;
    const pena: number = interaction.options.getInteger("pénalité")!;
    const idChannel: string = interaction.channelId;

    const penaMsg: string = addPena(team, pena, idChannel);

    await interaction.reply(penaMsg);
  },
};
