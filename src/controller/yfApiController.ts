import axios from "axios";
import { config } from "../config";
import { ResponseAPI } from "../model/responseYF";
import { weeklyMapAPI } from "./weeklyttController";
import {
  Match,
  MatchComplete,
  MatchCreate,
  MatchCreated,
  MatchEdit,
  MatchPreview,
  MatchPublish,
} from "../model/match.dto";
import { Team } from "../model/team.dto";
import { MapMK_V2 } from "../model/map.dto";
import { Game } from "../model/game.dto";
import { UserCreate } from "../model/user.dto";
import { TimetrialRanking, TimetrialUpsert } from "../model/timetrial.dto";
import { GetMapStats, MapStatsParam } from "../model/map-stats.dto";

// CONSTANTE
const API_URL: string = "https://yoshi-family-api.fr/v1";
const API_V2_URL: string = "https://nest-yf-api-production.up.railway.app";
const API_KEY_V2: string = config.API_KEY_V2!;

// endpoints :
const endpoint = {
  users: "/users",
  maps: "/maps",
  teams: "/teams",
  rosters: "/rosters",
  timetrials: "/timetrials",
  games: "/games",
  map_stats: "/map-stats",
  matchs: (teamId: string | number) => `/teams/${teamId}/matchs`,
  match_users: "/match-users",
  timetrial: "/timetrial",
  weekly: "/weekly",
};

const header_v2 = {
  Accept: "application/json",
  "x-api-key": API_KEY_V2,
};

const postToApi = async <T>(
  endpoint: string,
  body: any
): Promise<ResponseAPI<T>> => {
  try {
    const response = await axios.post<T>(`${API_V2_URL}${endpoint}`, body, {
      headers: header_v2,
    });

    return {
      statusCode: response.status,
      data: response.data,
    };
  } catch (error: any) {
    return {
      statusCode: error.response?.status || 500,
      data: error.response?.data || { message: "Unexpected error" },
    };
  }
};

// const patchToApi = async <T>(
//   endpoint: string,
//   body: any
// ): Promise<ResponseAPI<T>> => {
//   try {
//     const response = await axios.patch<T>(`${API_V2_URL}${endpoint}`, body, {
//       headers: header_v2,
//     });

//     return {
//       statusCode: response.status,
//       data: response.data,
//     };
//   } catch (error: any) {
//     return {
//       statusCode: error.response?.status || 500,
//       data: error.response?.data || { message: "Unexpected error" },
//     };
//   }
// };

// Matchs API V2

// initialize match
export const _createMatch = (
  createMatch: MatchCreate
): Promise<ResponseAPI<MatchCreated>> =>
  postToApi(endpoint.matchs(createMatch.team_id), {
    opponent: createMatch.opponent,
    roster_id: createMatch.roster_id ?? null,
    game_id: createMatch.game_id,
  });

// complete result of match
export const _completeMatch = (
  completeMatch: MatchComplete,
  match_id: string,
  team_id: string
): Promise<ResponseAPI<any>> =>
  postToApi(`${endpoint.matchs(team_id)}/${match_id}/complete`, completeMatch);

// edit result of match
export const _editMatch = (
  editMatch: MatchEdit,
  match_id: string,
  team_id: string
): Promise<ResponseAPI<any>> =>
  postToApi(`${endpoint.matchs(team_id)}/${match_id}/edit`, editMatch);

// preview table of match
export const _previewMatch = (
  previewMatch: MatchPreview,
  match_id: string,
  team_id: string
): Promise<ResponseAPI<any>> =>
  postToApi(`${endpoint.matchs(team_id)}/${match_id}/preview`, previewMatch);

// preview table of match
export const _publishMatch = async (
  publishMatch: MatchPublish,
  match_id: string,
  team_id: string
): Promise<ResponseAPI<any>> => {
  return postToApi(
    `${endpoint.matchs(team_id)}/${match_id}/publish`,
    publishMatch
  );
};

export const _getAllMatchsDone = async (
  team_id: string
): Promise<ResponseAPI<MatchCreated[]>> => {
  try {
    const response = await axios.get<MatchCreated[]>(
      `${API_V2_URL}${endpoint.matchs(team_id)}/done`,
      {
        headers: header_v2,
      }
    );

    return {
      statusCode: response.status,
      data: response.data,
    };
  } catch (error: any) {
    return {
      statusCode: error.response?.status || 500,
      data: [],
    };
  }
};

