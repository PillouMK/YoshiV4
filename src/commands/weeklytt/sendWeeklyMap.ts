import {
  APIInteractionGuildMember,
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { createWar, raceAdd } from "../../controller/botwarController";
import { getAllMaps } from "../../controller/yfApiController";
import { ResponseYF } from "../../model/responseYF";
import { MapMK } from "../../model/mapDAO";
import {
  addBlank,
  botLogs,
  filterMapList,
} from "../../controller/generalController";
import { ADMIN_ROLE, LIST_MAPS } from "../..";
import { updateTimetrial } from "../../controller/timetrialController";
import {
  getAllWeeklyMap,
  sendWeeklyMap,
  setWeeklyMap,
} from "../../controller/weeklyttController";
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
