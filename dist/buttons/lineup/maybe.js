"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lineupController_1 = require("../../controller/lineupController");
const __1 = require("../..");
const generalController_1 = require("../../controller/generalController");
module.exports = {
    data: {
        name: "maybe",
    },
    async execute(interaction, args) {
        const hour = args[0];
        const member = interaction.user;
        const isMix = args[1] === "mix";
        const response = (0, lineupController_1.addMember)(hour, member, lineupController_1.StatusLineUp.Maybe);
        const fetchedMembers = await interaction.guild?.members.fetch();
        const fetchedRoles = await interaction.guild?.roles.fetch();
        const rolesId = isMix ? [__1.ROLE_YF, __1.ROLE_YF_TEST] : __1.ROLES;
        let roleList = [];
        fetchedRoles?.forEach((role) => {
            if (rolesId.includes(role.id))
                roleList.push(role);
        });
        (0, generalController_1.sortByRoleId)(roleList, __1.ROLES[0]);
        const res = await (0, lineupController_1.lineupResponse)(hour, roleList, fetchedMembers);
        await interaction.deferUpdate();
        await interaction.editReply({
            embeds: res[0].embed,
            components: [res[0].buttons],
        });
        if (interaction.channelId !== "1294743209200844800") {
            await interaction.followUp({
                content: response,
            });
        }
        (0, lineupController_1.updateLineupsByHour)(interaction.client, hour);
    },
};
