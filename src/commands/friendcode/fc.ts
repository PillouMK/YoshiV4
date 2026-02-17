import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  User,
} from "discord.js";
import { botLogs, getUserFriendCode } from "../../controller/generalController";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fc")
    .setDescription("Code ami du joueur")
    .addUserOption((option) =>
      option
        .setName("player")
        .setDescription("Heure souhaitée")
        .setRequired(false),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    let id: string = "";
    const player: User | null = interaction.options.getUser("player")!;

    if (player == null) id = interaction.user.id;
    else id = player.id;

    botLogs(
      interaction.client,
      `${interaction.user.username} used /fc command`,
    );
    interaction.reply({
      content: getUserFriendCode(id),
    });
  },
};
