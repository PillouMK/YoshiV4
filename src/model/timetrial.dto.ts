import { User, UserCreate } from "./user.dto";

export type TimetrialUpsert = {
  user_id: string;
  map_tag: string;
  game_id: string;
  is_shroomless: boolean;
  time: number;
};

export type TimetrialCreated = {
  updated: boolean;
  old_time?: number;
  new_time: number;
  delta?: number;
  timetrial: {
    id: number;
    created_at: Date;
    updated_at: Date;
    user_id: string;
    is_shroomless: boolean;
    time: number;
    map_id: number;
  };
  user: User;
};
