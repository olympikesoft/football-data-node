var knex = require("../../knex");

class PlayerService {

  async getPlayers() {
    let players = [];

    try {
      let q = (players = await knex
        .select([
          "player.*",
          "position.name as position_name",
          "country.name as country_name",
        ])
        .from("player")
        .leftJoin("position", "position.id", "player.Position_id")
        .leftJoin("country", "country.id", "player.Country_id"));

      if (q) {
        q = players;
      }
    } catch (error) {
      console.log(error);
    }
    return players;
  }

  /**
   *
   * @param {
   * get players from user_id
   * get players from team
   */
  async getPlayersfromManager(user_id) {
    let players = [];

    try {
      let q = await knex
        .select([
          "player.*",
          "position.name as position_name",
          "country.name as country_name",
        ])
        .from("team_has_player")
        .where("manager.user_id", user_id)
        .leftJoin("player", "player.id", "team_has_player.Player_id")
        .leftJoin("team", "team.id", "team_has_player.team_id")
        .leftJoin("manager", "manager.id", "team.manager_id")
        .leftJoin("position", "position.id", "player.Position_id")
        .leftJoin("country", "country.id", "player.Country_id");
        players = q;
    } catch (error) {
      console.log(error);
    }
    return players;
  }
  

  async getPlayersfromTeam(team_id) {
    let players = [];
    try {
      let q = await knex
        .select([
          "player.*",
          "position.name as position_name",
          "country.name as country_name",
          "player.id as player_id",
        ])
        .from("team_has_player")
        .where("team.id", team_id)
        .leftJoin("player", "player.id", "team_has_player.Player_id")
        .leftJoin("team", "team.id", "team_has_player.team_id")
        .leftJoin("manager", "manager.id", "team.manager_id")
        .leftJoin("position", "position.id", "player.Position_id")
        .leftJoin("country", "country.id", "player.Country_id");
      if (q != undefined) {
        for (let index = 0; index < q.length; index++) {
          players.push(q[index]);
        }
      }
    } catch (error) {
      console.log(error);
    }
    return players;
  }

  async SelectPlayerstoTeam(obj) {
    let inserted = false;
    try {
      await knex.insert(obj).then((res) => {
        if (res[0] != undefined) {
          inserted = true;
        }
      });
    } catch (error) {
      console.log(error);
    }

    return inserted;
  }

  async insertPlayer(
    name,
    date_birthday,
    image_url,
    attack_capacity,
    deffense_capacity,
    middle_capacity,
    stamina,
    speed_capacity,
    aggressivity_capacity,
    skills_capacity,
    height,
    weight_capacity,
    number,
    Position_id,
    Country_id,
    price_cost,
    price_stars,
    moral
  ) {
    let inserted = null;
    try {
      await knex
        .from("player")
        .insert({
          name: name,
          date_birthday: date_birthday,
          image_url: image_url,
          attack_capacity: attack_capacity,
          deffense_capacity: deffense_capacity,
          middle_capacity: middle_capacity,
          stamina: stamina,
          speed_capacity: speed_capacity,
          aggressivity_capacity: aggressivity_capacity,
          skills_capacity: skills_capacity,
          height: height,
          weight_capacity: weight_capacity,
          number: number,
          Position_id: Position_id,
          Country_id: Country_id,
          price_cost: price_cost,
          price_stars: price_stars,
          status: 1,
          moral: moral,
        })
        .then((res) => {
          if (res[0] != undefined) {
            inserted = res[0];
          }
        });
    } catch (error) {
      console.log(error);
    }
    console.log('inserted Player', inserted);
    return inserted;
  }

  async CheckPlayerAlreadyExist(team_id, player_id) {
    let checkExist = false;
    let CurrentYear = new Date().getFullYear();
    try {
      await knex
        .from("team_has_player")
        .where("team_has_player.team_id", team_id)
        .where("team_has_player.Player_id", player_id)
        .leftJoin("player", "player.id", "team_has_player.Player_id")
        .leftJoin("team", "team.id", "team_has_player.team_id")
        .leftJoin("position", "position.id", "player.Position_id")
        .then((res) => {
          if (res[0] != undefined) {
            checkExist = true;
          }
        });
    } catch (error) {
      console.log(error);
    }
    return checkExist;
  }

  async getPlayersManagerAndPosition(position, user_id) {
    let players = [];

    try {
      let q = await knex
        .distinct()
        .select([
          "player.id",
          "player.name",
          "player.attack_capacity",
          "player.deffense_capacity",
          "player.middle_capacity",
          "position.id as position_id",
          "position.name as position_name",
          "country.name as country_name",
        ])
        .from("team_has_player")
        .where("manager.user_id", user_id)
        .where("position.name", position)
        .leftJoin("player", "player.id", "team_has_player.Player_id")
        .leftJoin("team", "team.id", "team_has_player.team_id")
        .leftJoin("manager", "manager.id", "team.manager_id")
        .leftJoin("position", "position.id", "player.Position_id")
        .leftJoin("country", "country.id", "player.Country_id");

      if (q != undefined) {
        for (let index = 0; index < q.length; index++) {
          players.push(q[index]);
        }
      }
    } catch (error) {
      console.log(error);
    }
    return players;
  }

