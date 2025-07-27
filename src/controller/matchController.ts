import { ActionRowBuilder, ButtonBuilder, ButtonStyle } from "discord.js";

export const makeTableButtonList = (
  match_id: string
): ActionRowBuilder<ButtonBuilder> => {
  return new ActionRowBuilder<ButtonBuilder>()
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`tableValidate-${match_id.toString()}`)
        .setLabel(`Valider`)
        .setStyle(ButtonStyle.Success)
    )
    .addComponents(
      new ButtonBuilder()
        .setCustomId(`tableDelete-${match_id.toString()}`)
        .setLabel(`Supprimer`)
        .setStyle(ButtonStyle.Danger)
    );
};
