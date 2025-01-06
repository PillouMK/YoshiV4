import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonInteraction,
  ButtonStyle,
  ChatInputCommandInteraction,
  Role,
  SlashCommandBuilder,
  User,
} from "discord.js";
import {
  createWar,
  editRace,
  raceAdd,
} from "../../controller/botwarController";
import {
  LineUpMessage,
  addMember,
  lineupResponse,
} from "../../controller/lineupController";
import { projectMap } from "../../controller/projectmapController";
import {
  getProjectMapData,
  rankingMessage,
  updateProjectMapMessage,
} from "../../controller/projectmapController";
import { botLogs } from "../../controller/generalController";
import { makeTimetrialMessage } from "../../controller/timetrialController";
import { getWeeklytt } from "../../controller/weeklyttController";

module.exports = {
  data: {
    name: "weeklytt",
  },

  async execute(interaction: ButtonInteraction, args: string[]) {
    await interaction.deferUpdate();

    const idMap = args[0];
    const isShroomless = args[1] === "1";
    const user = interaction.user;
    botLogs(interaction.client, `${user.username} used weeklytt button`);

    try {
      const response = await getWeeklytt(
        interaction.client,
        idMap,
        isShroomless
      );

      await interaction.editReply({
        content: response.content,
        embeds: response.embed,
        components: response.buttons != undefined ? [response.buttons] : [],
      });
      botLogs(
        interaction.client,
        `${user.username} successfully updated weeklytt on ${idMap}`
      );
    } catch (e: any) {
      botLogs(interaction.client, e);
      console.log(e);
    }
  },
};