  async getPlayersbyId(id) {
    let players = null;
    try {
      let q = await knex
        .select(["player.*", "position.name as position"])
        .from("player")
        .where("player.id", id)
        .leftJoin("Position", "Position.id", "player.Position_id")

      if (q != null) {
        players = q[0];
      }
    } catch (error) {
      console.log(error);
    }
    return players;
  }

  async RemovePlayerFromTeam(player_id, team_id) {
    let deleted = true;
    try {
      let q = await knex
        .from("team_has_player")
        .where("team_id", team_id)
        .where("Player_id", player_id)
        .update({ status: "2" });

      if (q) {
        deleted = true;
      }
    } catch (error) {
      console.log(error);
    }
    return deleted;
  }

  async GetPlayersByIds(array_ids) {
    let players = [];

    try {
      let q = (players = await knex
        .select([
          "player.*",
          "position.name as position_name",
          "country.name as country_name",
        ])
        .from("player")
        .where("player.id", array_ids)
        .leftJoin("position", "position.id", "player.Position_id")
        .leftJoin("country", "country.id", "player.Country_id"));

      if (q) {
        q = players;
      }
    } catch (error) {
      console.log(error);
    }
    return players;
  }

  async GetPlayersPositions(name) {
    let players = [];

    try {
      let q = (players = await knex
        .select([
          "player.*",
          "position.name as position_name",
          "country.name as country_name",
        ])
        .from("player")
        .where("position.name", name)
        .leftJoin("position", "position.id", "player.Position_id")
        .leftJoin("country", "country.id", "player.Country_id"));

      if (q) {
        q = players;
      }
    } catch (error) {
      console.log(error);
    }
    return players;
  }

  async getPlayersHasTeamContentId(array_ids) {
    let players = [];

    try {
      let q = (players = await knex
        .select([
          "player.*",
          "position.name as position_name",
          "country.name as country_name",
          "team.id as team_id",
        ])
        .from("team_has_player")
        .where("player.id", array_ids)
        .leftJoin("player", "player.id", "team_has_player.Player_id")
        .leftJoin("position", "position.id", "player.Position_id")
        .leftJoin("country", "country.id", "player.Country_id")
        .leftJoin("team", "team.id", "team_has_player.team_id"));

      if (q) {
        q = players[0];
      }
    } catch (error) {
      console.log(error);
    }
    return players;
  }


  /*
   Get players without manager/team
  */
  async getPlayersHasNoTeam() {
    let currentYear = new Date().getFullYear();
    let players = [];
    try {
      let q = (players = await knex
        .select([
          "player.*",
          "position.name as position_name",
          "country.name as country_name",
          "team.id as team_id",
        ])
        .from("team_has_player")
        .whereNull("team_has_player.team_id")
        .leftJoin("player", "player.id", "team_has_player.Player_id")
        .leftJoin("position", "position.id", "player.Position_id")
        .leftJoin("country", "country.id", "player.Country_id")
        .leftJoin("team", "team.id", "team_has_player.team_id"));

      if (q) {
        q = players[0];
      }
    } catch (error) {
      console.log(error);
    }
    return players;
  }


  async checkPlayerHaveTeam(id) {
    let currentYear = new Date().getFullYear();
    let players = [];
    try {
      let q = (players = await knex
        .select([
          "player.*",
          "position.name as position_name",
          "country.name as country_name",
          "team.id as team_id",
        ])
        .from("team_has_player")
        .whereNotNull("team_has_player.team_id")
        .where('player.id', id)
        .leftJoin("player", "player.id", "team_has_player.Player_id")
        .leftJoin("position", "position.id", "player.Position_id")
        .leftJoin("country", "country.id", "player.Country_id")
        .leftJoin("team", "team.id", "team_has_player.team_id"));
      if (q) {
        q = players[0];
      }
    } catch (error) {
      console.log(error);
    }
    return players;
  }

  /*
async GetPlayerPrice(player_id){
    let players_reports = [];

    try {
       let q = await knex
        .select(['player_report.*'])
        .from('player_report')
        .where('player_report.player_id', player_id)
        .leftJoin('player', 'player.id', 'player_report.player_id')
        .leftJoin('matchs', 'matchs.id', 'player_report.match_id')
        .leftJoin('team', 'team.id', 'player_report.team_id')

        if(q){
            players_reports = q;
        }

    } catch (error) {
        console.log(error);
    }
    return players_reports;
}*/
  async GetPlayerReportTeam(player_id, team_id) {
    let players_reports = [];

    try {
      if (player_id && team_id) {
        let q = await knex
          .select(["player_report.*"])
          .from("player_report")
          .where("player_report.player_id", player_id)
          .where("player_report.team_id", team_id)
          .leftJoin("player", "player.id", "player_report.player_id")
          .leftJoin("matchs", "matchs.id", "player_report.match_id")
          .leftJoin("team", "team.id", "player_report.team_id");

        if (q) {
          players_reports = q;
        }
      }
    } catch (error) {
      console.log(error);
    }
    return players_reports;
  }

