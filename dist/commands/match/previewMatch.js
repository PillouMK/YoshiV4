"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const generalController_1 = require("../../controller/generalController");
const yfApiController_1 = require("../../controller/yfApiController");
const matchController_1 = require("../../controller/matchController");
const global_1 = require("../../global");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("preview_match")
        .setDescription("Générer le tableau")
        .addStringOption((option) => option
        .setName("id")
        .setDescription("Identifiant du match")
        .setRequired(true))
        .addStringOption((option) => option.setName("text").setDescription("Text généré").setRequired(true))
        .addStringOption((option) => option
        .setName("title")
        .setDescription("Titre du match")
        .setRequired(false))
        .addStringOption((option) => option
        .setName("theme")
        .setDescription("Thème du tableau")
        .addChoices({ name: "Dark", value: "dark" }, { name: "MKU", value: "MKU" }, { name: "Light", value: "Light" })
        .setRequired(false)),
    async execute(interaction) {
        const text = interaction.options.getString("text");
        const id = interaction.options.getString("id");
        const team_id = interaction.guildId;
        const title = interaction.options.getString("title");
        const theme = interaction.options.getString("theme");
        const table = (0, generalController_1.parseMatchPreviewText)(text, title, theme);
        const buttons = (0, matchController_1.makeTableButtonList)(id);
        let response = "aa";
        if (typeof table === "string") {
            response = table;
            try {
                await interaction.reply({
                    content: response,
                    components: [buttons],
                });
                return;
            }
            catch (e) {
                console.log(e.requestBody?.requestBody ?? e);
                return;
            }
        }
        else {
            const preview_url = await (0, yfApiController_1._previewMatch)(table, id, team_id);
            if (preview_url.statusCode === 201) {
                global_1.globalData.addMatchPreview(id, table, preview_url.data.imageUrl);
                console.log("url:", preview_url.data.imageUrl);
                try {
                    await interaction.reply({
                        content: preview_url.data.imageUrl,
                        components: [buttons],
                    });
                    return;
                }
                catch (e) {
                    console.log(e.requestBody?.requestBody ?? e);
                    return;
                }
            }
            else {
                console.log(preview_url.statusCode);
                console.log(preview_url.data);
                try {
                    await interaction.reply({
                        content: "Erreur lors de la preview",
                    });
                    return;
                }
                catch (e) {
                    console.log(e.requestBody?.requestBody ?? e);
                    return;
                }
            }
        }
    },
};
