var knex = require("../../knex");

class TeamService {
  async getTeamById(team_id) {
    let team = null;
    try {
      team = await knex.from("team").where("id", team_id);
    } catch (error) {
      console.log("error", error);
    }
    return team;
  }

  /*
  async CreateTeamAutomatic(
    name,
    image_url,
    league_id,
    team_image_id,
    equipment_home_url,
    equipment_away_url
  ) {
    let teamCreated = null;
    try {
      await knex("team")
        .insert({
          name: name,
          image_url: image_url,
          league_id: league_id,
          team_image_id: team_image_id,
          equipment_away_url: equipment_away_url,
          equipment_home_url: equipment_home_url,
        })
        .then((result) => {
          if (result) {
            teamCreated = result[0];
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
    }
    return teamCreated;
  }*/

  /*
  async getTeamByUserId(user_id, season_id) {
    let team = [];
    try {
      team = await knex
        .select(["team.*", "team_image.name_url as image_path"])
        .from("team")
        .where("manager.user_id", user_id)
        .where("manager.season_id", season_id)
        .leftJoin("manager", "manager.id", "team.manager_id")
        .leftJoin("user", "user.id", "manager.user_id")
        .leftJoin("team_image", "team_image.id", "team.team_image_id")
        .leftJoin("league", "league.IdLeague", "team.league_id")
        .leftJoin("season", "season.id", "manager.season_id");
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
    }
    return team;
  }*/

  /*
  async getUserByTeam(team_id) {
    let user = [];
    try {
      user = await knex
        .select(["user.id", "user.money_game"])
        .from("team")
        .where("team.id", team_id)
        .leftJoin("manager", "manager.id", "team.manager_id")
        .leftJoin("user", "user.id", "manager.user_id")
        .leftJoin("team_image", "team_image.id", "team.team_image_id");
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
    }

    return user;
  }

  async getTeamsByLeague(league_id) {
    let teams = null;
    try {
      teams = await knex
        .select("team.name", "team.id", "team_image.name_url")
        .from("team")
        .where("team.league_id", league_id)
        .leftJoin("league", "league.idLeague", "team.league_id")
        .leftJoin("team_image", "team_image.id", "team.team_image_id");
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
    }
    return teams;
  }
  */

  async getTeamsNotSelectedByLeague(league_id) {
    let teams = null;
    try {
      teams = await knex
        .select("team.name", "team.id", "team_image.name_url")
        .from("team")
        .where("team.league_id", league_id)
        .whereNull("team.manager_id")
        .leftJoin("league", "league.idLeague", "team.league_id")
        .leftJoin("team_image", "team_image.id", "team.team_image_id");
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
    }
    return teams;
  }

  /*

  async getTeams() {
    let teams = null;
    try {
      teams = await knex
        .select("team.name", "team.id", "team_image.name_url")
        .from("team")
        .leftJoin("league", "league.idLeague", "team.league_id")
        .leftJoin("team_image", "team_image.id", "team.team_image_id");
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
    }
    return teams;
  }

  async CreateTeam(form) {
    let teamCreated = null;
    try {
      await knex("team")
        .insert(form)
        .then((result) => {
          if (result) {
            teamCreated = true;
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
    }
    return teamCreated;
  }

  async updateTeam(id, object) {
    let isUpdated = false;
    try {
      await knex("team")
        .where("id", id)
        .update(object)
        .then((res) => {
          if (res) {
            isUpdated = true;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
    return isUpdated;
  }

  async getTeamsIcons() {
    let team_images = [];
    try {
      team_images = await knex.from("team_image");
    } catch (error) {
      console.log(error);
      Sentry.captureException(error);
    }

    return team_images;
  }

  /*
async SearchPlayers(name, 
    price, price_min, price_max, price, 
    deffense, deffense_min, deffense_max,
    attack, attack_min, attack_max,
    middle, middle_min, middle_max, aggressive, aggressive_min, aggresive_max, position_id ) {
    let players = null;
    try {
        
        players = await knex
            .from('player')
            .where((qb) => {

                if (name) {
                  qb.where('name', 'like', `%${name}%`);
                }

                if(price){
                    qb.where('price_player','>=', price_min)
                    qb.where('price_player', '<', price_max)
                }
            
                if (deffense) {
                    qb.where('price_player','>=', deffense_min)
                    qb.where('price_player', '<', deffense_max)
                }

                if (attack) {
                    qb.where('price_player','>=', attack_min)
                    qb.where('price_player', '<', attack_max)
                }

                if (middle) {
                    qb.where('price_player','>=', middle_min)
                    qb.where('price_player', '<', middle_max)
                }

                if (aggressive) {
                    qb.where('price_player','>=', aggressive_min)
                    qb.where('price_player', '<', aggresive_max)
                }

                if(position_id){
                    qb.where('positions_id','=', position_id)
                }

            })
            .leftJoin('team', 'team.id', 'player.teams_id')
            .leftJoin('positions', 'positions.id', 'player.positions_id')

    } catch (error) {
        console.log(error);
    }
    return players;
}
*/
}
module.exports = TeamService;