  async InsertReportPlayer(
    goals,
    red_cards,
    injuries,
    yellow_cards,
    points,
    rating,
    player_id,
    match_id,
    team_id
  ) {
    let isCreated = false;
    try {
      let obj = {
        goals: goals,
        red_cards: red_cards,
        injuries: injuries,
        yellow_cards: yellow_cards,
        points: points,
        rating: rating,
        player_id: player_id,
        match_id: match_id,
        team_id: team_id,
      };
      await knex
        .from("player_report")
        .insert(obj)
        .then((res) => {
          if (res) {
            isCreated = true;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
    return isCreated;
  }

  async GetPlayerReport(player_id, team_id) {
    let players_reports = [];

    try {
      let q = await knex
        .select(["player_report.*"])
        .from("player_report")
        .where("player_report.player_id", player_id)
        .where("team_has_player.team_id", team_id)
        .where("player_report.team_id", team_id)
        .leftJoin("player", "player.id", "player_report.player_id")
        .leftJoin("matchs", "matchs.id", "player_report.match_id")
        .leftJoin("team", "team.id", "player_report.team_id");

      if (q) {
        players_reports = q;
      }
    } catch (error) {
      console.log(error);
    }
    return players_reports;
  }

  async InsertPlayerToTeam(player_id, team_id) {
    let isAddPlayer = true;
    try {
      let obj = {
        Player_id: player_id,
        team_id: team_id,
      };
      await knex("team_has_player")
        .insert(obj)
        .then((result) => {
          if (result) {
            isAddPlayer = true;
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
    return isAddPlayer;
  }

  async SearchPlayers(
    name,
    price,
    price_min,
    price_max,
    deffense,
    deffense_min,
    deffense_max,
    attack,
    attack_min,
    attack_max,
    middle,
    middle_min,
    middle_max,
    aggressive,
    aggressive_min,
    aggresive_max,
    position_id,
    velocity,
    velocity_min,
    velocity_max,
    age,
    age_max,
    age_min
  ) {
    let players = null;
    try {
      players = await knex
        .from("player")
        .where((qb) => {
          if (name) {
            qb.where("name", "like", `%${name}%`);
          }

          if (price) {
            qb.where("price_player", ">=", price_min);
            qb.where("price_player", "<", price_max);
          }

          if (deffense) {
            qb.where("deffense_capacity", ">=", deffense_min);
            qb.where("deffense_capacity", "<", deffense_max);
          }

          if (attack) {
            qb.where("attack_capacity", ">=", attack_min);
            qb.where("attack_capacity", "<", attack_max);
          }

          if (middle) {
            qb.where("middle_capacity", ">=", middle_min);
            qb.where("middle_capacity", "<", middle_max);
          }

          if (aggressive) {
            qb.where("aggressivity_capacity", ">=", aggressive_min);
            qb.where("aggressivity_capacity", "<", aggresive_max);
          }

          if (velocity) {
            qb.where("speed_capacity", ">=", velocity_min);
            qb.where("speed_capacity", "<", velocity_max);
          }

          if (skills) {
            qb.where("skills_capacity", ">=", skills_min);
            qb.where("skills_capacity", "<", skills_max);
          }

          if (position_id) {
            qb.where("positions_id", "=", position_id);
          }

          if (age) {
            qb.where("date_birthday", ">=", age_min);
            qb.where("date_birthday", "<", age_max);
          }
        })
        .leftJoin("team", "team.id", "player.teams_id")
        .leftJoin("positions", "positions.id", "player.positions_id");
    } catch (error) {
      console.log(error);
    }
    return players;
  }

  /*players_attributes*/
  /*players_rating*/
  /* players_attributes = match_id //, product_id//, player_id, team_id, atribute = [value], date created*/
  /* get players by team and attributes
// leftJoin('player_atributes', player_atributes.player_id', 'player.id')
// leftJoin('player_atributes', player_atributes.team_id', 'team.id')
// player attributes per match = array_attributes_match.reduce( ( sum, { x } ) => sum + x , 0) per attributes 
// player_value is temporary by array_attributes_match
async updatePlayerAttributes(attributes, id){
    let isUpdated = false;
    try {
        await knex('user')
        .where('Id',object.Id)
        .update(object)
        .then((res) => {
            if(res){
                isUpdated = true;
            }
        }).catch((err)=>{
            console.log(err);
        })  
    } catch (error) {
        console.log(error);
    }
    return isUpdated;
}*/
}
module.exports = PlayerService;
