import axios from "axios";
import { config } from "../config";
import { ResponseAPI } from "../model/responseYF";
import { weeklyMapAPI } from "./weeklyttController";
import {
  MatchComplete,
  MatchCreate,
  MatchCreated,
  MatchPreview,
  MatchPublish,
} from "../model/match.dto";
import { Team } from "../model/team.dto";
import { MapMK_V2 } from "../model/map.dto";
import { Game } from "../model/game.dto";
import { UserCreate } from "../model/user.dto";
import { TimetrialUpsert } from "../model/timetrial.dto";

// CONSTANTE
const API_URL: string = "https://yoshi-family-api.fr/v1";
const API_V2_URL: string = "https://nest-yf-api-production.up.railway.app";
const API_KEY: string = config.API_KEY!;
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
  matchs: "/matchs",
  match_users: "/match-users",
  timetrial: "/timetrial",
  weekly: "/weekly",
};
const header = {
  Accept: "application/json",
  "api-key": API_KEY,
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

// Matchs API V2

// initialize match
export const _createMatch = (
  createMatch: MatchCreate
): Promise<ResponseAPI<MatchCreated>> =>
  postToApi(endpoint.matchs, {
    opponent: createMatch.opponent,
    team_id: createMatch.team_id,
    roster_id: createMatch.roster_id ?? null,
    game_id: createMatch.game_id,
  });

// complete result of match
export const _completeMatch = (
  completeMatch: MatchComplete,
  match_id: string
): Promise<ResponseAPI<any>> =>
  postToApi(`${endpoint.matchs}/${match_id}/complete`, completeMatch);

// preview table of match
export const _previewMatch = (
  previewMatch: MatchPreview,
  match_id: string
): Promise<ResponseAPI<any>> =>
  postToApi(`${endpoint.matchs}/${match_id}/preview`, previewMatch);

// preview table of match
export const _publishMatch = async (
  publishMatch: MatchPublish,
  match_id: string
): Promise<ResponseAPI<any>> => {
  return postToApi(`${endpoint.matchs}/${match_id}/publish`, publishMatch);
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

// Timetrial

// Timetrial upsert
// complete result of match
export const _upsertTimetrial = (
  upsertTimetrial: TimetrialUpsert
): Promise<ResponseAPI<any>> =>
  postToApi(`${endpoint.timetrials}`, upsertTimetrial);

// export const postProjectMap = async (projectMapPostObject: any) => {
//   let responseObject: ResponseYF;
//   const projectMap = await axios
//     .post(`${API_URL}${projectMapEndpoint}`, projectMapPostObject, {
//       headers: header,
//     })
//     .then((response) => {
//       responseObject = {
//         statusCode: response.status,
//         data: response.data,
//       };
//       return responseObject;
//     })
//     .catch((error) => {
//       responseObject = {
//         statusCode: error.response.status,
//         data: error.response.data,
//       };
//       return responseObject;
//     });
//   return projectMap;
// };

// export const getProjectMap = async (
//   idRoster: string,
//   month: number,
//   iteration: number
// ) => {
//   let responseObject: ResponseYF;

//   const projectMap = await axios
//     .get(`${API_URL}${projectMapEndpoint}/${idRoster}`, {
//       headers: header,
//       params: {
//         month: month,
//         iteration: iteration,
//       },
//     })
//     .then((response) => {
//       responseObject = {
//         statusCode: response.status,
//         data: response.data,
//       };
//       return responseObject;
//     })
//     .catch((error) => {
//       responseObject = {
//         statusCode: error.response.status,
//         data: error.response.data,
//       };
//       return responseObject;
//     });

//   return projectMap;
// };

export const getTimetrialsByMap = async (
  idMap: string,
  idRoster: string | undefined = undefined
) => {
  let responseObject;
  const timetrials = await axios
    .get(`${API_URL}${endpoint.timetrial}/${idMap}`, {
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

export const postTimetrial = async (
  idPlayer: string,
  idMap: string,
  time: number,
  isShroomless: boolean = false
) => {
  let responseObject;
  const timetrial = await axios
    .post(
      `${API_URL}/timetrial`,
      {
        idMap: idMap,
        idPlayer: idPlayer,
        time: time,
        isShroomless: isShroomless,
      },
      {
        headers: header,
      }
    )
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

export const patchTimetrial = async (
  idPlayer: string,
  idMap: string,
  time: number,
  isShroomless: boolean = false
) => {
  let responseObject;
  let isShroomlessParam = !isShroomless ? 0 : 1;
  const timetrial = await axios
    .patch(
      `${API_URL}/timetrial/${idMap}/${idPlayer}/${isShroomlessParam}`,
      {
        time: time,
      },
      {
        headers: header,
      }
    )
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

export const getAllPlayers = async () => {
  let responseObject;
  const player = await axios
    .get(`${API_URL}${"/players"}`, { headers: header })
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

export const getPlayerById = async (idPlayer: string) => {
  let responseObject;
  const player = await axios
    .get(`${API_URL}${"/players"}/${idPlayer}`, { headers: header })
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

export const postPlayer = async (
  idPlayer: string,
  name: string,
  idRoster: string
) => {
  let responseObject;
  const player = await axios
    .post(
      `${API_URL}${"/players"}`,
      {
        idPlayer: idPlayer,
        name: name,
        idRoster: idRoster,
      },
      { headers: header }
    )
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

export const patchPlayer = async (
  idPlayer: string,
  name?: string,
  idRoster?: string
) => {
  let responseObject;
  let body: any = {};
  if (name != undefined) body.name = name;
  if (idRoster != undefined) body.idRoster = idRoster;
  const player = await axios
    .patch(`${API_URL}${"/players"}/${idPlayer}`, body, { headers: header })
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

export const postWeeklyTT = async (
  idPlayer: string,
  idMap: string,
  time: number,
  isShroomless: boolean = false
) => {
  let responseObject;
  const postWeeklyTimetrial = await axios
    .post(
      `${API_URL}${endpoint.weekly}`,
      {
        idMap: idMap,
        idPlayer: idPlayer,
        isShroomless: isShroomless,
        time: time,
      },
      {
        headers: header,
      }
    )
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

export const patchWeeklyTT = async (
  idPlayer: string,
  idMap: string,
  time: number,
  isShroomless: boolean = false
) => {
  let responseObject;
  const patchWeeklyTimetrial = await axios
    .patch(
      `${API_URL}${endpoint.weekly}/${idMap}/${idPlayer}/${isShroomless}`,
      {
        time: time,
      },
      {
        headers: header,
      }
    )
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

export const getWeeklyTT = async () => {
  let responseObject;
  const weeklytt = await axios
    .get(`${API_URL}${endpoint.weekly}`, {
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

export const postMapWeekly = async (weeklyMapArray: weeklyMapAPI[]) => {
  let responseObject;
  const postMap = await axios
    .post(
      `${API_URL}${endpoint.maps}/weekly`,
      {
        weekly_maps: weeklyMapArray,
      },
      {
        headers: header,
      }
    )
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
