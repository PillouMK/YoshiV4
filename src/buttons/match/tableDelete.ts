import { ButtonInteraction } from "discord.js";
import { globalData } from "../../global";

module.exports = {
  data: {
    name: "tableDelete",
  },

  async execute(interaction: ButtonInteraction, args: string[]) {
    const id: string = args[0];
    globalData.deleteMatchPreview(id);

    await interaction.message.delete();

    await interaction.reply({
      content: "Tableau annulé",
    });
  },
};
