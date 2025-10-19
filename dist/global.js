"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.globalData = void 0;
const yfApiController_1 = require("./controller/yfApiController");
class GlobalData {
    game_id = "MKWORLD";
    teams = new Map();
    maps = new Map();
    games = new Map();
    matchPreviews = new Map();
    members = new Map();
    TTL = 10 * 60 * 1000;
    async init(client) {
        const teams_data = await (0, yfApiController_1._getAllTeams)();
        for (const team of teams_data.data) {
            this.teams.set(team.id, team);
        }
        const games_data = await (0, yfApiController_1._getAllGame)();
        for (const game of games_data.data) {
            this.games.set(game.id, game);
            const maps_data = await (0, yfApiController_1._getAllMaps)(game.id);
            const mapForGame = new Map();
            for (const map of maps_data.data) {
                mapForGame.set(map.tag, map);
            }
            this.maps.set(game.id, mapForGame);
        }
        for (const [guildId, guild] of client.guilds.cache) {
            try {
                const fetched = await guild.members.fetch();
                this.members.set(guildId, fetched);
                console.log(`Guild ${guild.name} (${guildId}) : ${fetched.size} membres stockés`);
            }
            catch (err) {
                console.error(`Impossible de fetch les membres de la guild ${guild.name} (${guildId}) :`, err);
            }
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
    getTeam(id) {
        return this.teams.get(id);
    }
    getRoster(team_id, roster_tag) {
        return this.teams.get(team_id)?.rosters.find((r) => r.tag === roster_tag);
    }
    getAllTeams() {
        return Array.from(this.teams.values());
    }
    getMap(mapTag, game_id = this.game_id) {
        const gameMaps = this.maps.get(game_id);
        return gameMaps?.get(mapTag);
    }
    getAllMaps(game_id = this.game_id) {
        const gameMaps = this.maps.get(game_id);
        return gameMaps ? Array.from(gameMaps.values()) : [];
    }
    getGame(id) {
        return this.games.get(id);
    }
    getAllGames() {
        return Array.from(this.games.values());
    }
    addMatchPreview(id, data, table_url) {
        const expiresAt = Date.now() + this.TTL;
        this.matchPreviews.set(id, { data, expiresAt, table_url });
    }
    getMatchPreview(id) {
        const entry = this.matchPreviews.get(id);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            this.matchPreviews.delete(id);
            return null;
        }
        return entry.data;
    }
    getFullMatchPreview(id) {
        const entry = this.matchPreviews.get(id);
        if (!entry)
            return null;
        if (Date.now() > entry.expiresAt) {
            this.matchPreviews.delete(id);
            return null;
        }
        return entry;
    }
    deleteMatchPreview(id) {
        this.matchPreviews.delete(id);
    }
    getGuildMembers(guildId) {
        return this.members.get(guildId) || null;
    }
}
exports.globalData = new GlobalData();
