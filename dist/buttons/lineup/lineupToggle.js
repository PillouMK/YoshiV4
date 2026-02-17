"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lineupController_1 = require("../../controller/lineupController");
module.exports = {
    data: {
        name: "lineupToggle",
    },
    async execute(interaction, args) {
        await interaction.deferUpdate();
        const hour = args[0];
        const isMix = args[1] === "mix";
        const res = await (0, lineupController_1.lineupResponse)(hour, isMix, interaction.guildId);
        await interaction.editReply({
            embeds: res[0].embed,
            components: [res[0].buttons],
        });
        (0, lineupController_1.toggleMessage)(interaction.message.id, isMix);
    },
};
