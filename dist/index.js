"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ROLE_YF = exports.ROLES = exports.LIST_MAPS = void 0;
const tslib_1 = require("tslib");
const discord_js_1 = require("discord.js");
const config_1 = require("./config");
const path_1 = tslib_1.__importDefault(require("path"));
const fs_1 = tslib_1.__importDefault(require("fs"));
const node_cron_1 = tslib_1.__importDefault(require("node-cron"));
const generalController_1 = require("./controller/generalController");
const mapDAO_1 = require("./model/mapDAO");
const maps_json_1 = tslib_1.__importDefault(require("./database/maps.json"));
const lineupController_1 = require("./controller/lineupController");
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
exports.LIST_MAPS = maps_json_1.default.maps.map(mapDAO_1.convertToMapMK);
exports.ROLES = ["643871029210513419", "643569712353116170"];
exports.ROLE_YF = "199252384612876289";
bot.once(discord_js_1.Events.ClientReady, async (c) => {
    console.log(`Ready! Logged in as ${c.user.tag}`);
    (0, generalController_1.botLogs)(bot, "Yoshi successfully relloged");
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
            console.log("command", command.data.name);
            bot.commands.set(command.data.name, command);
        }
        else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
            console.log("c", command);
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
            console.log("button", button.data.name);
            bot.buttons.set(button.data.name, button);
        }
        else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
bot.on(discord_js_1.Events.InteractionCreate, async (interaction) => {
    if (interaction.isButton()) {
        console.log(interaction.customId);
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
});
node_cron_1.default.schedule("0 2,3,4 * * *", () => {
    (0, lineupController_1.resetAllLineups)();
    console.log("Task executed at", new Date().toLocaleString());
});
node_cron_1.default.schedule("* * * * *", () => {
    (0, lineupController_1.resetAllLineups)();
    console.log("Task executed at", new Date().toLocaleString());
});
bot.login(config_1.config.DISCORD_TOKEN);
