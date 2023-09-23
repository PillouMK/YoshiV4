import { ActionRowBuilder, ButtonBuilder, ButtonInteraction, ButtonStyle, ChatInputCommandInteraction, Role, SlashCommandBuilder } from "discord.js";
import { createWar, editRace, raceAdd,  } from "../../controller/botwarController";
import { LineUpMessage, lineupResponse } from "../../controller/lineupController";

module.exports = {
    data: {
        name: 'lineupToggle'
    },

    async execute(interaction: ButtonInteraction, args: string[]) {
        
        
        const hour: string = args[0];
        const wasMix: boolean = args[1] === 'mix'
        const fetchedMembers = await interaction.guild?.members.fetch()
        const fetchedRoles = await interaction.guild?.roles.fetch()
        const rolesId: string[] = wasMix ? ["643871029210513419", "643569712353116170", "1124014509602897930"] : ["199252384612876289"] 
        
        let roleList: Role[] = []
        fetchedRoles?.forEach(role => {
            if(rolesId.includes(role.id)) roleList.push(role)
        })
        const res: LineUpMessage[] = await lineupResponse(hour, roleList, fetchedMembers!);
        await interaction.deferUpdate();
        await interaction.editReply({
            embeds: res[0].embed,
            components: [res[0].buttons]
        });
    }
}



