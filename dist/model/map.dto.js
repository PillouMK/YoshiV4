"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToMapMKWORLD = exports.convertToMapMK = void 0;
const convertToMapMK = (data) => ({
    idMap: data.idMap,
    nameMap: data.nameMap,
    minia: data.minia,
    bag: data.bag,
    initialGame: data.initialGame,
    DLC: !!data.DLC,
    retro: !!data.retro,
});
exports.convertToMapMK = convertToMapMK;
const convertToMapMKWORLD = (data) => ({
    id: data.id,
    tag: data.tag,
    name: data.name,
    game_id: data.game_id,
    created_at: data.created_at,
    updated_at: data.updated_at,
});
exports.convertToMapMKWORLD = convertToMapMKWORLD;
