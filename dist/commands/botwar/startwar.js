"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const botwarController_1 = require("../../controller/botwarController");
const global_1 = require("../../global");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("startwar")
        .setDescription("commencer un match")
        .addStringOption((option) => option
        .setName("team1")
        .setDescription("Team YF")
        .setRequired(true)
        .setAutocomplete(true))
        .addStringOption((option) => option.setName("team2").setDescription("Team Adverse").setRequired(true))
        .addStringOption((option) => option
        .setName("game")
        .setDescription("MK Game")
        .setRequired(false)
        .addChoices({ name: "MKWORLD", value: "MKWORLD" }, { name: "MK8DX", value: "MK8DX" })),
    async autocomplete(interaction) {
        if (!interaction)
            return;
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name === "team1") {
            const team = global_1.globalData.getTeam(interaction.guildId ?? "");
            if (team?.rosters == undefined)
                return;
            const choices = [
                {
                    name: `${team.tag} | ${team.name}`,
                    value: team.tag,
                },
                ...team.rosters.map((choice) => ({
                    name: `${choice.tag} | ${choice.name}`,
                    value: choice.tag.toString(),
                })),
            ];
            await interaction.respond(choices);
        }
        else if (focusedOption.name === "game") {
            const games = global_1.globalData.getAllGames();
            const choices = games.map((choice) => ({
                name: `${choice.id} | ${choice.name}`,
                value: choice.id.toString(),
            }));
            await interaction.respond(choices);
        }
    },
    async execute(interaction) {
        const server_id = interaction.guildId;
        if (!server_id) {
            await interaction.reply({
                content: "Cette commande ne peut être utilisée que dans un serveur Discord.",
                ephemeral: true,
            });
            return;
        }
        const team1 = interaction.options.getString("team1");
        const team2 = interaction.options.getString("team2");
        const game = interaction.options.getString("game") ?? "MKWORLD";
        const idChannel = interaction.channelId;
        const isWarCreated = await (0, botwarController_1.createWar)(interaction.client, server_id, idChannel, team1, team2, game);
        if (isWarCreated) {
            await interaction.reply(`Début du war entre ${team1} et ${team2}\n`);
        }
        else {
            await interaction.reply(`Il y a déjà un war en cours`);
        }
    },
};
