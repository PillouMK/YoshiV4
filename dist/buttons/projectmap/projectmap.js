"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const projectmapController_1 = require("../../controller/projectmapController");
const projectmapController_2 = require("../../controller/projectmapController");
const generalController_1 = require("../../controller/generalController");
module.exports = {
    data: {
        name: 'projectmap'
    },
    async execute(interaction, args) {
        await interaction.deferUpdate();
        const isMobile = args[0] === 'pc' ? false : true;
        const idRoster = args[1];
        if (projectmapController_1.projectMap[idRoster] == undefined) {
            projectmapController_1.projectMap[idRoster] = await (0, projectmapController_2.getProjectMapData)(idRoster, 3, 10);
        }
        if (projectmapController_1.projectMap[idRoster] != undefined) {
            const msg = (0, projectmapController_2.rankingMessage)(idRoster, 3, 10, projectmapController_1.projectMap[idRoster].projectMapValid, projectmapController_1.projectMap[idRoster].projectMapNotValid, isMobile);
            try {
                await interaction.editReply({
                    content: msg.content,
                    components: [msg.buttons],
                    embeds: msg.embed,
                    files: [msg.file]
                });
                const log = `${interaction.user.username} used ProjectMap Button with success`;
                (0, generalController_1.botLogs)(interaction.client, log);
            }
            catch (e) {
                console.log(e);
            }
        }
        else {
            try {
                (0, generalController_1.botLogs)(interaction.client, "Erreur ProjectMap API");
            }
            catch (err) {
                console.log(err);
            }
        }
    }
};
