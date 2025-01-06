import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { botLogs } from "../../controller/generalController";
import settings from "../../settings.json";
import { ADMIN_ROLE } from "../..";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bot_test")
    .setDescription("Test de data"),
  async execute(interaction: ChatInputCommandInteraction) {
    const member: GuildMember | null = await interaction.client.guilds.cache
      .get(settings.serverId)!
      .members.fetch(interaction.user.id);

    if (member.roles.cache.has(ADMIN_ROLE)) {
      botLogs(
        interaction.client,
        `${interaction.user.username} used /bot_test command`
      );

      await interaction.reply("test");
    } else {
      await interaction.reply(
        "Tu n'as pas les permissions pour utiliser cette commande"
      );
    }
  },
};
