import { Client, GatewayIntentBits, Events, Collection, TextChannel } from "discord.js";
import { config } from "./config";
import path from "path";
import fs from "fs";
import { getAllMaps } from "./controller/yfApiController";
import { ProjectMapData, getProjectMapData, updateProjectMapMessage } from "./controller/projectmapController";
import { botLogs } from "./controller/generalController";
import { projectMap } from "./controller/projectmapController";




declare module 'discord.js' {
    interface Client {
        commands: Collection<string, any>; 
		buttons: Collection<string, any>; 
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
        GatewayIntentBits.GuildPresences
    ]
});

bot.once(Events.ClientReady, async c => {
	console.log(`Ready! Logged in as ${c.user.tag}`);
	botLogs(bot, "Yoshi successfully relloged");
	try {
        projectMap['YFG'] = await getProjectMapData("YFG", 3, 10);
		
		if(projectMap.YFG != undefined) {
			updateProjectMapMessage(bot, "YFG", 3, 10, projectMap.YFG.projectMapValid, projectMap.YFG.projectMapNotValid, false)
		} else {
			botLogs(bot, "Erreur ProjectMap API");
		}
    } catch (error) {
        console.error('Une erreur s\'est produite :', error);
    }
});

bot.commands = new Collection();
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.ts'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		// Set a new item in the Collection with the key as the command name and the value as the exported module
		if ('data' in command && 'execute' in command) {
			console.log("command", command.data.name)
			bot.commands.set(command.data.name, command);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

bot.buttons = new Collection();
const foldersPath2 = path.join(__dirname, 'buttons');
const buttonsFolders = fs.readdirSync(foldersPath2);

for (const folder of buttonsFolders) {
	const buttonsPath = path.join(foldersPath2, folder);
	const buttonFiles = fs.readdirSync(buttonsPath).filter(file => file.endsWith('.ts'));
	for (const file of buttonFiles) {
		const filePath = path.join(buttonsPath, file);
		const button = require(filePath);
		
		if ('execute' in button) {
			console.log("button", button.data.name)
			bot.buttons.set(button.data.name, button);
		} else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

bot.on(Events.InteractionCreate, async interaction => {
	//if (interaction.member?.user.id !== "450353797450039336") return

	// button interactions
	if(interaction.isButton()) {
		
		const buttonName: string = interaction.customId.split('-')[0];
		const args: string[] = interaction.customId.split('-');
		args.shift()
		
		const button = interaction.client.buttons.get(buttonName)

		if(!button) {
			console.error(`No buttons interaction matching ${buttonName} was found.`);
			await interaction.reply({ content: `No buttons interaction matching ${buttonName} was found.`, ephemeral: true });
			return;
		}

		try {
			await button.execute(interaction, args);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing the button!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing the button!', ephemeral: true });
			}
		}
		return
	}

	// slash commands interactions
	if (interaction.isChatInputCommand()) {
		const command = interaction.client.commands.get(interaction.commandName);

		if (!command) {
			console.error(`No command matching ${interaction.commandName} was found.`);
			await interaction.reply({ content: `No command matching ${interaction.commandName} was found.`, ephemeral: true });
			return;
		}

		try {
			await command.execute(interaction);
		} catch (error) {
			console.error(error);
			if (interaction.replied || interaction.deferred) {
				await interaction.followUp({ content: 'There was an error while executing this command!', ephemeral: true });
			} else {
				await interaction.reply({ content: 'There was an error while executing this command!', ephemeral: true });
			}
	}
	}

	
});


bot.on(Events.MessageCreate, async message => {
	
})
bot.login(config.DISCORD_TOKEN);



