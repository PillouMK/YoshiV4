"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generalController_1 = require("../../controller/generalController");
const timetrialController_1 = require("../../controller/timetrialController");
module.exports = {
    data: {
        name: "timetrial",
    },
    async execute(interaction, args) {
        await interaction.deferUpdate();
        const idRoster = args[0] === "YF" ? undefined : args[0];
        const idMap = args[1];
        const isShroomless = args[2] === "true";
        const isMobile = args[3] === "true";
        const user = interaction.user;
        try {
            const message = await (0, timetrialController_1.makeTimetrialMessage)(idMap, idRoster, isShroomless, user, isMobile);
            await interaction.editReply({
                content: message.content,
                embeds: message.embed,
                components: message.buttons != undefined ? [message.buttons] : [],
            });
            (0, generalController_1.botLogs)(interaction.client, `${user.username} successfully updated ranking on ${idMap}`);
        }
        catch (e) {
            (0, generalController_1.botLogs)(interaction.client, e);
            console.log(e);
        }
    },
};
