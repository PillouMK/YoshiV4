import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { botLogs } from "../../controller/generalController";
import {
  getAllWeeklyMap,
  updateWeeklyTimetrial,
} from "../../controller/weeklyttController";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set_weeklytt")
    .setDescription("Enregistrer un temps (Weekly TT)")
    .addStringOption((option) =>
      option
        .setName("map")
        .setDescription("Tag de la map")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("temps")
        .setDescription("Temps : xx:xx.xxx")
        .setRequired(true)
    ),

  async autocomplete(interaction: AutocompleteInteraction) {
    const list = await getAllWeeklyMap();

    if (!interaction) return;

    await interaction.respond(
      list.map((choice) => ({
        name: `${choice.idMap} | ${choice.isShroomless ? "No item" : "Item"}`,
        value: `${choice.idMap}-${choice.isShroomless}`,
      }))
    );
  },

  async execute(interaction: ChatInputCommandInteraction) {
    const time: string = interaction.options.getString("temps")!;
    const idMap: string = interaction.options.getString("map")!.split("-")[0];
    const isShroomless: boolean =
      interaction.options.getString("map")!.split("-")[1] === "1";

    const user = interaction.user;

    botLogs(interaction.client, `${user.username} used /set_weeklytt command`);
    const response = await updateWeeklyTimetrial(
      time,
      idMap,
      isShroomless,
      user,
      interaction.client
    );

    await interaction.reply(response);
  },
};
