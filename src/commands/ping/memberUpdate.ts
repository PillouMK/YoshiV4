import {
  ChatInputCommandInteraction,
  GuildMember,
  SlashCommandBuilder,
} from "discord.js";
import { UserCreate } from "../../model/user.dto";
import { _createUsersBulk } from "../../controller/yfApiController";

module.exports = {
  data: new SlashCommandBuilder()
    .setName("member_update")
    .setDescription("met à jour les users"),
  async execute(interaction: ChatInputCommandInteraction) {
    const guild = interaction.guild;

    if (!guild) {
      await interaction.reply({
        content: "Commande exécutée hors d’un serveur.",
        ephemeral: true,
      });
      return;
    }

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
