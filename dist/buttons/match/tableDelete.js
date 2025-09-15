"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const global_1 = require("../../global");
module.exports = {
    data: {
        name: "tableDelete",
    },
    async execute(interaction, args) {
        const id = args[0];
        global_1.globalData.deleteMatchPreview(id);
        await interaction.message.delete();
        await interaction.reply({
            content: "Tableau annulé",
        });
    },
};
