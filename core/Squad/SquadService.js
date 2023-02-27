var knex = require("../../knex");

class SquadService {
  /**
   *
   * Get Squad by match ; by team and by manager_id; and season;
   * get players from squad;
   */

  async getSquadDefinedWithMatch(team_id, matchId) {
    let players = [];
    try {
      let q = await knex
        .select([
          "squad.id as squad_id",
          "player.id",
          "player.image_url as avatar",
          "player.name",
          "player.attack_capacity",
          "player.deffense_capacity",
          "player.middle_capacity",
          "position.id as position_id",
          "position.name as position_name",
          "squad.Position_id as position_id",
          "squad.Isplaying as isplaying",
        ])
        .from("squad")
        .where("squad.match_id", matchId)
        .where("squad.team_id", team_id)
        .leftJoin("position", "position.id", "squad.Position_id")
        .leftJoin("team", "team.id", "squad.team_id")
        .leftJoin('matchs', 'matchs.id', 'squad.match_id')
        .leftJoin("player", "player.id", "squad.Player_id");
      if (q) {
        if (q.length > 0) {
          for (let index = 0; index < q.length; index++) {
            players.push(q[index]);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
    return players;
  }

  async getSquadDefined(team_id) {
    let players = [];
    try {
      let q = await knex
        .select([
          "squad.id as squad_id",
          "player.id",
          "player.image_url as avatar",
          "player.name",
          "player.attack_capacity",
          "player.deffense_capacity",
          "player.middle_capacity",
          "position.id as position_id",
          "position.name as position_name",
          "squad.Position_id as position_id",
          "squad.Isplaying as isplaying",
        ])
        .distinct()
        .from("squad")
        .where("squad.team_id", team_id)
        .where("squad.status", "1")
        .where("matchs.status", "2")
        .leftJoin("position", "position.id", "squad.Position_id")
        .leftJoin("player", "player.id", "squad.Player_id")
        .leftJoin("matchs", "matchs.id", "squad.match_id")
        .orderBy("player.id");
      if (q) {
        if (q.length > 0) {
          for (let index = 0; index < q.length; index++) {
            players.push(q[index]);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
    return players;
  }

  async GetPlayerSquadById(squad_id) {
    let player = null;
    let CurrentYear = new Date().getFullYear();

    try {
      let q = await knex
        .select([
          "player.id",
          "player.image_url as avatar",
          "player.name",
          "player.attack_capacity",
          "player.deffense_capacity",
          "player.middle_capacity",
          "position.id as position_id",
          "position.name as position_name",
          "squad.Position_id as position_id",
          "squad.Isplaying as isplaying",
        ])
        .from("squad")
        .where("squad.id", squad_id)
        .where("season.year", CurrentYear)
        .leftJoin("position", "position.id", "squad.Position_id")
        .leftJoin("team", "team.id", "squad.team_id")
        .leftJoin("player", "player.id", "squad.Player_id");

      if (q) {
        if (q.length > 0) {
          player = q[0];
        }
      }
    } catch (error) {
      console.log(error);
    }
    return player;
  }

  async ChangePlayerSquad(squad_id, Player_id, Isplaying) {
    let updated = false;
    try {
      await knex
        .from("squad")
        .update({ Player_id: Player_id, IsPlaying: Isplaying })
        .whereNull("squad.match_id")
        .where("squad.id", squad_id)
        .then((res) => {
          if (res) {
            updated = true;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
    return updated;
  }

  async playerIsMatchSquad(match_id, player_id) {
    let playerIsSquad = false;
    try {
      let q = await knex
        .select([
          "squad.Position_id as position_id",
          "squad.Isplaying as isplaying",
        ])
        .from("squad")
        .where("squad.match_id", match_id)
        .where("squad.Player_id", player_id)
        .leftJoin("position", "position.id", "squad.Position_id")
        .leftJoin("team", "team.id", "squad.team_id")
        .leftJoin("matchs", "matchs.id", "squad.match_id")
        .leftJoin("player", "player.id", "squad.Player_id");

      if (q) {
        if (q.length > 0) {
          playerIsSquad = true;
        }
      }
    } catch (error) {
      console.log(error);
    }
    return playerIsSquad;
  }

  async getSquadByMatch(team_id, match_id) {
    let players = [];
    try {
      let q = await knex
        .select([
          "squad.Position_id as position_id",
          "squad.Isplaying as isplaying",
          "player.*",
          "position.name as position",
        ])
        .from("squad")
        .where("squad.team_id", team_id)
        .where("squad.match_id", match_id)
        .leftJoin("position", "position.id", "squad.Position_id")
        .leftJoin("team", "team.id", "squad.team_id")
        .leftJoin("matchs", "matchs.id", "squad.match_id")
        .leftJoin("player", "player.id", "squad.Player_id");

      if (q) {
        if (q.length > 0) {
          for (let index = 0; index < q.length; index++) {
            players.push(q[index]);
          }
        }
      }
    } catch (error) {
      console.log(error);
    }
    return players;
  }

  async generateSquad(team_id, Player_id, Position_id, isPlaying) {
    let haveInserted = false;

    let object = {
      team_id: team_id,
      Player_id: Player_id,
      Position_id: Position_id,
      isPlaying: isPlaying,
      status: 1,
    };
    try {
      await knex
        .from("squad")
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

  async addSquad(match_id, team_id, Player_id, Position_id, isPlaying) {
    let haveInserted = false;

    let object = {
      match_id: match_id,
      team_id: team_id,
      Player_id: Player_id,
      Position_id: Position_id,
      isPlaying: isPlaying,
      status: 1,
    };
    try {
      await knex
        .from("squad")
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

  async updateSquadCreatedAutomatic(team_id, match_id) {
    let updated = false;
    try {
      await knex
        .from("squad")
        .update({ match_id: match_id })
        .leftJoin("position", "position.id", "squad.Position_id")
        .leftJoin("team", "team.id", "squad.team_id")
        .leftJoin("matchs", "matchs.id", "squad.match_id")
        .leftJoin("player", "player.id", "squad.Player_id")
        .where("squad.team_id", team_id)
        .where("squad.status", 1)
        .whereNull("squad.match_id")
        .then((res) => {
          if (res) {
            updated = true;
          }
        });
    } catch (error) {
      console.log(error);
    }
    return updated;
  }
}

module.exports = SquadService;
