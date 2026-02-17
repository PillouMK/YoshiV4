"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const lineupController_1 = require("../../controller/lineupController");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("lu")
        .setDescription("Line up YF")
        .addStringOption((option) => option
        .setName("horaire")
        .setDescription("Heure souhaitée")
        .setRequired(true)),
    async execute(interaction) {
        const hours = interaction.options.getString("horaire");
        const res = await (0, lineupController_1.lineupResponse)(hours, true, interaction.guildId);
        await interaction.deferReply();
        const message = await interaction.editReply({
            embeds: res[0].embed,
            components: [res[0].buttons],
        });
        (0, lineupController_1.pushTempMessage)(message.id, message.channelId, res[0].hour);
        let index = 0;
        for (const resItem of res) {
            if (index === 0) {
                index++;
            }
            else {
                const msg = await interaction.channel.send({
                    embeds: resItem.embed,
                    components: [resItem.buttons],
                });
                (0, lineupController_1.pushTempMessage)(msg.id, msg.channelId, resItem.hour);
            }
        }
    },
};
