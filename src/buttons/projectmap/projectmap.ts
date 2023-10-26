import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, Role, SlashCommandBuilder, User } from "discord.js";
import { createWar, editRace, raceAdd,  } from "../../controller/botwarController";
import { LineUpMessage, addMember, lineupResponse } from "../../controller/lineupController";
import { projectMap } from "../../controller/projectmapController";
import { getProjectMapData, rankingMessage, updateProjectMapMessage } from "../../controller/projectmapController";
import { botLogs } from "../../controller/generalController";
module.exports = {
    data: {
        name: 'projectmap'
    },

    async execute(interaction: ButtonInteraction, args: string[]) {
        await interaction.deferUpdate();
        
        const isMobile = args[0] === 'pc' ? false : true
        const idRoster = args[1]
        if(projectMap[idRoster] == undefined) {
            
            projectMap[idRoster] = await getProjectMapData(idRoster, 3, 10);
        }
        if(projectMap[idRoster] != undefined) {
			const msg = rankingMessage(idRoster, 3, 10, projectMap[idRoster]!.projectMapValid, projectMap[idRoster]!.projectMapNotValid, isMobile)
            try {
                await interaction.editReply({
                    content: msg.content,
                    components: [msg.buttons],
                    embeds: msg.embed,
                    files: [msg.file]
                });
                const log = `${interaction.user.username} used ProjectMap Button with success`
                botLogs(interaction.client, log);
            } catch (e) {
                console.log(e)
            }
        } else {
			try {
                botLogs(interaction.client, "Erreur ProjectMap API");
            } catch (err) {
                console.log(err)
            }
		}
        
        
        
        
        
    }
}



