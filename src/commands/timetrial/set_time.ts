import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { botLogs, filterMapList } from "../../controller/generalController";
import { LIST_MAPS, LIST_MAPS_MKWORLD } from "../..";
import { updateTimetrial } from "../../controller/timetrialController";
import { Team } from "../../model/team.dto";
import { globalData } from "../../global";
import { Game } from "../../model/game.dto";

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
    .addStringOption((option) =>
      option
        .setName("game")
        .setDescription("Jeu")
        .setRequired(false)
        .setAutocomplete(true)
    )
    .addBooleanOption((option) =>
      option.setName("no_item").setDescription("No item ?").setRequired(false)
    ),

  async autocomplete(interaction: AutocompleteInteraction) {
    if (!interaction) return;
    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name === "map") {
      const selectedGameId: string =
        interaction.options.getString("game") ?? "MKWORLD";

      const value = interaction.options.getFocused().toLocaleLowerCase();
      const filtered = filterMapList(
        globalData.getAllMaps(selectedGameId),
        value
      );

      if (!interaction) return;

      const choices = filtered.map((choice) => ({
        name: `${choice.tag} | ${choice.name}`,
        value: choice.tag.toString(),
      }));

      await interaction.respond(choices);
    } else if (focusedOption.name === "game") {
      const games: Game[] = globalData.getAllGames();

      const choices = games.map((choice) => ({
        name: `${choice.id} | ${choice.name}`,
        value: choice.id.toString(),
      }));

      await interaction.respond(choices);
    }
  },
  async execute(interaction: ChatInputCommandInteraction) {
    const time: string = interaction.options.getString("time")!;
    const map_tag: string[] = interaction.options.getString("map")!.split(" "); // prevent user refocus
    const isShroomless: boolean =
      interaction.options.getBoolean("no_item") ?? false;
    const user = interaction.user;
    const selectedGameId: string =
      interaction.options.getString("game") ?? "MKWORLD";

    botLogs(interaction.client, `${user.username} used /set_tt command`);
    const response = await updateTimetrial(
      time,
      map_tag[0],
      isShroomless,
      user,
      selectedGameId,
      interaction.client
    );

    await interaction.reply(response);
  },
};
