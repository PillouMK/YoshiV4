import axios from "axios";
import { config } from "../config";
import { url } from "inspector";
import { error } from "console";
import { MapMK } from "src/model/mapDAO";
import { ResponseYF } from "../model/responseYF";

// CONSTANTE
const API_URL: string = "https://yoshi-family-api.fr/v1";
const API_KEY: string = config.API_KEY!;

// endpoints :
const mapsEndpoint = "/maps";
const timetrialEndpoint = "/timetrial";
const playerEndpoint = "/player";
const projectMapEndpoint = "/projectmap";
const weeklyEndpoint = "/weekly";

const header = {
  Accept: "application/json",
  "api-key": API_KEY,
};

export const getAllMaps = async (): Promise<ResponseYF> => {
  let responseObject: ResponseYF;
  const maps = await axios
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

export const postProjectMap = async (projectMapPostObject: any) => {
  let responseObject: ResponseYF;
  const projectMap = await axios
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

export const getProjectMap = async (
  idRoster: string,
  month: number,
  iteration: number
) => {
  let responseObject: ResponseYF;

  const projectMap = await axios
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

export const getTimetrialsByMap = async (
  idMap: string,
  idRoster: string | undefined = undefined
) => {
  let responseObject;
  const timetrials = await axios
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

export const getPlayerById = async (idPlayer: string) => {
  let responseObject;
  const player = await axios
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

export const postPlayer = async (
  idPlayer: string,
  name: string,
  idRoster: string
) => {
  let responseObject;
  const player = await axios
    .post(
      `${API_URL}${playerEndpoint}`,
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

export const postWeeklyTT = async (
  idPlayer: string,
  idMap: string,
  time: number,
  isShroomless: boolean = false
) => {
  let responseObject;
  const postWeeklyTimetrial = await axios
    .post(
      `${API_URL}${weeklyEndpoint}`,
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
      `${API_URL}${weeklyEndpoint}/${idMap}/${idPlayer}/${isShroomless}`,
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

// const postMapWeekly = async (weeklyMapArray) => {
//   let responseObject;
//   const postMap = await axios
//     .post(
//       `${API_URL}/maps/weekly`,
//       {
//         weekly_maps: weeklyMapArray,
//       },
//       {
//         headers: header,
//       }
//     )
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
//   return postMap;
// };

// const patchMapWeekly = async (idMap, time) => {
//   let responseObject;
//   let body = {};
//   if (time.goldTime != undefined) body.goldTime = time.goldTime;
//   if (time.silverTime != undefined) body.silverTime = time.silverTime;
//   if (time.bronzeTime != undefined) body.bronzeTime = time.bronzeTime;
//   if (time.ironTime != undefined) body.idRoster = time.ironTime;
//   const patchMap = await axios
//     .patch(`${API_URL}/maps/weekly/${idMap}`, body, {
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
//   return patchMap;
// };
