import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { rankingMessage } from "../../controller/projectmapController";
import { botLogs } from "../../controller/generalController";
import { globalData } from "../../global";
import { Game } from "../../model/game.dto";
import { Team } from "../../model/team.dto";
import { _getAllMapStats } from "../../controller/yfApiController";
import { GetMapStats, MapStatsParam } from "../../model/map-stats.dto";
import { ResponseAPI } from "../../model/responseYF";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("project_map")
    .setDescription("Stats des maps YF par roster")
    .addIntegerOption((option) =>
      option
        .setName("month")
        .setDescription("Nombre de mois max des données")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("roster")
        .setDescription("Choose a roster")
        .setRequired(false)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option
        .setName("game")
        .setDescription("Jeu")
        .setRequired(false)
        .setAutocomplete(true)
    ),
  async autocomplete(interaction: AutocompleteInteraction) {
    if (!interaction) return;
    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name === "roster") {
      const team: Team | undefined = globalData.getTeam(
        interaction.guildId ?? ""
      );

      if (team?.rosters == undefined) return;

      const choices = [
        {
          name: `${team.tag} | ${team.name}`,
          value: team.tag,
        },
        ...team.rosters.map((choice) => ({
          name: `${choice.tag} | ${choice.name}`,
          value: choice.tag.toString(),
        })),
      ];

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
    const roster_tag = interaction.options.getString("roster")?.split(" ")[0];
    const month = interaction.options.getInteger("month");
    const team_id: string = interaction.guildId!;
    const game = interaction.options.getString("game") ?? "MKWORLD";
    const dto: MapStatsParam = {
      game_id: game,
      team_id: team_id,
      months: month ?? null,
      roster_tag: roster_tag ?? null,
    };

    const projectMap: ResponseAPI<GetMapStats> = await _getAllMapStats(dto);
    if (projectMap.statusCode != 200) {
      try {
        await interaction.reply("Erreur lors de la récupération des données");
        botLogs(interaction.client, projectMap.data.toString());
        return;
      } catch (e) {
        console.log(e);
      }
    }
    const msg = rankingMessage(
      projectMap.data,
      false,
      team_id,
      roster_tag,
      month ?? undefined
    );
    try {
      await interaction.reply({
        content: msg.content,
        // components: [msg.buttons],
        embeds: msg.embed,
        files: [msg.file],
      });
    } catch (e) {
      console.log(e);
    }
  },
};
