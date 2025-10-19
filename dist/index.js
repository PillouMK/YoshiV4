"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LOGO_YF = exports.ADMIN_ROLE = exports.ROLE_YF_TEST = exports.ROLE_YF = exports.ROLES = exports.LIST_MAPS_MKWORLD = exports.LIST_MAPS = void 0;
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const config_1 = require("./config");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const node_cron_1 = tslib_1.__importDefault(require("node-cron"));
const generalController_1 = require("./controller/generalController");
const map_dto_1 = require("./model/map.dto");
const maps_json_1 = tslib_1.__importDefault(require("./database/maps.json"));
const lineupController_1 = require("./controller/lineupController");
const global_1 = require("./global");
const matchController_1 = require("./controller/matchController");
const yfApiController_1 = require("./controller/yfApiController");
const bot = new discord_js_1.Client({
    intents: [
        discord_js_1.GatewayIntentBits.DirectMessages,
        discord_js_1.GatewayIntentBits.Guilds,
        discord_js_1.GatewayIntentBits.GuildMessages,
        discord_js_1.GatewayIntentBits.MessageContent,
        discord_js_1.GatewayIntentBits.GuildMessageReactions,
        discord_js_1.GatewayIntentBits.GuildMembers,
        discord_js_1.GatewayIntentBits.GuildPresences,
    ],
});
exports.LIST_MAPS = maps_json_1.default.maps.map(map_dto_1.convertToMapMK);
exports.LIST_MAPS_MKWORLD = maps_json_1.default.mkworld.map(map_dto_1.convertToMapMKWORLD);
exports.ROLES = ["1408781458008707072", "1408781672492568678"];
exports.ROLE_YF = "199252384612876289";
exports.ROLE_YF_TEST = "425783129119260672";
exports.ADMIN_ROLE = "353621406891769866";
exports.LOGO_YF = "attachment://LaYoshiFamily.png";
bot.once(discord_js_1.Events.ClientReady, async (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    (0, generalController_1.botLogs)(bot, "Yoshi successfully relloged");
    await global_1.globalData.init(bot);
});
bot.commands = new discord_js_1.Collection();
const foldersPath = path_1.default.join(__dirname, "commands");
const commandFolders = fs_1.default.readdirSync(foldersPath);
for (const folder of commandFolders) {
    const commandsPath = path_1.default.join(foldersPath, folder);
    const commandFiles = fs_1.default
        .readdirSync(commandsPath)
        .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));
    for (const file of commandFiles) {
        const filePath = path_1.default.join(commandsPath, file);
        const command = require(filePath);
        if ("data" in command && "execute" in command) {
            bot.commands.set(command.data.name, command);
        }
        else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
bot.buttons = new discord_js_1.Collection();
const foldersPath2 = path_1.default.join(__dirname, "buttons");
const buttonsFolders = fs_1.default.readdirSync(foldersPath2);
for (const folder of buttonsFolders) {
    const buttonsPath = path_1.default.join(foldersPath2, folder);
    const buttonFiles = fs_1.default
        .readdirSync(buttonsPath)
        .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));
    for (const file of buttonFiles) {
        const filePath = path_1.default.join(buttonsPath, file);
        const button = require(filePath);
        if ("execute" in button) {
            bot.buttons.set(button.data.name, button);
        }
        else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
bot.select_menus = new discord_js_1.Collection();
const foldersPath3 = path_1.default.join(__dirname, "select_menus");
const selectMenusFolders = fs_1.default.readdirSync(foldersPath3);
for (const folder of selectMenusFolders) {
    const selectMenuPath = path_1.default.join(foldersPath3, folder);
    const selectMenuFiles = fs_1.default
        .readdirSync(selectMenuPath)
        .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));
    for (const file of selectMenuFiles) {
        const filePath = path_1.default.join(selectMenuPath, file);
        const selectMenu = require(filePath);
        if ("execute" in selectMenu) {
            bot.select_menus.set(selectMenu.data.name, selectMenu);
        }
        else {
            console.log(`[WARNING] The selectMenu at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
bot.on(discord_js_1.Events.GuildMemberAdd, async (member) => {
    try {
        const new_user = {
            flag: "",
            id: member.user.id,
            name: member.user.username,
        };
        const add_user = await (0, yfApiController_1._createUser)(new_user);
        if (add_user.statusCode == 201) {
            console.log("User added", new_user.name);
        }
        else {
            console.log("User already exist", new_user.name);
        }
    }
    catch (e) {
        console.log("error while adding", e);
    }
});
bot.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
    try {
        if (interaction.isButton()) {
            console.log(interaction);
            const buttonName = interaction.customId.split("-")[0];
            const args = interaction.customId.split("-");
            args.shift();
            const button = interaction.client.buttons.get(buttonName);
            if (!button) {
                console.error(`No buttons interaction matching ${buttonName} was found.`);
                await interaction.reply({
                    content: `No buttons interaction matching ${buttonName} was found.`,
                    ephemeral: true,
                });
                return;
            }
            try {
                await button.execute(interaction, args);
            }
            catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: "There was an error while executing the button!",
                        ephemeral: true,
                    });
                }
                else {
                    await interaction.reply({
                        content: "There was an error while executing the button!",
                        ephemeral: true,
                    });
                }
            }
            return;
        }
        if (interaction.isAnySelectMenu()) {
            const selectName = interaction.customId.split("-")[0];
            const args = interaction.customId.split("-");
            args.shift();
            const selectMenu = interaction.client.select_menus.get(selectName);
            if (!selectMenu) {
                console.error(`No selectMenu interaction matching ${selectName} was found.`);
                await interaction.reply({
                    content: `No selectMenu interaction matching ${selectName} was found.`,
                    ephemeral: true,
                });
                return;
            }
            try {
                await selectMenu.execute(interaction, args);
            }
            catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: "There was an error while executing the select menu!",
                        ephemeral: true,
                    });
                }
                else {
                    await interaction.reply({
                        content: "There was an error while executing the select menu!",
                        ephemeral: true,
                    });
                }
            }
            return;
        }
        if (interaction.isChatInputCommand()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                await interaction.reply({
                    content: `No command matching ${interaction.commandName} was found.`,
                    ephemeral: true,
                });
                return;
            }
            try {
                await command.execute(interaction);
            }
            catch (error) {
                console.error(error);
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({
                        content: "There was an error while executing this command!",
                        ephemeral: true,
                    });
                }
                else {
                    await interaction.reply({
                        content: "There was an error while executing this command!",
                        ephemeral: true,
                    });
                }
            }
        }
        if (interaction.isAutocomplete()) {
            const command = interaction.client.commands.get(interaction.commandName);
            if (!command) {
                console.error(`No command matching ${interaction.commandName} was found.`);
                return;
            }
            try {
                await command.autocomplete(interaction);
            }
            catch (error) {
                console.error(error);
            }
        }
    }
    catch (e) {
        console.error("Error interaction", e);
    }
});
node_cron_1.default.schedule("0 2,3,4 * * *", () => {
    (0, lineupController_1.resetAllLineups)(bot);
    console.log("Reset executed at", new Date().toLocaleString());
}, {
    scheduled: true,
    timezone: "Europe/Paris",
});
bot.login(config_1.config.DISCORD_TOKEN);
node_cron_1.default.schedule("0 20 * * *", () => {
    const teams = global_1.globalData.getAllTeams();
    for (const t of teams) {
        (0, matchController_1.recallMissingMatches)(bot, t.id, t.result_channel_id);
        console.log("Recall made for ", t.name);
    }
}, {
    scheduled: true,
    timezone: "Europe/Paris",
});
