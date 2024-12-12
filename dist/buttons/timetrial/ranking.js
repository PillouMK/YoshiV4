"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generalController_1 = require("../../controller/generalController");
const timetrialController_1 = require("../../controller/timetrialController");
module.exports = {
    data: {
        name: "ranking",
    },
    async execute(interaction, args) {
        await interaction.deferUpdate();
        const user = interaction.user;
        const isMobile = args[0] === "true";
        try {
            const message = await (0, timetrialController_1.timetrialFinalRanking)(interaction.client, isMobile);
            await interaction.editReply({
                content: message.content,
                embeds: message.embed,
                components: message.buttons != undefined ? [message.buttons] : [],
            });
            (0, generalController_1.botLogs)(interaction.client, `${user.username} successfully updated timetrial ranking`);
        }
        catch (e) {
            (0, generalController_1.botLogs)(interaction.client, e);
            console.log(e);
        }
    },
};
