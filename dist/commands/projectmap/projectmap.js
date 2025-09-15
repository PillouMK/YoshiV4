"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const projectmapController_1 = require("../../controller/projectmapController");
const generalController_1 = require("../../controller/generalController");
const global_1 = require("../../global");
const yfApiController_1 = require("../../controller/yfApiController");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("project_map")
        .setDescription("Stats des maps YF par roster")
        .addIntegerOption((option) => option
        .setName("month")
        .setDescription("Nombre de mois max des données")
        .setRequired(false))
        .addStringOption((option) => option
        .setName("roster")
        .setDescription("Choose a roster")
        .setRequired(false)
        .setAutocomplete(true))
        .addStringOption((option) => option
        .setName("game")
        .setDescription("Jeu")
        .setRequired(false)
        .setAutocomplete(true)),
    async autocomplete(interaction) {
        if (!interaction)
            return;
        const focusedOption = interaction.options.getFocused(true);
        if (focusedOption.name === "roster") {
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
        const roster_tag = interaction.options.getString("roster")?.split(" ")[0];
        const month = interaction.options.getInteger("month");
        const team_id = interaction.guildId;
        const game = interaction.options.getString("game") ?? "MKWORLD";
        const dto = {
            game_id: game,
            team_id: team_id,
            months: month ?? null,
            roster_tag: roster_tag ?? null,
        };
        const projectMap = await (0, yfApiController_1._getAllMapStats)(dto);
        if (projectMap.statusCode != 200) {
            try {
                await interaction.reply("Erreur lors de la récupération des données");
                (0, generalController_1.botLogs)(interaction.client, projectMap.data.toString());
                return;
            }
            catch (e) {
                console.log(e);
            }
        }
        const msg = (0, projectmapController_1.rankingMessage)(projectMap.data, false, team_id, roster_tag, month ?? undefined);
        try {
            await interaction.reply({
                content: msg.content,
                embeds: msg.embed,
                files: [msg.file],
            });
        }
        catch (e) {
            console.log(e);
        }
    },
};
