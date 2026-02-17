import {
  ChatInputCommandInteraction,
  Role,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import {
  LineUpMessage,
  lineupResponse,
  pushTempMessage,
} from "../../controller/lineupController";
import { ROLES } from "../..";
import { sortByRoleId } from "../../controller/generalController";
import { globalData } from "../../global";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lu")
    .setDescription("Line up YF")
    .addStringOption((option) =>
      option
        .setName("horaire")
        .setDescription("Heure souhaitée")
        .setRequired(true),
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const hours: string = interaction.options.getString("horaire")!;
    const res: LineUpMessage[] = await lineupResponse(
      hours,
      true,
      interaction.guildId!,
    );
    await interaction.deferReply();
    const message = await interaction.editReply({
      embeds: res[0].embed,
      components: [res[0].buttons],
    });
    pushTempMessage(message.id, message.channelId, res[0].hour);

    let index = 0;
    for (const resItem of res) {
      if (index === 0) {
        index++;
      } else {
        const msg = await (interaction.channel as TextChannel).send({
          embeds: resItem.embed,
          components: [resItem.buttons],
        });
        pushTempMessage(msg.id, msg.channelId, resItem.hour);
      }
    }
  },
};
