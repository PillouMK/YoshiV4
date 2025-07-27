import { MapStatsCreate } from "./map-stats.dto";

export type MatchCreated = {
  id: number;
  opponent: string;
  score_team: number;
  score_opponent: number;
  pena_team: number;
  pena_opponent: number;
  status: string;
  coef: number;
  message_result_id: string | null;
  table_url: string | null;
  roster_id: string | null;
  team_id: string;
  game_id: string;
  created_at: Date;
  updated_at: Date;
};

export type MatchCreate = {
  opponent: string;
  team_id: string;
  roster_id?: string;
  game_id: string;
};

export type MatchComplete = {
  score_team: number;
  score_opponent: number;
  pena_team: number;
  pena_opponent: number;
  score_total: number;
  is_canceled: boolean;
  maps: MapStatsCreate[];
};

export type MatchPreview = {
  title?: string;
  theme?: string;
  own_team: MatchUser[];
  opponent_team: MatchOpponent[];
};

export type MatchPublish = {
  own_team: MatchUser[];
  message_id: string;
  table_url: string;
};

export type MatchUser = {
  user_id: string;
  score: number;
  number_race?: number;
};

export type MatchOpponent = {
  name: string;
  score: number;
  flag?: string;
  number_race?: number;
};
