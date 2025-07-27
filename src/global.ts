import {
  _getAllGame,
  _getAllMaps,
  _getAllTeams,
} from "./controller/yfApiController";
import { Game } from "./model/game.dto";
import { MapMK_V2 } from "./model/map.dto";
import { MatchPreview } from "./model/match.dto";
import { ResponseAPI } from "./model/responseYF";
import { Roster } from "./model/roster.dto";
import { Team } from "./model/team.dto";

class GlobalData {
  private game_id: string = "MKWORLD";
  public teams: Map<string, Team> = new Map();
  public maps: Map<string, Map<string, MapMK_V2>> = new Map();
  public games: Map<string, Game> = new Map();
  private matchPreviews: Map<
    string,
    { data: MatchPreview; expiresAt: number; table_url: string }
  > = new Map();

  private readonly TTL = 10 * 60 * 1000;

  async init(): Promise<void> {
    const teams_data: ResponseAPI<Team[]> = await _getAllTeams();
    for (const team of teams_data.data) {
      this.teams.set(team.id, team);
    }

    const games_data: ResponseAPI<Game[]> = await _getAllGame();

    for (const game of games_data.data) {
      this.games.set(game.id, game);

      const maps_data: ResponseAPI<MapMK_V2[]> = await _getAllMaps(game.id);
      const mapForGame = new Map<string, MapMK_V2>();

      for (const map of maps_data.data) {
        mapForGame.set(map.tag, map);
      }

      this.maps.set(game.id, mapForGame);
    }

    setInterval(() => {
      const now = Date.now();
      for (const [key, value] of this.matchPreviews) {
        if (value.expiresAt < now) {
          this.matchPreviews.delete(key);
        }
      }
    }, 60 * 1000);
  }

  getTeam(id: string): Team | undefined {
    return this.teams.get(id);
  }

  getRoster(team_id: string, roster_tag: string): Roster | undefined {
    return this.teams.get(team_id)?.rosters.find((r) => r.tag === roster_tag);
  }

  getAllTeams(): Team[] {
    return Array.from(this.teams.values());
  }

  getMap(mapTag: string, game_id: string = this.game_id): MapMK_V2 | undefined {
    const gameMaps = this.maps.get(game_id);
    return gameMaps?.get(mapTag);
  }

  getAllMaps(game_id: string = this.game_id): MapMK_V2[] {
    const gameMaps = this.maps.get(game_id);
    return gameMaps ? Array.from(gameMaps.values()) : [];
  }

  getGame(id: string): Game | undefined {
    return this.games.get(id);
  }

  getAllGames(): Game[] {
    return Array.from(this.games.values());
  }

  addMatchPreview(id: string, data: MatchPreview, table_url: string) {
    const expiresAt = Date.now() + this.TTL;
    this.matchPreviews.set(id, { data, expiresAt, table_url });
  }

  getMatchPreview(id: string): MatchPreview | null {
    const entry = this.matchPreviews.get(id);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.matchPreviews.delete(id);
      return null;
    }

    return entry.data;
  }

  getFullMatchPreview(
    id: string
  ): { data: MatchPreview; expiresAt: number; table_url: string } | null {
    const entry = this.matchPreviews.get(id);
    if (!entry) return null;

    if (Date.now() > entry.expiresAt) {
      this.matchPreviews.delete(id);
      return null;
    }

    return entry;
  }

  deleteMatchPreview(id: string): void {
    this.matchPreviews.delete(id);
  }
}

export const globalData = new GlobalData();
