var knex = require("../../knex");

class LeagueService {
    
  async getLeagues() {
    let leagues = [];
    try {
      leagues = await knex.from("league").where('active', 1);
    } catch (error) {
      console.log(error);
    }
    return leagues;
  }

  async getOpenedLeagues() {
    let leagues = [];
    try {
      leagues = await knex.from("league").where('status', 'open');
    } catch (error) {
      console.log(error);
    }
    return leagues;
  }

  async getLeagueById(leagueId) {
    let leagues = [];
    try {
      leagues = await knex.from("league").where('id', leagueId);
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
      status: 'opened',
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

  async updateLeague(league_id, teams_reached, status){
    let hasUpdated = false;
    try {
      await knex
        .from("league")
        .where({ id: league_id })
        .update({
          teams_reached: teams_reached,
          active: status
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

  async getTeamLeagues(team_id, league_id){
    let teamLeagues = [];
    try {
      teamLeagues = await knex
        .select([
          "team.*",
        ])
        .from("team_has_league")
        .where('team_has_league.team_id', team_id)
        .where('team_has_league.league_id', league_id)
        .leftJoin("team", "team.id", "team_has_league.team_id")
        .leftJoin("league", "team.id", "team_has_league.league_id")
    } catch (error) {
      console.log(error);
    }
    return teamLeagues;
  }
}

module.exports = LeagueService;
