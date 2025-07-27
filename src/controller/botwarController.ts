import botWarData from "../database/bot-war.json";
import { botLogs, saveJSONToFile } from "../controller/generalController";
import { ErrorMessage } from "../model/errorMessage";
import { Client } from "discord.js";
import { LIST_MAPS_MKWORLD } from "..";
import { MapMK_V2 } from "../model/map.dto";
import { _completeMatch, _createMatch } from "./yfApiController";
import { MatchComplete, MatchCreate } from "../model/match.dto";
import { globalData } from "../global";
import { MapStatsCreate } from "../model/map-stats.dto";
import { ResponseAPI } from "../model/responseYF";

// ------------
// CONSTANTE
// ------------

const pointMapping: { [key: string]: number } = {
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
const rosterList: Set<String> = new Set<string>(["YFG", "YFO"]);
const botwar: BotWarType = botWarData as BotWarType;
const embedMsg = "```";
const backToLine = "\n";
const botwarPath: string = "./src/database/bot-war.json";
const errorMessage = new ErrorMessage();
// ------------

// ------------
// TYPE : -----
// ------------
type ScoreMap = { map: string; score: number };

type Team = {
  nameTeam: string;
  penality: number;
  total: number;
  recapScore: number[];
};

type ParamWar = {
  match_id: number;
  game: string;
  verifDoublon: {
    spots: string[];
    map: string;
  };
  isStoppable: boolean;
  race: number;
  totaleDiff: number;
  recapWar: MapStatsCreate[];
};

type WarObjectType = {
  team1: Team;
  team2: Team;
  paramWar: ParamWar;
};

interface BotWarType {
  channels: {
    [idChannel: string]: WarObjectType;
  };
}
// ------------

// ----------------
// BotWar methods :
// ----------------

// Check if the map is valids
const checkIfMapExist = (mapKey: string, mapList: MapMK_V2[]): boolean => {
  return mapList.findIndex((map) => map.tag === mapKey) != -1;
};

// Check if the spot are valids
const checkIfSpotsAreValids = (spots: string[]): boolean => {
  const validNumbers = new Set<string>(
    Array.from({ length: 12 }, (_, i) => (i + 1).toString())
  );

  for (const item of spots) {
    if (!validNumbers.has(item)) {
      return false;
    }
  }
  return true;
};

// Check if no duplicates
const checkDuplicateSpots = (spots: string[]): boolean => {
  const uniqueSet = new Set<string>();

  for (const item of spots) {
    if (uniqueSet.has(item)) {
      return false;
    }
    uniqueSet.add(item);
  }
  return true;
};

const checkNumberofSpots = (spots: string[]): boolean => {
  return spots.length == 6;
};

const checkIfWarExistInChannel = (idChannel: string): boolean => {
  return idChannel in botWarData.channels;
};

const areRacesEquals = (
  arr1: string[],
  arr2: string[],
  map1: string,
  map2: string
): boolean => {
  if (map1 !== map2) return false;
  if (arr1.length !== arr2.length) return false;
  return arr1.every((item, index) => item === arr2[index]);
};

// Botwar - Conversion des places en points
const placeToPoint = (spots: string[]): number => {
  let totalYF: number = 0;
  for (let value of spots) {
    if (pointMapping[value]) {
      totalYF += pointMapping[value];
    }
  }
  return totalYF;
};

const getWarResults = (idChannel: string): WarObjectType => {
  return botwar.channels[idChannel];
};

const sendProjectMapData = async (results: WarObjectType): Promise<boolean> => {
  // Set data :
  const resultArray: { idMap: string; scoreMap: number }[] = [];

  results.paramWar.recapWar.forEach((item) => {
    resultArray.push({ idMap: item.map_tag, scoreMap: item.score });
  });

  const apiObject = {
    scoresMaps: resultArray,
    scoreMatch: results.paramWar.totaleDiff,
    idRoster: results.team1.nameTeam,
  };

  // const apiCall: ResponseYF = await postProjectMap(apiObject);

  //return apiCall.statusCode === 201;
  return true;
};

const checkIfRaceIsValidNumber = (race: string): boolean => {
  return !isNaN(Number(race)) && Number.isInteger(Number(race));
};

export const getNumberOfRace = (idChannel: string): number => {
  return botwar.channels[idChannel].paramWar.race;
};

const similarMapMessage = (map: string) => {
  return `${map} n'existe pas`;
};

const makeResponseMessage = (
  war: WarObjectType,
  map: string,
  scoreYF: number,
  scoreAdv: number,
  raceDifference: number,
  raceNumber: number,
  spots: string[]
): string => {
  // Template Pena
  const penaYF: string =
    war.team1.penality > 0 ? `Pénalité : ${war.team1.penality.toString()}` : "";
  const penaADV: string =
    war.team2.penality > 0 ? `Pénalité : ${war.team2.penality.toString()}` : "";

  let recapRace: string = `${embedMsg}${backToLine}Course n°${raceNumber.toString()} (${map}) | Spots : ${spots.join(
    ", "
  )}${backToLine}`;
  recapRace += `${war.team1.nameTeam} = ${scoreYF.toString()}${backToLine}${
    war.team2.nameTeam
  } = ${scoreAdv.toString()}${backToLine}    Différence : ${raceDifference.toString()}${backToLine}${embedMsg}`;

  const scoreYFWithPena = war.team1.total - war.team1.penality;
  const scoreADVWithPena = war.team2.total - war.team2.penality;
  const diffWithPena = scoreYFWithPena - scoreADVWithPena;

  let recapWar: string = `${embedMsg}${backToLine}Score total après la course n°${raceNumber.toString()}${backToLine}`;
  recapWar += `${war.team1.nameTeam} = ${scoreYFWithPena}     ${penaYF}${backToLine}`;
  recapWar += `${war.team2.nameTeam} = ${scoreADVWithPena}     ${penaADV}${backToLine}`;
  recapWar += `   Différence totale : ${diffWithPena}${backToLine}${embedMsg}`;

  let recapAllMaps: string = "";
  war.paramWar.recapWar.forEach((item, index) => {
    const space = index < 9 ? "  | " : " | ";
    recapAllMaps += `${(index + 1).toString()}${space}${
      war.team1.nameTeam
    } ${war.team1.recapScore[index].toString()} - ${war.team2.recapScore[
      index
    ].toString()} ${war.team2.nameTeam} (${item.score.toString()}) sur ${
      item.map_tag
    }${backToLine}`;
  });
  const endRecap: string = `${embedMsg}${backToLine}Récapitulatif des courses :${backToLine}${recapAllMaps}${backToLine}${embedMsg}`;

  return recapRace + recapWar + endRecap;
};

// Slash Commands methods :

export const createWar = async (
  bot: Client,
  team_id: string,
  idChannel: string,
  nameTeam1: string,
  nameTeam2: string,
  game: string
): Promise<boolean> => {
  // Cancel create if war already exist in that channel
  if (checkIfWarExistInChannel(idChannel)) return false;

  const roster = globalData.getRoster(team_id, nameTeam1);

  const match: MatchCreate = {
    game_id: game,
    team_id: team_id,
    opponent: nameTeam2,
    roster_id: roster?.id,
  };
  const createWar = await _createMatch(match);

  if (createWar.statusCode == 201) {
    const warObject: WarObjectType = {
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
        match_id: createWar.data.id,
        game: game,
        verifDoublon: {
          spots: [],
          map: "",
        },
        isStoppable: false,
        race: 0,
        totaleDiff: 0,
        recapWar: [] as MapStatsCreate[],
      },
    };
    botwar.channels[idChannel] = warObject;
    saveJSONToFile(botwar, botwarPath);
    return true;
  } else {
    botLogs(bot, "Match créé :" + createWar.data.id.toString());
    console.error(createWar.statusCode, createWar.data);
    return false;
  }
};

