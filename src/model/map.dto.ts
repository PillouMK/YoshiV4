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

export type MapMK_V2 = {
  id: string;
  tag: string;
  name: string;
  game_id: string;
  created_at: string;
  updated_at: string;
};

export const convertToMapMKWORLD = (data: any): MapMK_V2 => ({
  id: data.id,
  tag: data.tag,
  name: data.name,
  game_id: data.game_id,
  created_at: data.created_at,
  updated_at: data.updated_at,
});
