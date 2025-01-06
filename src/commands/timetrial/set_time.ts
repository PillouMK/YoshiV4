import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { botLogs, filterMapList } from "../../controller/generalController";
import { LIST_MAPS } from "../..";
import { updateTimetrial } from "../../controller/timetrialController";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set_tt")
    .setDescription("Enregistrer un temps")
    .addStringOption((option) =>
      option
        .setName("map")
        .setDescription("Tag de la map jouée")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("time")
        .setDescription("Temps : xx:xx.xxx")
        .setRequired(true)
    )
    .addBooleanOption((option) =>
      option.setName("no_item").setDescription("No item ?").setRequired(false)
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
    const time: string = interaction.options.getString("time")!;
    const idMap: string[] = interaction.options.getString("map")!.split(" "); // prevent user refocus
    const isShroomless: boolean =
      interaction.options.getBoolean("no_item") ?? false;
    const user = interaction.user;

    botLogs(interaction.client, `${user.username} used /set_tt command`);
    const response = await updateTimetrial(
      time,
      idMap[0],
      isShroomless,
      user,
      interaction.client
    );

    await interaction.reply(response);
  },
};
