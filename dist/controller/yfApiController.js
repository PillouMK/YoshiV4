"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.postMapWeekly = exports.getWeeklyTT = exports.patchWeeklyTT = exports.postWeeklyTT = exports.patchPlayer = exports.postPlayer = exports.getPlayerById = exports.getAllPlayers = exports.patchTimetrial = exports.postTimetrial = exports.getTimetrialsByMap = exports.getProjectMap = exports.postProjectMap = exports.getAllMaps = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const config_1 = require("../config");
const API_URL = "https://yoshi-family-api.fr/v1";
const API_KEY = config_1.config.API_KEY;
const mapsEndpoint = "/maps";
const timetrialEndpoint = "/timetrial";
const playerEndpoint = "/player";
const projectMapEndpoint = "/projectmap";
const weeklyEndpoint = "/weekly";
const header = {
    Accept: "application/json",
    "api-key": API_KEY,
};
const getAllMaps = async () => {
    let responseObject;
    const maps = await axios_1.default
        .get(`${API_URL}${mapsEndpoint}`, { headers: header })
        .then((response) => {
        responseObject = {
            statusCode: response.status,
            data: response.data,
        };
        return responseObject;
    })
        .catch((error) => {
        responseObject = {
            statusCode: error.response.status,
            data: error.response.data,
        };
        return responseObject;
    });
    return maps;
};
exports.getAllMaps = getAllMaps;
const postProjectMap = async (projectMapPostObject) => {
    let responseObject;
    const projectMap = await axios_1.default
        .post(`${API_URL}${projectMapEndpoint}`, projectMapPostObject, {
        headers: header,
    })
        .then((response) => {
        responseObject = {
            statusCode: response.status,
            data: response.data,
        };
        return responseObject;
    })
        .catch((error) => {
        responseObject = {
            statusCode: error.response.status,
            data: error.response.data,
        };
        return responseObject;
    });
    return projectMap;
};
exports.postProjectMap = postProjectMap;
const getProjectMap = async (idRoster, month, iteration) => {
    let responseObject;
    const projectMap = await axios_1.default
        .get(`${API_URL}${projectMapEndpoint}/${idRoster}`, {
        headers: header,
        params: {
            month: month,
            iteration: iteration,
        },
    })
        .then((response) => {
        responseObject = {
            statusCode: response.status,
            data: response.data,
        };
        return responseObject;
    })
        .catch((error) => {
        responseObject = {
            statusCode: error.response.status,
            data: error.response.data,
        };
        return responseObject;
    });
    return projectMap;
};
exports.getProjectMap = getProjectMap;
const getTimetrialsByMap = async (idMap, idRoster = undefined) => {
    let responseObject;
    const timetrials = await axios_1.default
        .get(`${API_URL}${timetrialEndpoint}/${idMap}`, {
        headers: header,
        params: {
            idRoster: idRoster,
        },
    })
        .then((response) => {
        responseObject = {
            statusCode: response.status,
            data: response.data,
        };
        return responseObject;
    })
        .catch((error) => {
        responseObject = {
            statusCode: error.response.status,
            data: error.response.data,
        };
        return responseObject;
    });
    return timetrials;
};
exports.getTimetrialsByMap = getTimetrialsByMap;
const postTimetrial = async (idPlayer, idMap, time, isShroomless = false) => {
    let responseObject;
    const timetrial = await axios_1.default
        .post(`${API_URL}/timetrial`, {
        idMap: idMap,
        idPlayer: idPlayer,
        time: time,
        isShroomless: isShroomless,
    }, {
        headers: header,
    })
        .then((response) => {
        responseObject = {
            statusCode: response.status,
            data: response.data,
        };
        return responseObject;
    })
        .catch((error) => {
        responseObject = {
            statusCode: error.response.status,
            data: error.response.data,
        };
        return responseObject;
    });
    return timetrial;
};
exports.postTimetrial = postTimetrial;
const patchTimetrial = async (idPlayer, idMap, time, isShroomless = false) => {
    let responseObject;
    let isShroomlessParam = !isShroomless ? 0 : 1;
    const timetrial = await axios_1.default
        .patch(`${API_URL}/timetrial/${idMap}/${idPlayer}/${isShroomlessParam}`, {
        time: time,
    }, {
        headers: header,
    })
        .then((response) => {
        responseObject = {
            statusCode: response.status,
            data: response.data,
        };
        return responseObject;
    })
        .catch((error) => {
        responseObject = {
            statusCode: error.response.status,
            data: error.response.data,
        };
        return responseObject;
    });
    return timetrial;
};
exports.patchTimetrial = patchTimetrial;
const getAllPlayers = async () => {
    let responseObject;
    const player = await axios_1.default
        .get(`${API_URL}${playerEndpoint}`, { headers: header })
        .then((response) => {
        responseObject = {
            statusCode: response.status,
            data: response.data,
        };
        return responseObject;
    })
        .catch((error) => {
        responseObject = {
            statusCode: error.response.status,
            data: error.response.data,
        };
        return responseObject;
    });
    return player;
};
exports.getAllPlayers = getAllPlayers;
const getPlayerById = async (idPlayer) => {
    let responseObject;
    const player = await axios_1.default
        .get(`${API_URL}${playerEndpoint}/${idPlayer}`, { headers: header })
        .then((response) => {
        responseObject = {
            statusCode: response.status,
            data: response.data,
        };
        return responseObject;
    })
        .catch((error) => {
        responseObject = {
            statusCode: error.response.status,
            data: error.response.data,
        };
        return responseObject;
    });
    return player;
};
exports.getPlayerById = getPlayerById;
const postPlayer = async (idPlayer, name, idRoster) => {
    let responseObject;
    const player = await axios_1.default
        .post(`${API_URL}${playerEndpoint}`, {
        idPlayer: idPlayer,
        name: name,
        idRoster: idRoster,
    }, { headers: header })
        .then((response) => {
        responseObject = {
            statusCode: response.status,
            data: response.data,
        };
        return responseObject;
    })
        .catch((error) => {
        responseObject = {
            statusCode: error.response.status,
            data: error.response.data,
        };
        return responseObject;
    });
    return player;
};
exports.postPlayer = postPlayer;
const patchPlayer = async (idPlayer, name, idRoster) => {
    let responseObject;
    let body = {};
    if (name != undefined)
        body.name = name;
    if (idRoster != undefined)
        body.idRoster = idRoster;
    const player = await axios_1.default
        .patch(`${API_URL}${playerEndpoint}/${idPlayer}`, body, { headers: header })
        .then((response) => {
        responseObject = {
            statusCode: response.status,
            data: response.data,
        };
        return responseObject;
    })
        .catch((error) => {
        responseObject = {
            statusCode: error.response.status,
            data: error.response.data,
        };
        return responseObject;
    });
    return player;
};
exports.patchPlayer = patchPlayer;
const postWeeklyTT = async (idPlayer, idMap, time, isShroomless = false) => {
    let responseObject;
    const postWeeklyTimetrial = await axios_1.default
        .post(`${API_URL}${weeklyEndpoint}`, {
        idMap: idMap,
        idPlayer: idPlayer,
        isShroomless: isShroomless,
        time: time,
    }, {
        headers: header,
    })
        .then((response) => {
        responseObject = {
            statusCode: response.status,
            data: response.data,
        };
        return responseObject;
    })
        .catch((error) => {
        responseObject = {
            statusCode: error.response.status,
            data: error.response.data,
        };
        return responseObject;
    });
    return postWeeklyTimetrial;
};
exports.postWeeklyTT = postWeeklyTT;
const patchWeeklyTT = async (idPlayer, idMap, time, isShroomless = false) => {
    let responseObject;
    const patchWeeklyTimetrial = await axios_1.default
        .patch(`${API_URL}${weeklyEndpoint}/${idMap}/${idPlayer}/${isShroomless}`, {
        time: time,
    }, {
        headers: header,
    })
        .then((response) => {
        responseObject = {
            statusCode: response.status,
            data: response.data,
        };
        return responseObject;
    })
        .catch((error) => {
        responseObject = {
            statusCode: error.response.status,
            data: error.response.data,
        };
        return responseObject;
    });
    return patchWeeklyTimetrial;
};
exports.patchWeeklyTT = patchWeeklyTT;
const getWeeklyTT = async () => {
    let responseObject;
    const weeklytt = await axios_1.default
        .get(`${API_URL}${weeklyEndpoint}`, {
        headers: header,
    })
        .then((response) => {
        responseObject = {
            statusCode: response.status,
            data: response.data,
        };
        return responseObject;
    })
        .catch((error) => {
        responseObject = {
            statusCode: error.response.status,
            data: error.response.data,
        };
        return responseObject;
    });
    return weeklytt;
};
exports.getWeeklyTT = getWeeklyTT;
const postMapWeekly = async (weeklyMapArray) => {
    let responseObject;
    const postMap = await axios_1.default
        .post(`${API_URL}${mapsEndpoint}/weekly`, {
        weekly_maps: weeklyMapArray,
    }, {
        headers: header,
    })
        .then((response) => {
        responseObject = {
            statusCode: response.status,
            data: response.data,
        };
        return responseObject;
    })
        .catch((error) => {
        responseObject = {
            statusCode: error.response.status,
            data: error.response.data,
        };
        return responseObject;
    });
    return postMap;
};
exports.postMapWeekly = postMapWeekly;
