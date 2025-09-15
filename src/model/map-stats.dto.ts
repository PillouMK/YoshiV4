export type MapStatsCreate = {
  map_tag: string;
  score: number;
};

export type MapStats = {
  tag: string;
  iteration: number;
  average: number;
  weighted_average: number;
  losing_average: number;
  winning_average: number;
  win_rate: number;
  max_score: number;
  min_score: number;
  win_standard_deviation: number;
  loss_standard_deviation: number;
};

export type GetMapStats = {
  stats: MapStats[];
};

export type MapStatsParam = {
  team_id: string;
  game_id: string;
  roster_tag: string | null;
  months: number | null;
};
