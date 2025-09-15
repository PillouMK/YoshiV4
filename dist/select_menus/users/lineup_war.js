"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const generalController_1 = require("../../controller/generalController");
module.exports = {
    data: {
        name: "lineup_war",
    },
    async execute(interaction) {
        const selectedUsers = Array.from(interaction.users.values());
        console.log(selectedUsers);
        const generated_text = (0, generalController_1.generateMatchPreviewText)(selectedUsers);
        await interaction.reply({
            content: 'Copie le message, remplit les score (Ne supprime pas les "-" et les "+"), Tu n\'est pas obligé de modifier les FLAG```\n' +
                generated_text +
                "\n```",
        });
    },
};
