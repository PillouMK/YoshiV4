import { ButtonInteraction, Role } from "discord.js";
import {
  LineUpMessage,
  lineupResponse,
  toggleMessage,
} from "../../controller/lineupController";
import { ROLE_YF, ROLES } from "../..";

module.exports = {
  data: {
    name: "lineupToggle",
  },

  async execute(interaction: ButtonInteraction, args: string[]) {
    const hour: string = args[0];
    const isMix: boolean = args[1] === "mix";
    const fetchedMembers = await interaction.guild?.members.fetch();
    const fetchedRoles = await interaction.guild?.roles.fetch();
    const rolesId: string[] = isMix ? [ROLE_YF] : ROLES;

    let roleList: Role[] = [];
    fetchedRoles?.forEach((role) => {
      if (rolesId.includes(role.id)) roleList.push(role);
    });
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
    toggleMessage(interaction.message.id, isMix);
  },
};
