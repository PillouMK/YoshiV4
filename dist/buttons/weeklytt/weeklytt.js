"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generalController_1 = require("../../controller/generalController");
const weeklyttController_1 = require("../../controller/weeklyttController");
module.exports = {
    data: {
        name: "weeklytt",
    },
    async execute(interaction, args) {
        await interaction.deferUpdate();
        const idMap = args[0];
        const isShroomless = args[1] === "1";
        const user = interaction.user;
        (0, generalController_1.botLogs)(interaction.client, `${user.username} used weeklytt button`);
        try {
            const response = await (0, weeklyttController_1.getWeeklytt)(interaction.client, idMap, isShroomless);
            await interaction.editReply({
                content: response.content,
                embeds: response.embed,
                components: response.buttons != undefined ? [response.buttons] : [],
            });
            (0, generalController_1.botLogs)(interaction.client, `${user.username} successfully updated weeklytt on ${idMap}`);
        }
        catch (e) {
            (0, generalController_1.botLogs)(interaction.client, e);
            console.log(e);
        }
    },
};
