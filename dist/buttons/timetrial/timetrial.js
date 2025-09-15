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
        const map_tag = args[0];
        const game_id = args[1];
        const isShroomless = args[2] === "true";
        const isMobile = args[3] === "true";
        const user = interaction.user;
        const team_id = interaction.guildId;
        try {
            const message = await (0, timetrialController_1.makeTimetrialMessage)(map_tag, game_id, team_id, isShroomless, user, isMobile);
            await interaction.editReply({
                content: message.content,
                embeds: message.embed,
                components: message.buttons != undefined ? [message.buttons] : [],
            });
            (0, generalController_1.botLogs)(interaction.client, `${user.username} successfully updated ranking on ${map_tag}`);
        }
        catch (e) {
            (0, generalController_1.botLogs)(interaction.client, e);
            console.log(e);
        }
    },
};
