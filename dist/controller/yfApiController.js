"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports._getMapStatsByTag = exports._getAllMapStats = exports._getTimetrialsByMap = exports._upsertTimetrial = exports._createUsersBulk = exports._getAllGame = exports._getAllMaps = exports._getAllTeams = exports._getMatch = exports._getAllMatchsPublished = exports._getAllMatchsDone = exports._publishMatch = exports._previewMatch = exports._completeMatch = exports._createMatch = void 0;
const tslib_1 = require("tslib");
const axios_1 = tslib_1.__importDefault(require("axios"));
const config_1 = require("../config");
const API_URL = "https://yoshi-family-api.fr/v1";
const API_V2_URL = "https://nest-yf-api-production.up.railway.app";
const API_KEY_V2 = config_1.config.API_KEY_V2;
const endpoint = {
    users: "/users",
    maps: "/maps",
    teams: "/teams",
    rosters: "/rosters",
    timetrials: "/timetrials",
    games: "/games",
    map_stats: "/map-stats",
    matchs: (teamId) => `/teams/${teamId}/matchs`,
    match_users: "/match-users",
    timetrial: "/timetrial",
    weekly: "/weekly",
};
const header_v2 = {
    Accept: "application/json",
    "x-api-key": API_KEY_V2,
};
const postToApi = async (endpoint, body) => {
    try {
        const response = await axios_1.default.post(`${API_V2_URL}${endpoint}`, body, {
            headers: header_v2,
        });
        return {
            statusCode: response.status,
            data: response.data,
        };
    }
    catch (error) {
        return {
            statusCode: error.response?.status || 500,
            data: error.response?.data || { message: "Unexpected error" },
        };
    }
};
const _createMatch = (createMatch) => postToApi(endpoint.matchs(createMatch.team_id), {
    opponent: createMatch.opponent,
    roster_id: createMatch.roster_id ?? null,
    game_id: createMatch.game_id,
});
exports._createMatch = _createMatch;
const _completeMatch = (completeMatch, match_id, team_id) => postToApi(`${endpoint.matchs(team_id)}/${match_id}/complete`, completeMatch);
exports._completeMatch = _completeMatch;
const _previewMatch = (previewMatch, match_id, team_id) => postToApi(`${endpoint.matchs(team_id)}/${match_id}/preview`, previewMatch);
exports._previewMatch = _previewMatch;
const _publishMatch = async (publishMatch, match_id, team_id) => {
    return postToApi(`${endpoint.matchs(team_id)}/${match_id}/publish`, publishMatch);
};
exports._publishMatch = _publishMatch;
const _getAllMatchsDone = async (team_id) => {
    try {
        const response = await axios_1.default.get(`${API_V2_URL}${endpoint.matchs(team_id)}/done`, {
            headers: header_v2,
        });
        return {
            statusCode: response.status,
            data: response.data,
        };
    }
    catch (error) {
        return {
            statusCode: error.response?.status || 500,
            data: [],
        };
    }
};
exports._getAllMatchsDone = _getAllMatchsDone;
const _getAllMatchsPublished = async (team_id) => {
    try {
        const response = await axios_1.default.get(`${API_V2_URL}${endpoint.matchs(team_id)}/published`, {
            headers: header_v2,
        });
        return {
            statusCode: response.status,
            data: response.data,
        };
    }
    catch (error) {
        return {
            statusCode: error.response?.status || 500,
            data: [],
        };
    }
};
exports._getAllMatchsPublished = _getAllMatchsPublished;
const _getMatch = async (match_id, team_id) => {
    try {
        const response = await axios_1.default.get(`${API_V2_URL}${endpoint.matchs(team_id)}/${match_id}`, {
            headers: header_v2,
        });
        return {
            statusCode: response.status,
            data: response.data,
        };
    }
    catch (error) {
        return {
            statusCode: error.response?.status || 500,
            data: error.response?.data,
        };
    }
};
exports._getMatch = _getMatch;
const _getAllTeams = async () => {
    try {
        const response = await axios_1.default.get(`${API_V2_URL}${endpoint.teams}`, {
            headers: header_v2,
        });
        return {
            statusCode: response.status,
            data: response.data,
        };
    }
    catch (error) {
        return {
            statusCode: error.response?.status || 500,
            data: [],
        };
    }
};
exports._getAllTeams = _getAllTeams;
const _getAllMaps = async (game_id) => {
    try {
        const response = await axios_1.default.get(`${API_V2_URL}${endpoint.maps}/${game_id}`, { headers: header_v2 });
        return {
            statusCode: response.status,
            data: response.data,
        };
    }
    catch (error) {
        return {
            statusCode: error.response?.status || 500,
            data: [],
        };
    }
};
exports._getAllMaps = _getAllMaps;
const _getAllGame = async () => {
    try {
        const response = await axios_1.default.get(`${API_V2_URL}${endpoint.games}`, {
            headers: header_v2,
        });
        return {
            statusCode: response.status,
            data: response.data,
        };
    }
    catch (error) {
        return {
            statusCode: error.response?.status || 500,
            data: [],
        };
    }
};
exports._getAllGame = _getAllGame;
const _createUsersBulk = (createUsers) => postToApi(`${endpoint.users}/bulk`, {
    users: createUsers,
});
exports._createUsersBulk = _createUsersBulk;
const _upsertTimetrial = (upsertTimetrial) => postToApi(`${endpoint.timetrials}`, upsertTimetrial);
exports._upsertTimetrial = _upsertTimetrial;
const _getTimetrialsByMap = async (map_tag, game_id, team_id) => {
    try {
        const response = await axios_1.default.get(`${API_V2_URL}${endpoint.timetrials}/${map_tag}`, {
            headers: header_v2,
            params: {
                team_id: team_id,
                game_id: game_id,
            },
        });
        return {
            statusCode: response.status,
            data: response.data,
        };
    }
    catch (error) {
        return {
            statusCode: error.response?.status || 500,
            data: error.response.data,
        };
    }
};
exports._getTimetrialsByMap = _getTimetrialsByMap;
const _getAllMapStats = async (map_stats_params) => {
    try {
        const response = await axios_1.default.get(`${API_V2_URL}${endpoint.map_stats}`, {
            params: map_stats_params,
            headers: header_v2,
        });
        return {
            statusCode: response.status,
            data: response.data,
        };
    }
    catch (error) {
        return {
            statusCode: error.response?.status || 500,
            data: error.response.data,
        };
    }
};
exports._getAllMapStats = _getAllMapStats;
const _getMapStatsByTag = async (map_stats_params, map_tag) => {
    try {
        const response = await axios_1.default.get(`${API_V2_URL}${endpoint.map_stats}/${map_tag}`, {
            params: map_stats_params,
            headers: header_v2,
        });
        return {
            statusCode: response.status,
            data: response.data,
        };
    }
    catch (error) {
        return {
            statusCode: error.response?.status || 500,
            data: error.response.data,
        };
    }
};
exports._getMapStatsByTag = _getMapStatsByTag;
