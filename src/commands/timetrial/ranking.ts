import {
  ActionRowBuilder,
  AutocompleteInteraction,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Role,
  SlashCommandBuilder,
} from "discord.js";

import { makeTimetrialMessage } from "../../controller/timetrialController";
import { LIST_MAPS } from "../..";
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
    )
    .addStringOption((option) =>
      option
        .setName("idroster")
        .setDescription("Roster")
        .setRequired(false)
        .addChoices(
          { name: "YFG", value: "YFG" },
          { name: "YFO", value: "YFO" }
        )
    ),
  // async autocomplete(interaction: AutocompleteInteraction) {
  //   const value = interaction.options.getFocused().toLocaleLowerCase();

  //   const filtered = filterMapList(LIST_MAPS, value);

  //   if (!interaction) return;

  //   await interaction.respond(
  //     filtered.map((choice) => ({
  //       name: `${choice.idMap} | ${choice.initialGame} ${choice.nameMap}`,
  //       value: choice.idMap,
  //     }))
  //   );
  // },

  async execute(interaction: ChatInputCommandInteraction) {
    const idMap: string[] = interaction.options.getString("idmap")!.split(" ");
    const idRoster: string | undefined =
      interaction.options.getString("idroster") ?? undefined;
    const isMobile: boolean =
      interaction.options.getBoolean("is_mobile") ?? false;
    const isShroomless: boolean =
      interaction.options.getBoolean("no_item") ?? false;
    console.log("isShroomless", isShroomless);
    const user = interaction.user;
    await interaction.deferReply();
    const message = await makeTimetrialMessage(
      idMap[0],
      idRoster,
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
