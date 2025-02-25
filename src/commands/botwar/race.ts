import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { raceAdd } from "../../controller/botwarController";

import { filterMapList } from "../../controller/generalController";
import { LIST_MAPS } from "../..";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("race")
    .setDescription("course 6v6")
    .addStringOption((option) =>
      option
        .setName("spots")
        .setDescription("les 6 spots, séparés par un espace")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("map")
        .setDescription("Tag de la map jouée")
        .setRequired(true)
        .setAutocomplete(true)
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
    const spots: string[] = interaction.options.getString("spots")!.split(" ");
    const map: string[] = interaction.options.getString("map")!.split(" ");
    const idChannel: string = interaction.channelId;
    const newRace = await raceAdd(spots, map[0], idChannel);

    try {
      await interaction.reply(newRace);
    } catch (e: any) {
      console.log(e.requestBody.requestBody);
    }
  },
};
