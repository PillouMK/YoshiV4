import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { createWar } from "../../controller/botwarController";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('startwar')
        .setDescription('ça fait ping et ça fait pong')
        .addStringOption(option =>
            option.setName('team1')
                .setDescription('Team YF')
                .setRequired(true)
                .addChoices(
                    { name: 'YF', value: 'YF' },
                    { name: 'YFG', value: 'YFG' },
                    { name: 'YFO', value: 'YFO' },
                    { name: 'YFS', value: 'YFS' },
                ))
        .addStringOption(option =>
            option.setName('team2')
                .setDescription('Team Adverse')
                .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        const team1: string = interaction.options.getString('team1')!
        const team2: string = interaction.options.getString('team2')!
        const idChannel: string = interaction.channelId;
        const isWarCreated = createWar(idChannel, team1, team2)

        if(isWarCreated) {
            let saveDataMsg: string = (team1 === "YFG" || team1 === "YFO") ? "Sauvegarde des données activées" : "Pas de sauvegardes d'activées"
            await interaction.reply(`Début du war entre ${team1} et ${team2}\n${saveDataMsg}`)
        } else {
            await interaction.reply(`Il y a déjà un war en cours`)
        }
    }
}