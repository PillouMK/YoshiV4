const { REST, Routes } = require("discord.js");
import { config } from "./config";
import fs from "fs";
import path from "path";

const commands = [];
const foldersPath = path.join(__dirname, "commands");
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
  const commandsPath = path.join(foldersPath, folder);
  const commandFiles = fs
    .readdirSync(commandsPath)
    .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

  for (const file of commandFiles) {
    const filePath = path.join(commandsPath, file);
    const command = require(filePath);
    if ("data" in command && "execute" in command) {
      commands.push(command.data.toJSON());
      console.log(command.data.name);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

const rest = new REST().setToken(config.DISCORD_TOKEN);
const MODE = process.env.NODE_ENV || "dev";

(async () => {
  try {
    console.log(
      `Started refreshing ${commands.length} application (/) commands in ${MODE} mode.`
    );

    if (MODE === "dev") {
      await rest.put(
        Routes.applicationGuildCommands(config.CLIENT_ID, config.GUILD_ID),
        { body: commands }
      );
      console.log(`⚡ Dev mode → Commands updated in guild ${config.GUILD_ID}`);
    } else {
      await rest.put(Routes.applicationCommands(config.CLIENT_ID), {
        body: commands,
      });
      console.log(`🌍 Prod mode → Global commands updated`);
      console.log(
        "⚠️ Attention: cela peut prendre jusqu'à 1h avant d'être visible."
      );
    }

    console.log(`✅ Successfully reloaded ${commands.length} commands.`);
  } catch (error) {
    console.error("❌ Error deploying commands:", error);
  }
})();
