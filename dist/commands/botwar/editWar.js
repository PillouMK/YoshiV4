"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const yfApiController_1 = require("../../controller/yfApiController");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("edit_war")
        .setDescription("Modifier le résultat d'un match")
        .addStringOption((option) => option.setName("id").setDescription("ID of the match").setRequired(true))
        .addNumberOption((option) => option.setName("team1").setDescription("Your team").setRequired(true))
        .addNumberOption((option) => option.setName("team2").setDescription("Opponent team").setRequired(true)),
    async execute(interaction) {
        const server_id = interaction.guildId;
        if (!server_id) {
            await interaction.reply({
                content: "Cette commande ne peut être utilisée que dans un serveur Discord.",
                ephemeral: true,
            });
            return;
        }
        const score_team = interaction.options.getNumber("team1");
        const score_opponent = interaction.options.getNumber("team2");
        const match_id = interaction.options.getString("id");
        const edit_match = {
            score_team: score_team,
            score_opponent: score_opponent,
        };
        const edit_war = await (0, yfApiController_1._editMatch)(edit_match, match_id, server_id);
        if (edit_war.statusCode == 201) {
            await interaction.reply(`Scores modifiés : ${score_team} - ${score_opponent} (match \`${match_id}\`)\n`);
        }
        else {
            console.log(edit_war);
            await interaction.reply(`Erreur lors de la commande : ${edit_war.data.message}`);
        }
    },
};
