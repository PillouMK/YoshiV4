import {
  AutocompleteInteraction,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
} from "discord.js";
import {
  BotWarType,
  editRace,
  getNumberOfRace,
} from "../../controller/botwarController";
import {
  filterMapList,
  saveJSONToFile,
} from "../../controller/generalController";
import { globalData } from "../../global";
import botWarData from "../../database/bot-war.json";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("edit_race")
    .setDescription("Editer une course 6v6")
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
    )
    .addIntegerOption((option) =>
      option
        .setName("race")
        .setDescription("numéro de la course")
        .setRequired(false)
        .setAutocomplete(true)
    ),

  async autocomplete(interaction: AutocompleteInteraction) {
    const channelId: string = interaction.channelId;
    const focusedOption = interaction.options.getFocused(true);

    if (focusedOption.name === "map") {
      const filtered = filterMapList(
        globalData.getAllMaps(),
        focusedOption.value
      );
      await interaction.respond(
        filtered.map((choice) => ({
          name: `${choice.tag} | ${choice.name}`,
          value: choice.tag.toString(),
        }))
      );
    } else if (focusedOption.name === "race") {
      const races = getNumberOfRace(channelId);
      const choices: number[] = [];
      for (let i = 1; i <= races; i++) {
        choices.push(i);
      }

      await interaction.respond(
        choices.map((choice) => ({
          name: choice.toString(),
          value: choice,
        }))
      );
    } else {
      // Ne répond pas si le nom de l'option n'est pas reconnu
      return;
    }
  },

  async execute(interaction: ChatInputCommandInteraction) {
    const botwar: BotWarType = botWarData as BotWarType;
    const botwarPath: string = "./src/database/bot-war.json";
    const spots: string[] = interaction.options.getString("spots")!.split(" ");
    const map: string[] = interaction.options.getString("map")!.split(" ");
    const idChannel: string = interaction.channelId;
    const race: number =
      interaction.options.getInteger("race") ?? getNumberOfRace(idChannel);
    const newRace = await editRace(spots, map[0], idChannel, race.toString());
    const war = botwar.channels[idChannel];

    try {
      const msg = await interaction.reply(newRace);
      war.paramWar.last_message_id = `${interaction.channelId}/${msg.id}`;
      saveJSONToFile(botwar, botwarPath);
    } catch (e: any) {
      console.log(e.requestBody.requestBody);
    }
  },
};