export const stopWar = async (
  bot: Client,
  idChannel: string,
  isForced: boolean = false
): Promise<string> => {
  if (!checkIfWarExistInChannel(idChannel))
    return errorMessage.noWarInChannel();
  if (!isForced && getNumberOfRace(idChannel) < 12)
    return "le war n'a pas atteint 12 courses, ajoute l'option force avec /stopwar pour forcer l'arrêt";
  const result = getWarResults(idChannel);
  const isWin =
    result.paramWar.totaleDiff > 0
      ? "Victoire"
      : result.paramWar.totaleDiff == 0
      ? "Egalité"
      : "Défaite";
  let msg = `Fin du war\n${isWin} : ${result.team1.total.toString()} - ${result.team2.total.toString()} (${result.paramWar.totaleDiff.toString()})\n${
    getNumberOfRace(idChannel) < 10 ? "Match annulé" : ""
  }`;

  const map_stats: MapStatsCreate[] = result.paramWar.recapWar;

  const matchComplete: MatchComplete = {
    is_canceled: getNumberOfRace(idChannel) < 10,
    score_team: result.team1.total,
    score_opponent: result.team2.total,
    pena_team: result.team1.penality,
    pena_opponent: result.team2.penality,
    score_total: result.paramWar.totaleDiff,
    maps: map_stats,
  };
  console.log("matchComplete", matchComplete);

  const completeMatch: ResponseAPI<any> = await _completeMatch(
    matchComplete,
    result.paramWar.match_id.toString()
  );
  if (completeMatch.statusCode == 201) {
    let match_id = `\nIdentifiant du match : \`${result.paramWar.match_id}\``;
    botLogs(
      bot,
      `War ended : ${result.team1.total.toString()} - ${result.team2.total.toString()} (${result.paramWar.totaleDiff.toString()})${match_id}`
    );
    botLogs(bot, `API - CompleteMatch success`);
    delete botwar.channels[idChannel];
    saveJSONToFile(botwar, botwarPath);
    return msg + match_id;
  } else {
    console.log("error:", completeMatch.statusCode);
    console.log("error:", completeMatch.data);
    botLogs(bot, `API - CompleteMatch fail`);
    botLogs(
      bot,
      `${completeMatch.statusCode} - ${completeMatch.data.toString()}`
    );
    return "Erreur lors de la commande, stopwar canceled";
  }
};

