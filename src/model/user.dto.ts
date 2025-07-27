export type UserCreate = {
  id: string;
  name: string;
  flag: string;
  roster_id?: string;
  team_id?: string;
};

export type User = {
  id: string;
  name: string;
  flag: string;
  roster_id?: string;
  team_id?: string;
  created_at: Date;
  updated_at: Date;
};
