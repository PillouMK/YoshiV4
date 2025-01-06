"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeTagTeam = exports.addPena = exports.editRace = exports.raceAdd = exports.stopWar = exports.createWar = exports.getNumberOfRace = void 0;
const tslib_1 = require("tslib");
const bot_war_json_1 = tslib_1.__importDefault(require("../database/bot-war.json"));
const generalController_1 = require("../controller/generalController");
const yfApiController_1 = require("./yfApiController");
const mapController_1 = require("./mapController");
const errorMessage_1 = require("../model/errorMessage");
const projectmapController_1 = require("./projectmapController");
const pointMapping = {
    "1": 15,
    "2": 12,
    "3": 10,
    "4": 9,
    "5": 8,
    "6": 7,
    "7": 6,
    "8": 5,
    "9": 4,
    "10": 3,
    "11": 2,
    "12": 1,
};
const rosterList = new Set(["YFG", "YFO"]);
const botwar = bot_war_json_1.default;
const embedMsg = "```";
const backToLine = "\n";
const botwarPath = "./src/database/bot-war.json";
const errorMessage = new errorMessage_1.ErrorMessage();
const checkIfMapExist = (mapKey, mapList) => {
    return (Array.from(mapList.keys()).filter((key) => key === mapKey).length === 1);
};
const checkIfSpotsAreValids = (spots) => {
    const validNumbers = new Set(Array.from({ length: 12 }, (_, i) => (i + 1).toString()));
    for (const item of spots) {
        if (!validNumbers.has(item)) {
            return false;
        }
    }
    return true;
};
const checkDuplicateSpots = (spots) => {
    const uniqueSet = new Set();
    for (const item of spots) {
        if (uniqueSet.has(item)) {
            return false;
        }
        uniqueSet.add(item);
    }
    return true;
};
const checkNumberofSpots = (spots) => {
    return spots.length == 6;
};
const checkIfWarExistInChannel = (idChannel) => {
    return idChannel in bot_war_json_1.default.channels;
};
const areRacesEquals = (arr1, arr2, map1, map2) => {
    if (map1 !== map2)
        return false;
    if (arr1.length !== arr2.length)
        return false;
    return arr1.every((item, index) => item === arr2[index]);
};
const placeToPoint = (spots) => {
    let totalYF = 0;
    for (let value of spots) {
        if (pointMapping[value]) {
            totalYF += pointMapping[value];
        }
    }
    return totalYF;
};
const getWarResults = (idChannel) => {
    return botwar.channels[idChannel];
};
const sendProjectMapData = async (results) => {
    const resultArray = [];
    results.paramWar.recapWar.forEach((item) => {
        resultArray.push({ idMap: item.map, scoreMap: item.score });
    });
    const apiObject = {
        scoresMaps: resultArray,
        scoreMatch: results.paramWar.totaleDiff,
        idRoster: results.team1.nameTeam,
    };
    const apiCall = await (0, yfApiController_1.postProjectMap)(apiObject);
    return apiCall.statusCode === 201;
};
const checkIfRaceIsValidNumber = (race) => {
    return !isNaN(Number(race)) && Number.isInteger(Number(race));
};
const getNumberOfRace = (idChannel) => {
    return botwar.channels[idChannel].paramWar.race;
};
exports.getNumberOfRace = getNumberOfRace;
const similarMapMessage = (map, mapIdList) => {
    const mapSimilarList = (0, mapController_1.findSimilarMaps)(map, mapIdList);
    let message = `${errorMessage.mapNotValid(map)}\nVoici des maps ressemblante :\n\n`;
    let count = 0;
    for (const [key, value] of mapSimilarList.entries()) {
        if (count >= 5) {
            break;
        }
        message += `**${key} :** ${value}\n`;
        count++;
    }
    return message;
};
const makeResponseMessage = (war, map, scoreYF, scoreAdv, raceDifference, raceNumber, spots) => {
    const penaYF = war.team1.penality > 0 ? `Pénalité : ${war.team1.penality.toString()}` : "";
    const penaADV = war.team2.penality > 0 ? `Pénalité : ${war.team2.penality.toString()}` : "";
    let recapRace = `${embedMsg}${backToLine}Course n°${raceNumber.toString()} (${map}) | Spots : ${spots.join(", ")}${backToLine}`;
    recapRace += `${war.team1.nameTeam} = ${scoreYF.toString()}${backToLine}${war.team2.nameTeam} = ${scoreAdv.toString()}${backToLine}    Différence : ${raceDifference.toString()}${backToLine}${embedMsg}`;
    const scoreYFWithPena = war.team1.total - war.team1.penality;
    const scoreADVWithPena = war.team2.total - war.team2.penality;
    const diffWithPena = scoreYFWithPena - scoreADVWithPena;
    let recapWar = `${embedMsg}${backToLine}Score total après la course n°${raceNumber.toString()}${backToLine}`;
    recapWar += `${war.team1.nameTeam} = ${scoreYFWithPena}     ${penaYF}${backToLine}`;
    recapWar += `${war.team2.nameTeam} = ${scoreADVWithPena}     ${penaADV}${backToLine}`;
    recapWar += `   Différence totale : ${diffWithPena}${backToLine}${embedMsg}`;
    let recapAllMaps = "";
    war.paramWar.recapWar.forEach((item, index) => {
        const space = index < 9 ? "  | " : " | ";
        recapAllMaps += `${(index + 1).toString()}${space}${war.team1.nameTeam} ${war.team1.recapScore[index].toString()} - ${war.team2.recapScore[index].toString()} ${war.team2.nameTeam} (${item.score.toString()}) sur ${item.map}${backToLine}`;
    });
    const endRecap = `${embedMsg}${backToLine}Récapitulatif des courses :${backToLine}${recapAllMaps}${backToLine}${embedMsg}`;
    return recapRace + recapWar + endRecap;
};
const createWar = (idChannel, nameTeam1, nameTeam2) => {
    if (checkIfWarExistInChannel(idChannel))
        return false;
    const saveStats = rosterList.has(nameTeam1.toUpperCase());
    const warObject = {
        team1: {
            nameTeam: nameTeam1,
            penality: 0,
            total: 0,
            recapScore: [],
        },
        team2: {
            nameTeam: nameTeam2,
            penality: 0,
            total: 0,
            recapScore: [],
        },
        paramWar: {
            verifDoublon: {
                spots: [],
                map: "",
            },
            saveStats: saveStats,
            isStoppable: false,
            race: 0,
            totaleDiff: 0,
            recapWar: [],
        },
    };
    botwar.channels[idChannel] = warObject;
    (0, generalController_1.saveJSONToFile)(botwar, botwarPath);
    return true;
};
exports.createWar = createWar;
const stopWar = async (bot, idChannel, isForced = false) => {
    if (!checkIfWarExistInChannel(idChannel))
        return errorMessage.noWarInChannel();
    if (!isForced && (0, exports.getNumberOfRace)(idChannel) < 12)
        return "le war n'a pas atteint 12 courses, fait !stopwar -f ou ajoute l'option force avec /stopwar pour forcer l'arrêt";
    const result = getWarResults(idChannel);
    const isWin = result.paramWar.totaleDiff > 0
        ? "Victoire"
        : result.paramWar.totaleDiff == 0
            ? "Egalité"
            : "Défaite";
    let msg = `Fin du war\n${isWin} : ${result.team1.total.toString()} - ${result.team2.total.toString()} (${result.paramWar.totaleDiff.toString()})`;
    if ((0, exports.getNumberOfRace)(idChannel) > 7 &&
        botwar.channels[idChannel].paramWar.saveStats) {
        const sendMapsData = await sendProjectMapData(botwar.channels[idChannel]);
        if (result.team1.nameTeam === "YFG" || result.team1.nameTeam === "YFO")
            (0, projectmapController_1.updateProjectMapMessage)(bot, result.team1.nameTeam, 3, 10, false);
        if (sendMapsData)
            msg += "\nSauvegarde des données effectuées";
        else
            msg +=
                "\nEchec lors de la sauvegarde des données\n" +
                    botwar.channels[idChannel];
    }
    else {
        msg += "\nPas de sauvegardes";
    }
    delete botwar.channels[idChannel];
    (0, generalController_1.saveJSONToFile)(botwar, botwarPath);
    return msg;
};
exports.stopWar = stopWar;
const raceAdd = async (spots, map, idChannel) => {
    if (!checkIfWarExistInChannel(idChannel))
        return errorMessage.noWarInChannel();
    if (!checkNumberofSpots(spots))
        return errorMessage.spotsLengthOutOfRange(spots);
    if (!checkIfSpotsAreValids(spots))
        return errorMessage.spotsNotValids(spots);
    if (!checkDuplicateSpots(spots))
        return errorMessage.spotDuplicated(spots);
    const oldRace = botwar.channels[idChannel].paramWar.verifDoublon;
    if (areRacesEquals(spots, oldRace.spots, map, oldRace.map)) {
        botwar.channels[idChannel].paramWar.verifDoublon.map = "";
        (0, generalController_1.saveJSONToFile)(botwar, botwarPath);
        return errorMessage.raceDuplicated();
    }
    const scoreYF = placeToPoint(spots);
    const scoreAdv = 82 - scoreYF;
    const raceDifference = scoreYF - scoreAdv;
    const team1 = botwar.channels[idChannel].team1;
    team1.total += scoreYF;
    team1.recapScore.push(scoreYF);
    const team2 = botwar.channels[idChannel].team2;
    team2.total += scoreAdv;
    team2.recapScore.push(scoreAdv);
    const paramWar = botwar.channels[idChannel].paramWar;
    paramWar.race++;
    paramWar.verifDoublon.map = map;
    paramWar.verifDoublon.spots = spots;
    paramWar.recapWar.push({ map: map, score: raceDifference });
    paramWar.totaleDiff += raceDifference;
    (0, generalController_1.saveJSONToFile)(botwar, botwarPath);
    return makeResponseMessage(botwar.channels[idChannel], map, scoreYF, scoreAdv, raceDifference, paramWar.race, spots);
};
exports.raceAdd = raceAdd;
const editRace = async (spots, map, idChannel, race) => {
    if (!checkIfWarExistInChannel(idChannel))
        return errorMessage.noWarInChannel();
    if (!checkIfRaceIsValidNumber(race))
        return errorMessage.raceIsNotANumber(race);
    if (!((0, exports.getNumberOfRace)(idChannel) >= parseInt(race)))
        return errorMessage.raceIsOutOfRange(race);
    if (!checkIfSpotsAreValids(spots))
        return errorMessage.spotsNotValids(spots);
    if (!checkDuplicateSpots(spots))
        return errorMessage.spotDuplicated(spots);
    const raceAsNumber = parseInt(race);
    const scoreYF = placeToPoint(spots);
    const scoreAdv = 82 - scoreYF;
    const raceDifference = scoreYF - scoreAdv;
    const team1 = botwar.channels[idChannel].team1;
    team1.total = team1.total - team1.recapScore[raceAsNumber - 1] + scoreYF;
    team1.recapScore[raceAsNumber - 1] = scoreYF;
    const team2 = botwar.channels[idChannel].team2;
    team2.total = team2.total - team2.recapScore[raceAsNumber - 1] + scoreAdv;
    team2.recapScore[raceAsNumber - 1] = scoreAdv;
    const paramWar = botwar.channels[idChannel].paramWar;
    paramWar.totaleDiff =
        paramWar.totaleDiff -
            paramWar.recapWar[raceAsNumber - 1].score +
            raceDifference;
    paramWar.recapWar[raceAsNumber - 1] = { map: map, score: raceDifference };
    (0, generalController_1.saveJSONToFile)(botwar, botwarPath);
    return makeResponseMessage(botwar.channels[idChannel], map, scoreYF, scoreAdv, raceDifference, raceAsNumber, spots);
};
exports.editRace = editRace;
const addPena = (team, amount, idChannel) => {
    if (!checkIfWarExistInChannel(idChannel))
        return errorMessage.noWarInChannel();
    if (team === "YF") {
        botwar.channels[idChannel].team1.penality += amount;
    }
    else {
        botwar.channels[idChannel].team2.penality += amount;
    }
    return `${amount} points retiré à la team : ${team}`;
};
exports.addPena = addPena;
const changeTagTeam = (tagTeam, idChannel) => {
    if (!checkIfWarExistInChannel(idChannel))
        return errorMessage.noWarInChannel();
    if (tagTeam === botwar.channels[idChannel].team1.nameTeam)
        return "Echec lors du changement de tag";
    const save = rosterList.has(tagTeam.toUpperCase());
    botwar.channels[idChannel].team1.nameTeam = tagTeam;
    botwar.channels[idChannel].paramWar.saveStats = save;
    (0, generalController_1.saveJSONToFile)(botwar, botwarPath);
    return `Nouveau tag : ${tagTeam}\n${save ? "Sauvegarde activée" : "Sauvegarde pas activée"}`;
};
exports.changeTagTeam = changeTagTeam;
