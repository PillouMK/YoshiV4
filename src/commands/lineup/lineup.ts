import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  ChatInputCommandInteraction,
  Role,
  SlashCommandBuilder,
  TextChannel,
} from "discord.js";
import {
  createWar,
  editRace,
  raceAdd,
} from "../../controller/botwarController";
import {
  LineUpMessage,
  lineupResponse,
} from "../../controller/lineupController";
import { ROLE_YF, ROLES } from "../..";
import { sortByRoleId } from "../../controller/generalController";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("lu")
    .setDescription("Line up YF")
    .addStringOption((option) =>
      option
        .setName("horaire")
        .setDescription("Heure souhaitée")
        .setRequired(true)
    ),
  async execute(interaction: ChatInputCommandInteraction) {
    const hours: string = interaction.options.getString("horaire")!;
    let fetchedMembers = await interaction.guild?.members.fetch();
    let fetchedRoles = await interaction.guild?.roles.fetch();
    const rostersRolesId: string[] = ROLES;
    let roleList: Role[] = [];
    fetchedRoles?.forEach((role) => {
      if (rostersRolesId.includes(role.id)) roleList.push(role);
    });
    sortByRoleId(roleList, ROLES[0]);
    const res: LineUpMessage[] = await lineupResponse(
      hours,
      roleList,
      fetchedMembers!
    );
    await interaction.deferReply();
    await interaction.editReply({
      embeds: res[0].embed,
      components: [res[0].buttons],
    });

    let index = 0;
    for (const resItem of res) {
      if (index === 0) {
        index++;
      } else {
        await (interaction.channel as TextChannel).send({
          embeds: resItem.embed,
          components: [resItem.buttons],
        });
      }
    }
  },
};
