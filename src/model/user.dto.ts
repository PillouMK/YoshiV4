export type UserCreate = {
  id: string;
  name: string;
  flag: string;
  roster_id?: string;
  team_id?: string;
};

export type UserBDD = {
  id: string;
  name: string;
  flag: string;
  roster_id?: string;
  team_id?: string;
  created_at: Date;
  updated_at: Date;
};

export type UserStats = {
  average: number;
  minScore: number;
  maxScore: number;
  winRate: number;
};

export type GetUser = {
  user: UserBDD;
  stats: UserStats | null;
};
