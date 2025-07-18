"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lineupController_1 = require("../../controller/lineupController");
const __1 = require("../..");
module.exports = {
    data: {
        name: "lineupToggle",
    },
    async execute(interaction, args) {
        const hour = args[0];
        const isMix = args[1] === "mix";
        const fetchedMembers = await interaction.guild?.members.fetch();
        const fetchedRoles = await interaction.guild?.roles.fetch();
        const rolesId = isMix ? [__1.ROLE_YF, __1.ROLE_YF_TEST] : __1.ROLES;
        let roleList = [];
        fetchedRoles?.forEach((role) => {
            if (rolesId.includes(role.id))
                roleList.push(role);
        });
        const res = await (0, lineupController_1.lineupResponse)(hour, roleList, fetchedMembers);
        await interaction.deferUpdate();
        await interaction.editReply({
            embeds: res[0].embed,
            components: [res[0].buttons],
        });
        (0, lineupController_1.toggleMessage)(interaction.message.id, isMix);
    },
};
