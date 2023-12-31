import fs from "fs";
import { MapMK } from "src/model/mapDAO";
import settings from '../settings.json'
import { Client, ClientApplication, TextChannel } from "discord.js";

export const saveJSONToFile = <T>(data: T, filePath: string): void => {
    
    try {
        // Convert object in JSON
        const jsonData = JSON.stringify(data, null, 2); // 2 for indent
  
        // write content in JSON file
        fs.writeFileSync(filePath, jsonData, "utf-8");
  
        console.log(`Données sauvegardées dans le fichier : ${filePath}`);
        
    } catch (error) {
        console.error('Error saving JSON data:', error);
      }
    
}

export const rosterColor = (idRoster: string): number => {
    switch(idRoster) {
        case 'YFG': return 0x2ecc71;
        case 'YFO': return 0x3498db;
        case 'YFS': return 0xFF9C41;
        default: return 0x2ecc71;
    }
} 

export const addBlank = (string: string, number: number, isAfter:boolean = false): string => {
    if(!isAfter) {
        while(string.length < number) {
            string = ` ` + string;
        }
        return string;
    } else {
        while(string.length < number) {
            string =  string + ` `;
        }
        return string;
    }
}

const getCurrentDateTimeString = ():string => {
    const now = new Date();

    // Récupérer les composants de la date
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // +1 car les mois sont indexés à partir de 0
    const day = String(now.getDate()).padStart(2, '0');
    
    // Récupérer les composants de l'heure
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    // Assembler la chaîne formatée
    const dateTimeString = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
    
    return dateTimeString;
}

export const botLogs = async (bot: Client, message: string) => {
    try {
        const channel = await bot.channels.fetch(settings.botLogs.channelId) as TextChannel;
        const msg: string = `\`\`\`${getCurrentDateTimeString()} : ${message}\`\`\``
        channel.send({content: msg});
    } catch (e) {
        console.log(e);
    }
    
}