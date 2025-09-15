import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

import { makeTimetrialMessage } from "../../controller/timetrialController";
import { filterMapList } from "../../controller/generalController";
import { globalData } from "../../global";
import { Game } from "../../model/game.dto";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("classement")
    .setDescription("Classement Timetrial")
    .addStringOption((option) =>
      option
        .setName("map")
        .setDescription("Map souhaitée")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addBooleanOption((option) =>
      option
        .setName("is_mobile")
        .setDescription("Vue Mobile")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("game")
        .setDescription("Jeu")
        .setRequired(false)
        .setAutocomplete(true)
    )
    .addBooleanOption((option) =>
      option.setName("no_item").setDescription("Sans item ?").setRequired(false)
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
    const map_tag: string[] = interaction.options.getString("map")!.split(" "); // prevent user refocus
    const game_id: string = interaction.options.getString("game") ?? "MKWORLD";
    const isMobile: boolean =
      interaction.options.getBoolean("is_mobile") ?? false;
    const isShroomless: boolean =
      interaction.options.getBoolean("no_item") ?? false;
    const user = interaction.user;
    const team_id = interaction.guildId!;

    await interaction.deferReply();

    const message = await makeTimetrialMessage(
      map_tag[0],
      game_id,
      team_id,
      isShroomless,
      user,
      isMobile
    );
    await interaction.editReply({
      content: message.content,
      embeds: message.embed,
      components: message.buttons != undefined ? [message.buttons] : [],
    });
  },
};