export const _getAllMatchsPublished = async (
  team_id: string
): Promise<ResponseAPI<MatchCreated[]>> => {
  try {
    const response = await axios.get<MatchCreated[]>(
      `${API_V2_URL}${endpoint.matchs(team_id)}/published`,
      {
        headers: header_v2,
      }
    );

    return {
      statusCode: response.status,
      data: response.data,
    };
  } catch (error: any) {
    return {
      statusCode: error.response?.status || 500,
      data: [],
    };
  }
};

export const _getMatch = async (
  match_id: string,
  team_id: string
): Promise<ResponseAPI<Match>> => {
  try {
    const response = await axios.get<Match>(
      `${API_V2_URL}${endpoint.matchs(team_id)}/${match_id}`,
      {
        headers: header_v2,
      }
    );

    return {
      statusCode: response.status,
      data: response.data,
    };
  } catch (error: any) {
    return {
      statusCode: error.response?.status || 500,
      data: error.response?.data,
    };
  }
};

// *****************************
// Team
export const _getAllTeams = async (): Promise<ResponseAPI<Team[]>> => {
  try {
    const response = await axios.get<Team[]>(`${API_V2_URL}${endpoint.teams}`, {
      headers: header_v2,
    });

    return {
      statusCode: response.status,
      data: response.data,
    };
  } catch (error: any) {
    return {
      statusCode: error.response?.status || 500,
      data: [],
    };
  }
};

// *****************************
// Maps
export const _getAllMaps = async (
  game_id: string
): Promise<ResponseAPI<MapMK_V2[]>> => {
  try {
    const response = await axios.get<MapMK_V2[]>(
      `${API_V2_URL}${endpoint.maps}/${game_id}`,
      { headers: header_v2 }
    );

    return {
      statusCode: response.status,
      data: response.data,
    };
  } catch (error: any) {
    return {
      statusCode: error.response?.status || 500,
      data: [],
    };
  }
};

// *****************************
// Game
export const _getAllGame = async (): Promise<ResponseAPI<Game[]>> => {
  try {
    const response = await axios.get<Game[]>(`${API_V2_URL}${endpoint.games}`, {
      headers: header_v2,
    });

    return {
      statusCode: response.status,
      data: response.data,
    };
  } catch (error: any) {
    return {
      statusCode: error.response?.status || 500,
      data: [],
    };
  }
};

// Users

// users create
export const _createUsersBulk = (
  createUsers: UserCreate[]
): Promise<ResponseAPI<any>> =>
  postToApi(`${endpoint.users}/bulk`, {
    users: createUsers,
  });

export const _createUser = (
  createUser: UserCreate
): Promise<ResponseAPI<any>> =>
  postToApi(`${endpoint.users}`, {
    users: createUser,
  });

// Timetrial

// Timetrial upsert
// complete result of match

export const _upsertTimetrial = (
  upsertTimetrial: TimetrialUpsert
): Promise<ResponseAPI<any>> =>
  postToApi(`${endpoint.timetrials}`, upsertTimetrial);

export const _getTimetrialsByMap = async (
  map_tag: string,
  game_id: string,
  team_id: string
): Promise<ResponseAPI<TimetrialRanking>> => {
  try {
    const response = await axios.get<TimetrialRanking>(
      `${API_V2_URL}${endpoint.timetrials}/${map_tag}`,
      {
        headers: header_v2,
        params: {
          team_id: team_id,
          game_id: game_id,
        },
      }
    );

    return {
      statusCode: response.status,
      data: response.data,
    };
  } catch (error: any) {
    return {
      statusCode: error.response?.status || 500,
      data: error.response.data,
    };
  }
};

export const _getAllMapStats = async (
  map_stats_params: MapStatsParam
): Promise<ResponseAPI<GetMapStats>> => {
  try {
    const response = await axios.get<GetMapStats>(
      `${API_V2_URL}${endpoint.map_stats}`,
      {
        params: map_stats_params,
        headers: header_v2,
      }
    );
    return {
      statusCode: response.status,
      data: response.data,
    };
  } catch (error: any) {
    return {
      statusCode: error.response?.status || 500,
      data: error.response.data,
    };
  }
};

export const _getMapStatsByTag = async (
  map_stats_params: MapStatsParam,
  map_tag: string
): Promise<ResponseAPI<GetMapStats>> => {
  try {
    const response = await axios.get<GetMapStats>(
      `${API_V2_URL}${endpoint.map_stats}/${map_tag}`,
      {
        params: map_stats_params,
        headers: header_v2,
      }
    );

    return {
      statusCode: response.status,
      data: response.data,
    };
  } catch (error: any) {
    return {
      statusCode: error.response?.status || 500,
      data: error.response.data,
    };
  }
};
