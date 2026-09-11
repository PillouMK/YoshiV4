"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.changeTagTeam = exports.addPena = exports.editRace = exports.raceAdd = exports.stopWar = exports.createWar = exports.set_last_message_id = exports.getNumberOfRace = void 0;
const tslib_1 = require("tslib");
const generalController_1 = require("../controller/generalController");
const errorMessage_1 = require("../model/errorMessage");
const __1 = require("..");
const yfApiController_1 = require("./yfApiController");
const global_1 = require("../global");
const json_1 = require("../model/json");
const path_1 = tslib_1.__importDefault(require("path"));
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
const rosterList = new Set(["YFI", "YFS"]);
const embedMsg = "```";
const backToLine = "\n";
const errorMessage = new errorMessage_1.ErrorMessage();
const botWarPath = path_1.default.resolve(process.cwd(), "data", "bot-war.json");
const DEFAULT_BOT_WAR = {
    channels: {},
};
const botWarStore = new json_1.JsonStore(botWarPath, DEFAULT_BOT_WAR);
const botwar = botWarStore.load();
const checkIfMapExist = (mapKey, mapList) => {
    return mapList.findIndex((map) => map.tag === mapKey) != -1;
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
    return idChannel in botwar.channels;
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
    for (const value of spots) {
        if (pointMapping[value]) {
            totalYF += pointMapping[value];
        }
    }
    return totalYF;
};
const getWarResults = (channel_id) => {
    return botwar.channels[channel_id];
};
const checkIfRaceIsValidNumber = (race) => {
    return !isNaN(Number(race)) && Number.isInteger(Number(race));
};
const getNumberOfRace = (idChannel) => {
    return botwar.channels[idChannel].paramWar.race;
};
exports.getNumberOfRace = getNumberOfRace;
const similarMapMessage = (map) => {
    return `${map} n'existe pas`;
};
const set_last_message_id = (id, channel_id) => {
    botwar.channels[channel_id].paramWar.last_message_id = `${channel_id}/${id}`;
    botWarStore.save(botwar);
};
exports.set_last_message_id = set_last_message_id;
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
        recapAllMaps += `${(index + 1).toString()}${space}${war.team1.nameTeam} ${war.team1.recapScore[index].toString()} - ${war.team2.recapScore[index].toString()} ${war.team2.nameTeam} (${item.score.toString()}) sur ${item.map_tag}${backToLine}`;
    });
    const endRecap = `${embedMsg}${backToLine}Récapitulatif des courses :${backToLine}${recapAllMaps}${backToLine}${embedMsg}`;
    return recapRace + recapWar + endRecap;
};
const createWar = async (bot, team_id, idChannel, nameTeam1, nameTeam2, game) => {
    if (checkIfWarExistInChannel(idChannel))
        return false;
    const roster = global_1.globalData.getRoster(team_id, nameTeam1);
    const match = {
        game_id: game,
        team_id: team_id,
        opponent: nameTeam2,
        roster_id: roster?.id,
    };
    const createWar = await (0, yfApiController_1._createMatch)(match);
    if (createWar.statusCode == 201) {
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
                last_message_id: "",
                match_id: createWar.data.id,
                game: game,
                verifDoublon: {
                    spots: [],
                    map: "",
                },
                isStoppable: false,
                race: 0,
                totaleDiff: 0,
                recapWar: [],
            },
        };
        botwar.channels[idChannel] = warObject;
        botWarStore.save(botwar);
        return true;
    }
    else {
        (0, generalController_1.botLogs)(bot, "Match créé :" + createWar.data.id.toString());
        console.error(createWar.statusCode, createWar.data);
        return false;
    }
};
exports.createWar = createWar;
const stopWar = async (bot, idChannel, team_id, isForced = false) => {
    if (!checkIfWarExistInChannel(idChannel))
        return errorMessage.noWarInChannel();
    if (!isForced && (0, exports.getNumberOfRace)(idChannel) < 12)
        return "le war n'a pas atteint 12 courses, ajoute l'option force avec /stopwar pour forcer l'arrêt";
    const result = getWarResults(idChannel);
    const isWin = result.paramWar.totaleDiff > 0
        ? "Victoire"
        : result.paramWar.totaleDiff == 0
            ? "Egalité"
            : "Défaite";
    const msg = `Fin du war\n${isWin} : ${result.team1.total.toString()} - ${result.team2.total.toString()} (${result.paramWar.totaleDiff.toString()})\n${(0, exports.getNumberOfRace)(idChannel) < 10 ? "Match annulé" : ""}`;
    const map_stats = result.paramWar.recapWar;
    const matchComplete = {
        is_canceled: (0, exports.getNumberOfRace)(idChannel) < 10,
        score_team: result.team1.total,
        score_opponent: result.team2.total,
        pena_team: result.team1.penality,
        pena_opponent: result.team2.penality,
        score_total: result.paramWar.totaleDiff,
        maps: map_stats,
        last_message_id: result.paramWar.last_message_id,
    };
    console.log("matchComplete", matchComplete);
    const completeMatch = await (0, yfApiController_1._completeMatch)(matchComplete, result.paramWar.match_id.toString(), team_id);
    if (completeMatch.statusCode == 201) {
        const match_id = `\nIdentifiant du match : \`${result.paramWar.match_id}\``;
        (0, generalController_1.botLogs)(bot, `War ended : ${result.team1.total.toString()} - ${result.team2.total.toString()} (${result.paramWar.totaleDiff.toString()})${match_id}`);
        (0, generalController_1.botLogs)(bot, `API - CompleteMatch success`);
        delete botwar.channels[idChannel];
        botWarStore.save(botwar);
        return msg + match_id;
    }
    else {
        console.log("error:", completeMatch.statusCode);
        console.log("error:", completeMatch.data);
        (0, generalController_1.botLogs)(bot, `API - CompleteMatch fail`);
        (0, generalController_1.botLogs)(bot, `${completeMatch.statusCode} - ${completeMatch.data.toString()}`);
        return "Erreur lors de la commande, stopwar canceled";
    }
};
exports.stopWar = stopWar;
const raceAdd = async (spots, map, idChannel) => {
    if (!checkIfWarExistInChannel(idChannel))
        return errorMessage.noWarInChannel();
    if (!checkIfMapExist(map, __1.LIST_MAPS_MKWORLD))
        return similarMapMessage(map);
    if (!checkNumberofSpots(spots))
        return errorMessage.spotsLengthOutOfRange(spots);
    if (!checkIfSpotsAreValids(spots))
        return errorMessage.spotsNotValids(spots);
    if (!checkDuplicateSpots(spots))
        return errorMessage.spotDuplicated(spots);
    const oldRace = botwar.channels[idChannel].paramWar.verifDoublon;
    if (areRacesEquals(spots, oldRace.spots, map, oldRace.map)) {
        botwar.channels[idChannel].paramWar.verifDoublon.map = "";
        botWarStore.save(botwar);
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
    paramWar.recapWar.push({ map_tag: map, score: raceDifference });
    paramWar.totaleDiff += raceDifference;
    botWarStore.save(botwar);
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
    paramWar.recapWar[raceAsNumber - 1] = { map_tag: map, score: raceDifference };
    botWarStore.save(botwar);
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
    botWarStore.save(botwar);
    return `Nouveau tag : ${tagTeam}\n${save ? "Sauvegarde activée" : "Sauvegarde pas activée"}`;
};
exports.changeTagTeam = changeTagTeam;
