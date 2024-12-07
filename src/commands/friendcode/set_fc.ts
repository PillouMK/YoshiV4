import {
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  User,
} from "discord.js";
import fc from "../../database/fc.json";
import { botLogs, saveJSONToFile } from "../../controller/generalController";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set_fc")
    .setDescription("Ajouter Code ami du joueur")
    .addStringOption((option) =>
      option
        .setName("friendcode")
        .setDescription("Code ami switch : XXXX-XXXX-XXXX-XXXX")
        .setRequired(true)
    )
    .addUserOption((option) =>
      option
        .setName("player")
        .setDescription("Heure souhaitée")
        .setRequired(false)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    interface FriendCodes {
      friendcode: {
        [idPlayer: string]: string;
      };
    }
    let id: string = "";
    const fcJson = fc as FriendCodes;
    const fc_path: string = "./src/database/fc.json";
    const player: User | null = interaction.options.getUser("player")!;
    const fc_input: string = interaction.options.getString("friendcode")!;
    const regex = /^\d{4}-\d{4}-\d{4}$/;

    if (!regex.test(fc_input)) {
      botLogs(
        interaction.client,
        `${interaction.user.username} used /set_fc : wrong fc format`
      );
      interaction.reply({
        content: `${fc_input} n'est pas au bon format\nLe Code ami doit être au format XXXX-XXXX-XXXX-XXXX`,
      });
      return;
    }

    id = player == null ? (id = interaction.user.id) : (id = player.id);

    if (fcJson.friendcode[id] != undefined) {
      botLogs(
        interaction.client,
        `${interaction.user.username} used /set_fc : updated fc`
      );
      fcJson.friendcode[id] = fc_input;
      saveJSONToFile(fcJson, fc_path);
      interaction.reply({
        content: "Code ami modifié",
      });
    } else {
      botLogs(
        interaction.client,
        `${interaction.user.username} used /set_fc : added fc`
      );
      fcJson.friendcode[id] = fc_input;
      saveJSONToFile(fcJson, fc_path);
      interaction.reply({
        content: "Code ami modifié",
      });
    }
  },
};
