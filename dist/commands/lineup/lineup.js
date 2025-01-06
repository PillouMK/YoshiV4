"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lineupController_1 = require("../../controller/lineupController");
const __1 = require("../..");
const generalController_1 = require("../../controller/generalController");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("lu")
        .setDescription("Line up YF")
        .addStringOption((option) => option
        .setName("horaire")
        .setDescription("Heure souhaitée")
        .setRequired(true)),
    async execute(interaction) {
        const hours = interaction.options.getString("horaire");
        let fetchedMembers = await interaction.guild?.members.fetch();
        let fetchedRoles = await interaction.guild?.roles.fetch();
        const rostersRolesId = __1.ROLES;
        let roleList = [];
        fetchedRoles?.forEach((role) => {
            if (rostersRolesId.includes(role.id))
                roleList.push(role);
        });
        (0, generalController_1.sortByRoleId)(roleList, __1.ROLES[0]);
        const res = await (0, lineupController_1.lineupResponse)(hours, roleList, fetchedMembers);
        await interaction.deferReply();
        const message = await interaction.editReply({
            embeds: res[0].embed,
            components: [res[0].buttons],
        });
        (0, lineupController_1.pushTempMessage)(message.id, message.channelId, res[0].hour);
        let index = 0;
        for (const resItem of res) {
            if (index === 0) {
                index++;
            }
            else {
                let msg = await interaction.channel.send({
                    embeds: resItem.embed,
                    components: [resItem.buttons],
                });
                (0, lineupController_1.pushTempMessage)(msg.id, msg.channelId, resItem.hour);
            }
        }
    },
};
