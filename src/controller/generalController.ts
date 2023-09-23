import fs from "fs";
import { MapMK } from "src/model/mapDAO";

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

