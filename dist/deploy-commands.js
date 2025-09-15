"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const tslib_1 = require("tslib");
const { REST, Routes } = require("discord.js");
const config_1 = require("./config");
const fs_1 = tslib_1.__importDefault(require("fs"));
const path_1 = tslib_1.__importDefault(require("path"));
const commands = [];
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
            commands.push(command.data.toJSON());
            console.log(command.data.name);
        }
        else {
            console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
        }
    }
}
const rest = new REST().setToken(config_1.config.DISCORD_TOKEN);
const MODE = process.env.NODE_ENV || "dev";
(async () => {
    try {
        console.log(`Started refreshing ${commands.length} application (/) commands in ${MODE} mode.`);
        if (MODE === "dev") {
            await rest.put(Routes.applicationGuildCommands(config_1.config.CLIENT_ID, config_1.config.GUILD_ID), { body: commands });
            console.log(`⚡ Dev mode → Commands updated in guild ${config_1.config.GUILD_ID}`);
        }
        else {
            await rest.put(Routes.applicationCommands(config_1.config.CLIENT_ID), {
                body: commands,
            });
            console.log(`🌍 Prod mode → Global commands updated`);
            console.log("⚠️ Attention: cela peut prendre jusqu'à 1h avant d'être visible.");
        }
        console.log(`✅ Successfully reloaded ${commands.length} commands.`);
    }
    catch (error) {
        console.error("❌ Error deploying commands:", error);
    }
})();
