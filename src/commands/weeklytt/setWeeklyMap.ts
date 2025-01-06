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
  setWeeklyMap,
} from "../../controller/weeklyttController";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set_weekly_map")
    .setDescription("Set up les prochaines maps weekly")
    .addStringOption((option) =>
      option
        .setName("map")
        .setDescription("Tag de la map")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("shroomless")
        .setDescription("TT avec ou sans item")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("goldtime").setDescription("Temps Gold").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("silvertime")
        .setDescription("Temps silver")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("bronzetime")
        .setDescription("Temps bronze")
        .setRequired(true)
    ),

  async autocomplete(interaction: AutocompleteInteraction) {
    const value = interaction.options.getFocused().toLocaleLowerCase();
    const filtered = filterMapList(LIST_MAPS, value);

    if (!interaction) return;

    const choices = filtered.map((choice) => ({
      name: `${choice.idMap} | ${choice.initialGame} ${choice.nameMap}`,
      value: choice.idMap,
    }));

    await interaction.respond(choices);
  },

  async execute(interaction: ChatInputCommandInteraction) {
    const isShroomless: boolean = interaction.options.getBoolean("shroomless")!;
    const idMap: string = interaction.options.getString("map")!.split(" ")[0];
    const goldTime: string = interaction.options.getString("goldtime")!;
    const silverTime: string = interaction.options.getString("silvertime")!;
    const bronzeTime: string = interaction.options.getString("bronzetime")!;
    const user = interaction.user;

    botLogs(
      interaction.client,
      `${user.username} used /set_weekly_map command`
    );

    const response = setWeeklyMap(
      interaction.client,
      idMap,
      isShroomless,
      goldTime,
      silverTime,
      bronzeTime
    );

    await interaction.reply(response);
  },
};
