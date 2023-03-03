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

  async getTeamsExceptUserTeam(team_id) {
    let teams = null;
    try {
      teams = await knex.from("team").whereNot("team.id", team_id);
    } catch (error) {
      console.log("error", error);
    }
    return teams;
  }

  async getTeam(name) {
    let team = null;
    try {
      team = await knex.from("team").where("name", name);
    } catch (error) {
      console.log("error", error);
    }
    return team;
  }

  async createTeam(
    name,
    manager_id,
    description,
    formationId,
    image_url,
    colorHome,
    colorAway
  ) {
    let teamCreated = null;
    try {
      await knex("team")
        .insert({
          name,
          manager_id,
          description,
          formationId,
          image_url,
          //colorHome,
          //colorAway
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
    }
    return teamCreated;
  }

  async getTeamByUser(user_id) {
    let team = [];
    try {
      team = await knex
        .select(["team.*"])
        .from("team")
        .where("manager.user_id", user_id)
        .leftJoin("manager", "manager.id", "team.manager_id")
        .leftJoin("user", "user.id", "manager.user_id");
    } catch (error) {
      console.log(error);
    }
    return team;
  }

  async getUserByTeam(team_id) {
    let user = [];
    try {
      user = await knex
        .select(["user.id", "user.money_game"])
        .from("team")
        .where("team.id", team_id)
        .leftJoin("manager", "manager.id", "team.manager_id")
        .leftJoin("user", "user.id", "manager.user_id");
    } catch (error) {
      console.log(error);
    }
    return user;
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
