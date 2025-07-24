import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";

import { makeTimetrialMessage } from "../../controller/timetrialController";
import { LIST_MAPS, LIST_MAPS_MKWORLD } from "../..";
import { filterMapList } from "../../controller/generalController";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("classement")
    .setDescription("Classement Timetrial")
    .addStringOption((option) =>
      option
        .setName("idmap")
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
    .addBooleanOption((option) =>
      option.setName("no_item").setDescription("Sans item ?").setRequired(false)
    ),
  async autocomplete(interaction: AutocompleteInteraction) {
    const value = interaction.options.getFocused().toLocaleLowerCase();
    const filtered = filterMapList(LIST_MAPS_MKWORLD, value);

    if (!interaction) return;

    const choices = filtered.map((choice) => ({
      name: `${choice.tag} | ${choice.name}`,
      value: choice.id,
    }));

    await interaction.respond(choices);
  },

  async execute(interaction: ChatInputCommandInteraction) {
    const idMap: string[] = interaction.options.getString("idmap")!.split(" ");
    const isMobile: boolean =
      interaction.options.getBoolean("is_mobile") ?? false;
    const isShroomless: boolean =
      interaction.options.getBoolean("no_item") ?? false;
    const user = interaction.user;
    await interaction.deferReply();
    const message = await makeTimetrialMessage(
      idMap[0],
      undefined,
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
