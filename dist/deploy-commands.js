"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const { REST, Routes } = require("discord.js");
const config_1 = require("./config");
const fs_1 = require("fs");
const path_1 = tslib_1.__importDefault(require("path"));
const commands = [];
const commandExtensions = [".ts", ".js"];
const foldersPath = path_1.default.join(__dirname, "commands");
const commandFolders = (0, fs_1.readdirSync)(foldersPath);
for (const folder of commandFolders) {
    const commandsPath = path_1.default.join(foldersPath, folder);
    const commandFiles = (0, fs_1.readdirSync)(commandsPath).filter((file) => commandExtensions.some((ext) => file.endsWith(ext)));
    for (const file of commandFiles) {
        const filePath = path_1.default.join(commandsPath, file);
        const command = require(filePath);
        if ("data" in command && "execute" in command) {
            commands.push(command.data.toJSON());
            console.log(command.data.name);
        }
        else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
const rest = new REST().setToken(config_1.config.DISCORD_TOKEN);
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands.`);
        const data = await rest.put(Routes.applicationGuildCommands(config_1.config.CLIENT_ID, config_1.config.GUILD_ID), { body: commands });
        console.log(`Successfully reloaded ${data.length} application (/) commands.`);
    }
    catch (error) {
        console.error(error);
    }
})();
