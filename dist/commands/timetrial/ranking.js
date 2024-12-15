"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const discord_js_1 = require("discord.js");
const timetrialController_1 = require("../../controller/timetrialController");
const __1 = require("../..");
const generalController_1 = require("../../controller/generalController");
module.exports = {
    data: new discord_js_1.SlashCommandBuilder()
        .setName("classement")
        .setDescription("Classement Timetrial")
        .addStringOption((option) => option
        .setName("idmap")
        .setDescription("Map souhaitée")
        .setRequired(true)
        .setAutocomplete(true))
        .addBooleanOption((option) => option
        .setName("is_mobile")
        .setDescription("Vue Mobile")
        .setRequired(false))
        .addBooleanOption((option) => option.setName("no_item").setDescription("Sans item ?").setRequired(false))
        .addStringOption((option) => option
        .setName("idroster")
        .setDescription("Roster")
        .setRequired(false)
        .addChoices({ name: "YFG", value: "YFG" }, { name: "YFO", value: "YFO" })),
    async autocomplete(interaction) {
        const value = interaction.options.getFocused().toLocaleLowerCase();
        const filtered = (0, generalController_1.filterMapList)(__1.LIST_MAPS, value);
        if (!interaction)
            return;
        const choices = filtered.map((choice) => ({
            name: `${choice.idMap} | ${choice.initialGame} ${choice.nameMap}`,
            value: choice.idMap,
        }));
        console.log("Choices being sent to autocomplete:", choices);
        await interaction.respond(choices);
    },
    async execute(interaction) {
        const idMap = interaction.options.getString("idmap").split(" ");
        const idRoster = interaction.options.getString("idroster") ?? undefined;
        const isMobile = interaction.options.getBoolean("is_mobile") ?? false;
        const isShroomless = interaction.options.getBoolean("no_item") ?? false;
        console.log("isShroomless", isShroomless);
        const user = interaction.user;
        await interaction.deferReply();
        const message = await (0, timetrialController_1.makeTimetrialMessage)(idMap[0], idRoster, isShroomless, user, isMobile);
        await interaction.editReply({
            content: message.content,
            embeds: message.embed,
            components: message.buttons != undefined ? [message.buttons] : [],
        });
    },
};
