import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bot_test")
    .setDescription("Test de data"),
  async execute(interaction: ChatInputCommandInteraction) {
    interaction.reply({
      content: "@everyone",
    });
  },
};
