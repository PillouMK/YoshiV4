"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.calculateSimilarity = exports.findSimilarMaps = exports.responsetoMapIdList = exports.responseToMap = void 0;
const responseToMap = (response) => {
    const maps = [];
    response.data.forEach((element) => {
        let map = {
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
    return maps;
};
exports.responseToMap = responseToMap;
const responsetoMapIdList = (response) => {
    const mapIdList = new Map();
    response.data.forEach((element) => {
        mapIdList.set(element.idMap, `${element.initialGame} ${element.nameMap}`);
    });
    return mapIdList;
};
exports.responsetoMapIdList = responsetoMapIdList;
const findSimilarMaps = (userInput, mapList) => {
    const userInputFirstChar = userInput.charAt(0);
    const suggestions = new Map([...mapList.entries()].sort((a, b) => {
        const similarityA = (0, exports.calculateSimilarity)(userInput, a[0]);
        const similarityB = (0, exports.calculateSimilarity)(userInput, b[0]);
        return similarityB - similarityA;
    }));
    return suggestions;
};
exports.findSimilarMaps = findSimilarMaps;
const calculateSimilarity = (str1, str2) => {
    let score = 0;
    if (str1.length === str2.length) {
        score += 2;
    }
    if (str1.charAt(0) === str2.charAt(0)) {
        score += 3;
    }
    for (let i = 1; i < str1.length && i < str2.length; i++) {
        if (str1.charAt(i) === str2.charAt(i)) {
            score += 2;
        }
    }
    return score;
};
exports.calculateSimilarity = calculateSimilarity;
