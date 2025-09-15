"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const yfApiController_1 = require("../../controller/yfApiController");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("member_update")
        .setDescription("met à jour les users"),
    async execute(interaction) {
        const guild = interaction.guild;
        if (!guild) {
            await interaction.reply({
                content: "Commande exécutée hors d’un serveur.",
                ephemeral: true,
            });
            return;
        }
        await guild.members.fetch();
        const users = guild.members.cache.map((member) => ({
            id: member.user.id,
            name: member.user.username,
            flag: "fr",
        }));
        const res = await (0, yfApiController_1._createUsersBulk)(users);
        console.log(res.statusCode.toString());
        console.log(res.data);
        await interaction.reply({
            content: `Utilisateurs envoyés : ${users.length}\nStatus: ${res.statusCode}`,
            ephemeral: true,
        });
    },
};
