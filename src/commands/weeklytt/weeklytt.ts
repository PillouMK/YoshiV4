import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
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
import { LIST_MAPS } from "../..";
import { updateTimetrial } from "../../controller/timetrialController";
import {
  getAllWeeklyMap,
  getWeeklytt,
  updateWeeklyTimetrial,
} from "../../controller/weeklyttController";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("weeklytt")
    .setDescription("Afficher les temps weekly"),

  async execute(interaction: ChatInputCommandInteraction) {
    const user = interaction.user;

    botLogs(interaction.client, `${user.username} used /weeklytt command`);
    const response = await getWeeklytt(interaction.client);

    await interaction.reply({
      content: response.content,
      embeds: response.embed,
      components: response.buttons != undefined ? [response.buttons] : [],
    });
  },
};
