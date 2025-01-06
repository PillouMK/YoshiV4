import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { changeTagTeam } from "../../controller/botwarController";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("set_tag")
    .setDescription("Changer le tag du botwar")
    .addStringOption((option) =>
      option
        .setName("tag")
        .setDescription("Team YF")
        .setRequired(true)
        .addChoices(
          { name: "YF", value: "YF" },
          { name: "YFG", value: "YFG" },
          { name: "YFO", value: "YFO" },
          { name: "YFS", value: "YFS" }
        )
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const team1: string = interaction.options.getString("tag")!;

    const idChannel: string = interaction.channelId;
    const changeTag = changeTagTeam(team1, idChannel);
    await interaction.reply(changeTag);
  },
};
