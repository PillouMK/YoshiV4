import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import {
  BotWarType,
  raceAdd,
  set_last_message_id,
} from "../../controller/botwarController";

import { filterMapList } from "../../controller/generalController";
import { globalData } from "../../global";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("race")
    .setDescription("course 6v6")
    .addStringOption((option) =>
      option
        .setName("spots")
        .setDescription("les 6 spots, séparés par un espace")
        .setRequired(true),
    )
    .addStringOption((option) =>
      option
        .setName("map")
        .setDescription("Tag de la map jouée")
        .setRequired(true)
        .setAutocomplete(true),
    ),

  async autocomplete(interaction: AutocompleteInteraction) {
    const value = interaction.options.getFocused().toLocaleLowerCase();
    const filtered = filterMapList(globalData.getAllMaps(), value);

    if (!interaction) return;

    const choices = filtered.map((choice) => ({
      name: `${choice.tag} | ${choice.name}`,
      value: choice.tag.toString(),
    }));

    await interaction.respond(choices);
  },

  async execute(interaction: ChatInputCommandInteraction) {
    const spots: string[] = interaction.options.getString("spots")!.split(" ");
    const map: string[] = interaction.options.getString("map")!.split(" ");
    const idChannel: string = interaction.channelId;
    const newRace = await raceAdd(spots, map[0], idChannel);

    try {
      const msg = await interaction.reply(newRace);
      set_last_message_id(msg.id, interaction.channelId);
    } catch (e: any) {
      console.log(e.requestBody.requestBody);
    }
  },
};
