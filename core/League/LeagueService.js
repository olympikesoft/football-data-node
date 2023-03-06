var knex = require("../../knex");

class LeagueService {
  async getLeagues() {
    let leagues = [];
    try {
      leagues = await knex.from("league").where("active", 1);
    } catch (error) {
      console.log(error);
    }
    return leagues;
  }

  async getOpenedLeagues() {
    let leagues = [];
    try {
      leagues = await knex.from("league").where("status", "open");
    } catch (error) {
      console.log(error);
    }
    return leagues;
  }

  async getLeagueById(leagueId) {
    let leagues = [];
    try {
      leagues = await knex.from("league").where("id", leagueId);
    } catch (error) {
      console.log(error);
    }
    return leagues;
  }

  async createLeague(name, url_league, number_games, number_teams) {
    let haveInserted = false;
    let object = {
      name,
      url_league,
      number_games,
      status: "opened",
      number_teams,
    };
    try {
      await knex
        .from("league")
        .insert(object)
        .then((res) => {
          if (res) {
            haveInserted = true;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
    return haveInserted;
  }

  async updateLeague(league_id, teams_reached, status) {
    let hasUpdated = false;
    try {
      await knex
        .from("league")
        .where({ id: league_id })
        .update({
          teams_reached: teams_reached,
          active: status,
        })
        .then((res) => {
          if (res) {
            hasUpdated = true;
          }
        });
    } catch (error) {
      console.log(error);
    }
    return hasUpdated;
  }

  async addTeamLeague(team_id, league_id) {
    let haveInserted = false;
    let object = {
      team_id,
      league_id,
    };
    try {
      await knex
        .from("team_has_league")
        .insert(object)
        .then((res) => {
          if (res) {
            haveInserted = true;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
    return haveInserted;
  }

  async getTeamLeagues(team_id) {
    let teamLeagues = [];
    try {
      teamLeagues = await knex
        .select(["team_has_league.league_id"])
        .from("team_has_league")
        .where("team_has_league.team_id", team_id)
        .leftJoin("team", "team.id", "team_has_league.team_id")
        .leftJoin("league", "team.id", "team_has_league.league_id");
    } catch (error) {
      console.log(error);
    }
    return teamLeagues;
  }

  async getTeamandLeagues(team_id, league_id) {
    let teamLeagues = [];
    try {
      teamLeagues = await knex
        .select(["team.*"])
        .from("team_has_league")
        .where("team_has_league.team_id", team_id)
        .where("team_has_league.league_id", league_id)
        .leftJoin("team", "team.id", "team_has_league.team_id")
        .leftJoin("league", "team.id", "team_has_league.league_id");
    } catch (error) {
      console.log(error);
    }
    return teamLeagues;
  }

  async getTeamLeaguesByLeague(league_id) {
    let teamLeagues = [];
    try {
      teamLeagues = await knex
        .select(["team.*"])
        .from("team_has_league")
        .where("team_has_league.league_id", league_id)
        .leftJoin("team", "team.id", "team_has_league.team_id")
        .leftJoin("league", "team.id", "team_has_league.league_id")
        .orderBy(".team_has_league.created_at", "desc");
    } catch (error) {
      console.log(error);
    }
    return teamLeagues;
  }

  async getLeagueStand(leagueId, nRounds) {
    const results = null;
    try {
      results = await knex
        .from("matchs")
        .join("team as home_team", "home_team.id", "=", "matchs.team_home_id")
        .join("team as away_team", "away_team.id", "=", "matchs.team_away_id")
        .where("matchs.league_id", leagueId)
        .where("matchs.round", nRounds)
        .select(
          "home_team.id as team_id",
          "home_team.name as team_name",
          knex.raw("COUNT(*) as total_matchs"),
          knex.raw(
            "SUM(CASE WHEN matchs.score_home > matchs.score_away THEN 1 ELSE 0 END) as wins"
          ),
          knex.raw(
            "SUM(CASE WHEN matchs.score_home < matchs.score_away THEN 1 ELSE 0 END) as losses"
          ),
          knex.raw(
            "SUM(CASE WHEN matchs.score_home = matchs.score_away THEN 1 ELSE 0 END) as draws"
          ),
          knex.raw("SUM(matchs.score_home) as goals_for"),
          knex.raw("SUM(matchs.score_away) as goals_against")
        )
        .groupBy("home_team.id")
        .orderBy("wins", "desc")
        .orderBy("goals_for", "desc");
    } catch (error) {

    }
    return results;
  }
}

module.exports = LeagueService;
