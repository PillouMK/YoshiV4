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
const mapsEndpoint = '/maps';
const timetrialEndpoint = '/timetrial';
const playerEndpoint = '/player';
const projectMapEndpoint = '/projectmap';

const header = {
    "Accept" : "application/json",
    "api-key" : API_KEY
}



export const getAllMaps = async (): Promise<ResponseYF> => {
    let responseObject: ResponseYF;
    const maps = await axios.get(
        `${API_URL}${mapsEndpoint}`,
        { headers: header }
    ).then(response => {
        console.log("test", response.status);
        responseObject = {
            statusCode: response.status,
            data: response.data
        }
        return responseObject;
    }).catch(error => {
        console.log("testerror", error);
        responseObject = {
            statusCode: error.response.status,
            data: error.response.data
        }
        return responseObject;
    })
    return maps
}

export const postProjectMap = async (projectMapPostObject: any) => {
    let responseObject: ResponseYF;
    const projectMap = await axios.post(
        `${API_URL}${projectMapEndpoint}`,
        projectMapPostObject,
        {
            headers : header,  
        }
    ).then(response => {
        responseObject = {
            statusCode : response.status,
            data : response.data
        }
        return responseObject;
    }).catch(error => {
        responseObject = {
            statusCode : error.response.status,
            data : error.response.data
        }
        return responseObject
    });
    return projectMap;
}