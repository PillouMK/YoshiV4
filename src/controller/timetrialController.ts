import { getTimetrialsByMap } from "./yfApiController"

type TimetrialData = {
    infoMap: InfoMap,
    timetrials: {
        arrayShroom: Timetrial[],
        arrayShroomless: Timetrial[]
    }
}

type InfoMap = {
    idMap: string,
    nameMap: string,
    minia: string,
    initialGame: string,
    DLC: boolean,
    retro: boolean
}

type Timetrial = {
    idPlayer: string,
    name: string,
    date: string,
    rosterName: string,
    idRoster: string,
    difference: string,
    duration: string
}

export const getTimetrialsDataByMap = async (idMap: string, idRoster: string|undefined) => {
    const response = await getTimetrialsByMap(idMap, idRoster);
    if(response.statusCode !== 200) { 
        return undefined
    }
    const data: TimetrialData = {
        infoMap: 
    }

}