export type MapMK = {
  idMap: string;
  nameMap: string;
  minia: string;
  bag: string;
  initialGame: string;
  DLC: boolean;
  retro: boolean;
};

export const convertToMapMK = (data: any): MapMK => ({
  idMap: data.idMap,
  nameMap: data.nameMap,
  minia: data.minia,
  bag: data.bag,
  initialGame: data.initialGame,
  DLC: !!data.DLC,
  retro: !!data.retro,
});
