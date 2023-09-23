import { MapMK } from "src/model/mapDAO";
import { ResponseYF } from "src/model/responseYF";

export const responseToMap = (response: ResponseYF):MapMK[] => {
    const maps: MapMK[] = []
    response.data.forEach((element: { idMap: any; nameMap: any; minia: any; DLC: any; retro: any; bag: any; initialGame: any; }) => {
        let map: MapMK = {
            idMap: element.idMap,
            nameMap: element.nameMap,
            minia: element.minia,
            DLC: element.DLC,
            retro: element.retro,
            bag: element.bag,
            initialGame: element.initialGame
        };
        maps.push(map);
    }); 
    return maps
}

export const responsetoMapIdList = (response: ResponseYF): Map<string, string> => {
    const mapIdList: Map<string, string> = new Map<string, string>();
    response.data.forEach((element: { idMap: any; nameMap: any; minia: any; DLC: any; retro: any; bag: any; initialGame: any; }) => {
        mapIdList.set(element.idMap,`${element.initialGame} ${element.nameMap}`);
    });
    return mapIdList
}


export const findSimilarMaps = (userInput: string, mapList: Map<string, string>): Map<string, string> => {
    const userInputFirstChar = userInput.charAt(0);
    
    // const filteredMaps = new Map([...mapList].filter(([key]) => key.includes(userInputFirstChar)));

    const suggestions = new Map([...mapList.entries()].sort((a, b) => {
        const similarityA = calculateSimilarity(userInput, a[0]);
        const similarityB = calculateSimilarity(userInput, b[0]);
        
        // Higher similarity gets higher priority
        return similarityB - similarityA;
    }));

    return suggestions;
}

export const calculateSimilarity = (str1: string, str2: string): number => {
    let score = 0;

    if(str1.length === str2.length) {
        score += 2;
    }

    // Give more weight to the first character
    if (str1.charAt(0) === str2.charAt(0)) {
        score += 3;
    }

    // Calculate similarity based on common characters
    for (let i = 1; i < str1.length && i < str2.length; i++) {
        if (str1.charAt(i) === str2.charAt(i)) {
            score += 2;
        }
    }
    return score;
}