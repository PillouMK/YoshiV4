"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getAllPlayers = exports.patchTimetrial = exports.postTimetrial = exports.getTimetrialsByMap = exports.getProjectMap = exports.postProjectMap = exports.getAllMaps = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const config_1 = require("../config");
const API_URL = "https://yoshi-family-api.fr/v1";
const API_KEY = config_1.config.API_KEY;
const mapsEndpoint = "/maps";
const timetrialEndpoint = "/timetrial";
const playerEndpoint = "/player";
const projectMapEndpoint = "/projectmap";
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
        .get(`${API_URL}/player`, { headers: header })
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
