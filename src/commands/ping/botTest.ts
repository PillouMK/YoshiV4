import {
  ActionRowBuilder,
  ButtonBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import { getAllMaps } from "../../controller/yfApiController";
import {
  timetrialFinalRanking,
  updateTimetrial,
} from "../../controller/timetrialController";
import { getAllWeeklyMap } from "../../controller/weeklyttController";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bot_test")
    .setDescription("Test de data"),
  async execute(interaction: ChatInputCommandInteraction) {
    try {
      getAllWeeklyMap();
    } catch (e) {
      console.log(e);
    }
  },
};
