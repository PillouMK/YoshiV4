import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { createWar, raceAdd } from "../../controller/botwarController";
import { getProjectMapData, rankingMessage } from "../../controller/projectmapController";
import { botLogs } from "../../controller/generalController";
import { it } from "node:test";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('project_map')
        .setDescription('Stats des maps YF par roster')
        .addStringOption(option =>
            option.setName('roster')
                .setDescription('Team YF')
                .setRequired(true)
                .addChoices(    
                    { name: 'YFG', value: 'YFG' },
                    { name: 'YFO', value: 'YFO' },    
                ))
        .addIntegerOption(option =>
            option.setName('month')
                .setDescription('Nombre de mois max des données')
                .setRequired(true))
        .addIntegerOption(option =>
            option.setName('iterations')
                .setDescription('Nombre de données minimum pour la validité d\'une map')
                .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
       
        const idRoster = interaction.options.getString('roster')!
        const month = interaction.options.getInteger('month')!
        const iteration = interaction.options.getInteger('iterations')!

        const projectMap = await getProjectMapData(idRoster, month, iteration)
        if(projectMap == undefined) {
            try {
                await interaction.reply("Erreur lors de la récupération des données");
                const log = `${interaction.user.username} a utilisé /project_map (roster: ${idRoster}, month: ${month}, iteration: ${iteration}). ECHEC`
                botLogs(interaction.client, log);
                return
            } catch (e) {
                    console.log(e)
            }
        }

        const msg = rankingMessage(idRoster, month, iteration, projectMap!.projectMapValid, projectMap!.projectMapNotValid, false)
        const log = `${interaction.user.username} a utilisé /project_map (roster: ${idRoster}, month: ${month}, iteration: ${iteration}). Réussite de la commande`
        try {
            await interaction.reply({
                content: msg.content,
                components: [msg.buttons],
                embeds: msg.embed,
                files: [msg.file]
            });
            botLogs(interaction.client, log);
        } catch (e) {
            console.log(e)
        }
    }
}