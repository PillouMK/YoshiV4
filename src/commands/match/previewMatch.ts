import {
  ActionRowBuilder,
  ChatInputCommandInteraction,
  SlashCommandBuilder,
  UserSelectMenuBuilder,
} from "discord.js";
import { parseMatchPreviewText } from "../../controller/generalController";
import { _previewMatch } from "../../controller/yfApiController";
import { makeTableButtonList } from "../../controller/matchController";
import { globalData } from "../../global";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("preview_match")
    .setDescription("Générer le tableau")
    .addStringOption((option) =>
      option
        .setName("id")
        .setDescription("Identifiant du match")
        .setRequired(true)
    )
    .addStringOption((option) =>
      option.setName("text").setDescription("Text généré").setRequired(true)
    )
    .addStringOption((option) =>
      option
        .setName("title")
        .setDescription("Titre du match")
        .setRequired(false)
    )
    .addStringOption((option) =>
      option
        .setName("theme")
        .setDescription("Thème du tableau")
        .addChoices(
          { name: "Dark", value: "dark" },
          { name: "MKU", value: "MKU" },
          { name: "Light", value: "Light" }
        )
        .setRequired(false)
    ),

  async execute(interaction: ChatInputCommandInteraction) {
    const text: string = interaction.options.getString("text")!;
    const id: string = interaction.options.getString("id")!;
    const title: string | null = interaction.options.getString("title");
    const theme: string | null = interaction.options.getString("theme");
    const table = parseMatchPreviewText(text, title, theme);
    const buttons = makeTableButtonList(id);

    let response: string = "aa";
    if (typeof table === "string") {
      response = table;
      try {
        await interaction.reply({
          content: response,
          components: [buttons],
        });
        return;
      } catch (e: any) {
        console.log(e.requestBody?.requestBody ?? e);
        return;
      }
    } else {
      const preview_url = await _previewMatch(table, id);

      if (preview_url.statusCode === 201) {
        globalData.addMatchPreview(id, table, preview_url.data.imageUrl);
        console.log("url:", preview_url.data.imageUrl);
        try {
          await interaction.reply({
            content: preview_url.data.imageUrl,
            components: [buttons],
          });
          return;
        } catch (e: any) {
          console.log(e.requestBody?.requestBody ?? e);
          return;
        }
      } else {
        console.log(preview_url.statusCode);
        console.log(preview_url.data);
        try {
          await interaction.reply({
            content: "Erreur lors de la preview",
          });
          return;
        } catch (e: any) {
          console.log(e.requestBody?.requestBody ?? e);
          return;
        }
      }
    }
  },
};
