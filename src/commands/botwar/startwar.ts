import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import { createWar } from "../../controller/botwarController";
import { filterMapList } from "../../controller/generalController";
import { globalData } from "../../global";
import { Team } from "../../model/team.dto";
import { Game } from "../../model/game.dto";

const optionChoices = [
  { name: "YF", value: "YF" },
  { name: "YFG", value: "YFG" },
  { name: "YFO", value: "YFO" },
];

module.exports = {
  data: new SlashCommandBuilder()
    .setName("startwar")
    .setDescription("ça fait ping et ça fait pong")
    .addStringOption((option) =>
      option
        .setName("team1")
        .setDescription("Team YF")
        .setRequired(true)
        .setAutocomplete(true)
    )
    .addStringOption((option) =>
      option.setName("team2").setDescription("Team Adverse").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("game")
        .setDescription("MK Game")
        .setRequired(false)
        .addChoices(
          { name: "MKWORLD", value: "MKWORLD" },
          { name: "MK8DX", value: "MK8DX" }
        )
    ),
  async autocomplete(interaction: AutocompleteInteraction) {
    if (!interaction) return;
    const focusedOption = interaction.options.getFocused(true);
    if (focusedOption.name === "team1") {
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
    const server_id = interaction.guildId;

    if (!server_id) {
      await interaction.reply({
        content:
          "Cette commande ne peut être utilisée que dans un serveur Discord.",
        ephemeral: true,
      });
      return;
    }

    const team1: string = interaction.options.getString("team1")!;
    const team2: string = interaction.options.getString("team2")!;
    const game: string = interaction.options.getString("game") ?? "MKWORLD";
    const idChannel: string = interaction.channelId;
    const isWarCreated = await createWar(
      interaction.client,
      server_id,
      idChannel,
      team1,
      team2,
      game
    );

    if (isWarCreated) {
      await interaction.reply(`Début du war entre ${team1} et ${team2}\n`);
    } else {
      await interaction.reply(`Il y a déjà un war en cours`);
    }
  },
};
