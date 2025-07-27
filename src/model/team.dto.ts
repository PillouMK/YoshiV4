import { Roster } from "./roster.dto";

export type Team = {
  id: string;
  tag: string;
  name: string;
  rosters: Roster[];
};
