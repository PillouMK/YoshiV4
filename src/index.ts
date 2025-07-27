import {
  Client,
  GatewayIntentBits,
  Events,
  Collection,
  GuildMember,
  PartialGuildMember,
  REST,
  Routes,
} from "discord.js";
import { config } from "./config";
import path from "path";
import fs from "fs";
import cron from "node-cron";
import {
  botLogs,
  playerAddInGuild,
  playerRemovedInGuild,
  playerRosterChange,
} from "./controller/generalController";
import {
  MapMK,
  MapMK_V2,
  convertToMapMK,
  convertToMapMKWORLD,
} from "./model/map.dto";
import mapsJSON from "./database/maps.json";
import { resetAllLineups } from "./controller/lineupController";
import { updateProjectMapMessage } from "./controller/projectmapController";
import { updateFinalRanking } from "./controller/timetrialController";
import { _getAllMaps } from "./controller/yfApiController";
import { Roster } from "./model/roster.dto";
import { globalData } from "./global";

declare module "discord.js" {
  interface Client {
    commands: Collection<string, any>;
    buttons: Collection<string, any>;
    select_menus: Collection<string, any>;
  }
}

const bot: Client<boolean> = new Client({
  intents: [
    GatewayIntentBits.DirectMessages,
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMessageReactions,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildPresences,
  ],
});

export const LIST_MAPS: MapMK[] = mapsJSON.maps.map(convertToMapMK);
export const LIST_MAPS_MKWORLD: MapMK_V2[] =
  mapsJSON.mkworld.map(convertToMapMKWORLD);
export const ROLES = ["643871029210513419", "643569712353116170"];
export const ROLE_YF = "199252384612876289";
export const ROLE_YF_TEST = "425783129119260672";
export const ADMIN_ROLE = "353621406891769866";
export const LOGO_YF = "attachment://LaYoshiFamily.png";

bot.once(Events.ClientReady, async (c) => {
  console.log(`Ready! Logged in as ${c.user.tag}`);
  botLogs(bot, "Yoshi successfully relloged");
  await globalData.init();
});

bot.commands = new Collection();
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
    // Set a new item in the Collection with the key as the command name and the value as the exported module
    if ("data" in command && "execute" in command) {
      bot.commands.set(command.data.name, command);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

bot.buttons = new Collection();
const foldersPath2 = path.join(__dirname, "buttons");
const buttonsFolders = fs.readdirSync(foldersPath2);

for (const folder of buttonsFolders) {
  const buttonsPath = path.join(foldersPath2, folder);
  const buttonFiles = fs
    .readdirSync(buttonsPath)
    .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));
  for (const file of buttonFiles) {
    const filePath = path.join(buttonsPath, file);
    const button = require(filePath);

    if ("execute" in button) {
      bot.buttons.set(button.data.name, button);
    } else {
      console.log(
        `[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

bot.select_menus = new Collection();
const foldersPath3 = path.join(__dirname, "select_menus");
const selectMenusFolders = fs.readdirSync(foldersPath3);

for (const folder of selectMenusFolders) {
  const selectMenuPath = path.join(foldersPath3, folder);
  const selectMenuFiles = fs
    .readdirSync(selectMenuPath)
    .filter((file) => file.endsWith(".ts") || file.endsWith(".js"));

  for (const file of selectMenuFiles) {
    const filePath = path.join(selectMenuPath, file);
    const selectMenu = require(filePath);

    if ("execute" in selectMenu) {
      bot.select_menus.set(selectMenu.data.name, selectMenu);
    } else {
      console.log(
        `[WARNING] The selectMenu at ${filePath} is missing a required "data" or "execute" property.`
      );
    }
  }
}

bot.on(Events.GuildMemberAdd, async (member: GuildMember) => {
  playerAddInGuild(bot, member);
});

bot.on(
  Events.GuildMemberRemove,
  async (member: GuildMember | PartialGuildMember) => {
    playerRemovedInGuild(bot, member);
  }
);

bot.on(Events.GuildMemberUpdate, async (oldMember, newMember) => {
  playerRosterChange(bot, oldMember, newMember);
});

bot.on(Events.InteractionCreate, async (interaction) => {
  if (
    interaction.user.id !== "450353797450039336" &&
    interaction.user.id !== "133978257006526464"
  )
    return;
  if (interaction.isButton()) {
    // button interactions
    const buttonName: string = interaction.customId.split("-")[0];
    const args: string[] = interaction.customId.split("-");
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
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing the button!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing the button!",
          ephemeral: true,
        });
      }
    }
    return;
  }

  if (interaction.isAnySelectMenu()) {
    const selectName: string = interaction.customId.split("-")[0];
    const args: string[] = interaction.customId.split("-");
    args.shift();

    const selectMenu = interaction.client.select_menus.get(selectName);

    if (!selectMenu) {
      console.error(
        `No selectMenu interaction matching ${selectName} was found.`
      );
      await interaction.reply({
        content: `No selectMenu interaction matching ${selectName} was found.`,
        ephemeral: true,
      });
      return;
    }

    try {
      await selectMenu.execute(interaction, args);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing the select menu!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing the select menu!",
          ephemeral: true,
        });
      }
    }
    return;
  }

  // slash commands interactions
  if (interaction.isChatInputCommand()) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      await interaction.reply({
        content: `No command matching ${interaction.commandName} was found.`,
        ephemeral: true,
      });
      return;
    }

    try {
      await command.execute(interaction);
    } catch (error) {
      console.error(error);
      if (interaction.replied || interaction.deferred) {
        await interaction.followUp({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      } else {
        await interaction.reply({
          content: "There was an error while executing this command!",
          ephemeral: true,
        });
      }
    }
  }

  // slash commande autocomplete
  if (interaction.isAutocomplete()) {
    const command = interaction.client.commands.get(interaction.commandName);

    if (!command) {
      console.error(
        `No command matching ${interaction.commandName} was found.`
      );
      return;
    }

    try {
      await command.autocomplete(interaction);
    } catch (error) {
      console.error(error);
    }
  }
});

cron.schedule("0 2,3,4 * * *", () => {
  resetAllLineups(bot);
  console.log("Reset executed at", new Date().toLocaleString());
});

cron.schedule("0 * * * *", () => {
  updateFinalRanking(bot);
  console.log("Update executed at", new Date().toLocaleString());
});

bot.login(config.DISCORD_TOKEN);
