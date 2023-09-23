import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { createWar, editRace, raceAdd,  } from "../../controller/botwarController";

module.exports = {
    data: new SlashCommandBuilder()
        .setName('edit_race')
        .setDescription('Editer une course 6v6')
        .addStringOption(option =>
            option.setName('spots')
                .setDescription('les 6 spots, séparés par un espace')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('map')
                .setDescription('Tag de la map jouée')
                .setRequired(true))
        .addStringOption(option =>
            option.setName('race')
                .setDescription("numéro de la course")
                .setRequired(true)),
                
    async execute(interaction: ChatInputCommandInteraction) {
        const spots: string[] = interaction.options.getString('spots')!.split(' ');
        const map: string = interaction.options.getString('map')!
        const race: string = interaction.options.getString('race')!;
        const idChannel: string = interaction.channelId;
        const newRace = await editRace(spots, map, idChannel, race);

        await interaction.reply(newRace);
       
    }
}