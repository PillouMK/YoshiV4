"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const lineupController_1 = require("../../controller/lineupController");
const yfApiController_1 = require("../../controller/yfApiController");
module.exports = {
    data: {
        name: "can",
    },
    async execute(interaction, args) {
        await interaction.deferUpdate();
        const hour = args[0];
        const isMix = args[1] === "mix";
        const member = await (0, yfApiController_1._getUser)(interaction.user.id);
        const response = (0, lineupController_1.addMember)(hour, member.data.user, lineupController_1.StatusLineUp.Can);
        const res = await (0, lineupController_1.lineupResponse)(hour, isMix, interaction.guildId);
        await interaction.editReply({
            embeds: res[0].embed,
            components: [res[0].buttons],
        });
        if (interaction.channelId !== "1294743209200844800") {
            await interaction.followUp({
                content: response,
            });
        }
        (0, lineupController_1.updateLineupsByHour)(interaction.client, hour, interaction.guildId);
    },
};
