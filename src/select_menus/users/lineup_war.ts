import {
  StringSelectMenuInteraction,
  UserSelectMenuInteraction,
} from "discord.js";
import { generateMatchPreviewText } from "../../controller/generalController";

module.exports = {
  data: {
    name: "lineup_war",
  },
  async execute(interaction: UserSelectMenuInteraction, args: string[]) {
    const selectedUsers = Array.from(interaction.users.values());
    console.log(selectedUsers);
    const generated_text = generateMatchPreviewText(selectedUsers);
    await interaction.reply({
      content:
        'Copie le message, remplit les score (Ne supprime pas les "-" et les "+"), Tu n\'est pas obligé de modifier les FLAG```\n' +
        generated_text +
        "\n```",
    });
  },
};
