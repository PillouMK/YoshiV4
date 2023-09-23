import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { createWar, raceAdd } from "../../controller/botwarController";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('race')
        .setDescription('course 6v6')
        .addStringOption(option =>
            option.setName('spots')
                .setDescription('les 6 spots, séparés par un espace')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('map')
                .setDescription('Tag de la map jouée')
                .setRequired(true)),
    async execute(interaction: ChatInputCommandInteraction) {
        const spots: string[] = interaction.options.getString('spots')!.split(' ');
        const map: string = interaction.options.getString('map')!
        const idChannel: string = interaction.channelId;
        const newRace = await raceAdd(spots, map, idChannel);

        await interaction.reply(newRace);
       
    }
}