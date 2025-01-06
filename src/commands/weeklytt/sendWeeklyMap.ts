import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";

import { botLogs } from "../../controller/generalController";
import { ADMIN_ROLE } from "../..";
import { sendWeeklyMap } from "../../controller/weeklyttController";
import settings from "../../settings.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("send_weekly_map")
    .setDescription("Commence une nouvelle session weekly"),

  async execute(interaction: ChatInputCommandInteraction) {
    const member: GuildMember | null = await interaction.client.guilds.cache
      .get(settings.serverId)!
      .members.fetch(interaction.user.id);

    if (member.roles.cache.has(ADMIN_ROLE)) {
      botLogs(
        interaction.client,
        `${interaction.user.username} used /send_weekly_map command`
      );

      const response = await sendWeeklyMap(interaction.client);

      await interaction.reply(response);
    } else {
      await interaction.reply(
        "Tu n'as pas les permissions pour utiliser cette commande"
      );
    }
  },
};