export const raceAdd = async (
  spots: string[],
  map: string,
  idChannel: string
): Promise<string> => {
  if (!checkIfWarExistInChannel(idChannel))
    return errorMessage.noWarInChannel();
  if (!checkIfMapExist(map, LIST_MAPS_MKWORLD)) return similarMapMessage(map);
  if (!checkNumberofSpots(spots))
    return errorMessage.spotsLengthOutOfRange(spots);
  if (!checkIfSpotsAreValids(spots)) return errorMessage.spotsNotValids(spots);
  if (!checkDuplicateSpots(spots)) return errorMessage.spotDuplicated(spots);
  const oldRace = botwar.channels[idChannel].paramWar.verifDoublon;
  if (areRacesEquals(spots, oldRace.spots, map, oldRace.map)) {
    botwar.channels[idChannel].paramWar.verifDoublon.map = "";
    saveJSONToFile(botwar, botwarPath);
    return errorMessage.raceDuplicated();
  }

  const scoreYF: number = placeToPoint(spots);
  const scoreAdv: number = 82 - scoreYF;
  const raceDifference: number = scoreYF - scoreAdv;

  // Update team 1 :
  const team1: Team = botwar.channels[idChannel].team1;
  team1.total += scoreYF;
  team1.recapScore.push(scoreYF);

  // Update team 2 :
  const team2: Team = botwar.channels[idChannel].team2;
  team2.total += scoreAdv;
  team2.recapScore.push(scoreAdv);

  // Update War :
  const paramWar: ParamWar = botwar.channels[idChannel].paramWar;
  paramWar.race++;
  paramWar.verifDoublon.map = map;
  paramWar.verifDoublon.spots = spots;
  paramWar.recapWar.push({ map_tag: map, score: raceDifference });
  paramWar.totaleDiff += raceDifference;
  saveJSONToFile(botwar, botwarPath);

  return makeResponseMessage(
    botwar.channels[idChannel],
    map,
    scoreYF,
    scoreAdv,
    raceDifference,
    paramWar.race,
    spots
  );
};

export const editRace = async (
  spots: string[],
  map: string,
  idChannel: string,
  race: string
): Promise<string> => {
  if (!checkIfWarExistInChannel(idChannel))
    return errorMessage.noWarInChannel();
  if (!checkIfRaceIsValidNumber(race))
    return errorMessage.raceIsNotANumber(race);
  if (!(getNumberOfRace(idChannel) >= parseInt(race)))
    return errorMessage.raceIsOutOfRange(race);

  if (!checkIfSpotsAreValids(spots)) return errorMessage.spotsNotValids(spots);
  if (!checkDuplicateSpots(spots)) return errorMessage.spotDuplicated(spots);

  const raceAsNumber: number = parseInt(race);
  const scoreYF: number = placeToPoint(spots);
  const scoreAdv: number = 82 - scoreYF;
  const raceDifference: number = scoreYF - scoreAdv;
  // Update new scores of the race
  // Team 1 :
  const team1: Team = botwar.channels[idChannel].team1;
  team1.total = team1.total - team1.recapScore[raceAsNumber - 1] + scoreYF;
  team1.recapScore[raceAsNumber - 1] = scoreYF;

  // Team 1 :
  const team2: Team = botwar.channels[idChannel].team2;
  team2.total = team2.total - team2.recapScore[raceAsNumber - 1] + scoreAdv;
  team2.recapScore[raceAsNumber - 1] = scoreAdv;

  // ParamWar :
  const paramWar: ParamWar = botwar.channels[idChannel].paramWar;
  paramWar.totaleDiff =
    paramWar.totaleDiff -
    paramWar.recapWar[raceAsNumber - 1].score +
    raceDifference;
  paramWar.recapWar[raceAsNumber - 1] = { map_tag: map, score: raceDifference };
  saveJSONToFile(botwar, botwarPath);

  return makeResponseMessage(
    botwar.channels[idChannel],
    map,
    scoreYF,
    scoreAdv,
    raceDifference,
    raceAsNumber,
    spots
  );
};

export const addPena = (
  team: string,
  amount: number,
  idChannel: string
): string => {
  if (!checkIfWarExistInChannel(idChannel))
    return errorMessage.noWarInChannel();
  if (team === "YF") {
    botwar.channels[idChannel].team1.penality += amount;
  } else {
    botwar.channels[idChannel].team2.penality += amount;
  }
  return `${amount} points retiré à la team : ${team}`;
};

export const changeTagTeam = (tagTeam: string, idChannel: string): string => {
  if (!checkIfWarExistInChannel(idChannel))
    return errorMessage.noWarInChannel();
  if (tagTeam === botwar.channels[idChannel].team1.nameTeam)
    return "Echec lors du changement de tag";

  const save: boolean = rosterList.has(tagTeam.toUpperCase());
  botwar.channels[idChannel].team1.nameTeam = tagTeam;
  saveJSONToFile(botwar, botwarPath);

  return `Nouveau tag : ${tagTeam}\n${
    save ? "Sauvegarde activée" : "Sauvegarde pas activée"
  }`;
};
