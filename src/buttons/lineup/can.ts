import { ButtonInteraction, Role, User } from "discord.js";
import {
  LineUpMessage,
  StatusLineUp,
  addMember,
  lineupResponse,
  updateLineupsByHour,
} from "../../controller/lineupController";
import { ROLE_YF, ROLES } from "../..";
import { sortByRoleId } from "../../controller/generalController";

module.exports = {
  data: {
    name: "can",
  },

  async execute(interaction: ButtonInteraction, args: string[]) {
    const hour: string = args[0];
    const member: User = interaction.user;
    const isMix: boolean = args[1] === "mix";
    const response = addMember(hour, member, StatusLineUp.Can);
    const fetchedMembers = await interaction.guild?.members.fetch();
    const fetchedRoles = await interaction.guild?.roles.fetch();
    const rolesId: string[] = isMix ? [ROLE_YF] : ROLES;
    let roleList: Role[] = [];
    fetchedRoles?.forEach((role) => {
      if (rolesId.includes(role.id)) roleList.push(role);
    });
    sortByRoleId(roleList, ROLES[0]);
    const res: LineUpMessage[] = await lineupResponse(
      hour,
      roleList,
      fetchedMembers!
    );
    await interaction.deferUpdate();
    await interaction.editReply({
      embeds: res[0].embed,
      components: [res[0].buttons],
    });

    if (interaction.channelId !== "1294743209200844800") {
      await interaction.followUp({
        content: response,
      });
    }
    updateLineupsByHour(interaction.client, hour);
  },
};
