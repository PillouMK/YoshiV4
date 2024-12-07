import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  User,
} from "discord.js";
import fc from "../../database/fc.json";
import { botLogs } from "../../controller/generalController";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("fc")
    .setDescription("Code ami du joueur")
    .addUserOption((option) =>
      option
        .setName("player")
        .setDescription("Heure souhaitée")
        .setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    let id: string = "";
    const fcJson: Record<string, string> = fc.friendcode;
    const player: User | null = interaction.options.getUser("player")!;

    if (player == null) id = interaction.user.id;
    else id = player.id;

    botLogs(
      interaction.client,
      `${interaction.user.username} used /fc command`
    );
    if (fcJson[id] != undefined) {
      interaction.reply({
        content: fcJson[id],
      });
    } else {
      ("Je ne possède pas le code ami de cet utilisateur");
    }
  },
};
