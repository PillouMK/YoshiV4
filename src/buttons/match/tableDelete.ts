import { ButtonInteraction } from "discord.js";

import { _publishMatch } from "../../controller/yfApiController";
import { globalData } from "../../global";

module.exports = {
  data: {
    name: "tableDelete",
  },

  async execute(interaction: ButtonInteraction, args: string[]) {
    const id: string = args[0];
    const matchData = globalData.deleteMatchPreview(id);

    await interaction.reply({
      content: "Tableau annulé",
    });
  },
};
