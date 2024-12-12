"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.convertToMapMK = void 0;
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
