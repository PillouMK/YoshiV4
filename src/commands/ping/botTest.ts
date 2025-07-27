import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { botLogs } from "../../controller/generalController";
import settings from "../../settings.json";
import { ADMIN_ROLE } from "../..";
import fc from "../../database/fc.json";
import { UserCreate } from "../../model/user.dto";
import { _createUsersBulk } from "../../controller/yfApiController";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("bot_test")
    .setDescription("Test de data"),
  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;

    if (!guild) {
      await interaction.reply({
        content: "Commande exécutée hors d’un serveur.",
        ephemeral: true,
      });
      return;
    }

    // Charge tous les membres (⚠️ attention à la taille du serveur)
    await guild.members.fetch();

    // Transforme en liste UserCreate
    const users: UserCreate[] = guild.members.cache.map(
      (member: GuildMember) => ({
        id: member.user.id,
        name: member.user.username,
        flag: "fr", // valeur par défaut
      })
    );

    // Envoie au back-end
    const res = await _createUsersBulk(users);

    console.log(res.statusCode.toString());
    console.log(res.data);

    await interaction.reply({
      content: `Utilisateurs envoyés : ${users.length}\nStatus: ${res.statusCode}`,
      ephemeral: true,
    });
  },
};
