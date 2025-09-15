import { Roster } from "./roster.dto";

export type Team = {
  id: string;
  tag: string;
  name: string;
  result_channel_id: string;
  rosters: Roster[];
};
