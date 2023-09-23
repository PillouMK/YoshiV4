import { ActionRowBuilder, ButtonBuilder, ButtonStyle, ChatInputCommandInteraction, Role, SlashCommandBuilder } from "discord.js";
import { createWar, editRace, raceAdd,  } from "../../controller/botwarController";
import { LineUpMessage, lineupResponse } from "../../controller/lineupController";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('lu')
        .setDescription('Line up YF')
        .addStringOption(option =>
            option.setName('horaire')
                .setDescription('Heure souhaitée')
                .setRequired(true))
        .addMentionableOption(option =>
            option.setName('test')
                .setDescription('test')
                .setRequired(false)),
    async execute(interaction: ChatInputCommandInteraction) {
        const hours: string = interaction.options.getString('horaire')!;
        let fetchedMembers = await interaction.guild?.members.fetch()
        let fetchedRoles = await interaction.guild?.roles.fetch()
        const rostersRolesId: string[] = ["643871029210513419", "643569712353116170", "1124014509602897930"];
        const roleYFId = ["199252384612876289"];
        let roleList: Role[] = []
        fetchedRoles?.forEach(role => {
            if(rostersRolesId.includes(role.id)) roleList.push(role)
        })
        const res: LineUpMessage[] = await lineupResponse(hours, roleList, fetchedMembers!);
        await interaction.deferReply();
        await interaction.editReply({
            embeds: res[0].embed,
            components: [res[0].buttons]
        });
        
        let index = 0;
        for(const resItem of res) {
            if(index === 0) {
                index++
            } else {
                await interaction.channel?.send({
                    embeds: resItem.embed,
                    components: [resItem.buttons]
                })
            }
            
        }
        
    }
}



