import { ButtonInteraction } from "discord.js";
module.exports = {
  data: {
    name: "projectmap",
  },

  async execute(interaction: ButtonInteraction) {
    await interaction.deferUpdate();
  },
};
