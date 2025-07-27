import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  UserSelectMenuBuilder,
} from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lineup_war")
    .setDescription("Joueurs de la LU"),

  async execute(interaction: ChatInputCommandInteraction) {
    const selectMenu = new UserSelectMenuBuilder()
      .setCustomId("lineup_war")
      .setPlaceholder("Sélectionne les joueurs")
      .setMaxValues(8);

    const userRow = new ActionRowBuilder<UserSelectMenuBuilder>().addComponents(
      selectMenu
    );

    try {
      await interaction.reply({
        content: "Sélectionne les joueurs qui ont joué",
        components: [userRow.toJSON()],
        ephemeral: true,
      });
    } catch (e: any) {
      console.log(e.requestBody?.requestBody ?? e);
    }
  },
};
