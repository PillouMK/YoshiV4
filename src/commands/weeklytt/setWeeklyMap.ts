import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import settings from "../../settings.json";
import { botLogs, filterMapList } from "../../controller/generalController";
import { ADMIN_ROLE, LIST_MAPS, LIST_MAPS_MKWORLD } from "../..";
import { setWeeklyMap } from "../../controller/weeklyttController";

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
    const filtered = filterMapList(LIST_MAPS_MKWORLD, value);

    if (!interaction) return;

    const choices = filtered.map((choice) => ({
      name: `${choice.tag} | ${choice.name}`,
      value: choice.id,
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

    const member: GuildMember | null = await interaction.client.guilds.cache
      .get(settings.serverId)!
      .members.fetch(interaction.user.id);

    if (member.roles.cache.has(ADMIN_ROLE)) {
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
    } else {
      await interaction.reply(
        "Tu n'as pas les permissions pour utiliser cette commande"
      );
    }
  },
};
