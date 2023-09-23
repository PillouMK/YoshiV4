import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";
import { getAllMaps } from '../../controller/yfApiController'

module.exports = {
    data: new SlashCommandBuilder()
        .setName('bot_test')
        .setDescription('Test de data'),
    async execute(interaction: ChatInputCommandInteraction) {

        try {
            const maps = await getAllMaps();

           
            console.log(maps);
        } catch(e) {
            console.log(e)
        }
        
        await interaction.reply("Regarde la console");
       
    }
}