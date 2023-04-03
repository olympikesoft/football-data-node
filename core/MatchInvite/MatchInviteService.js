var knex = require("../../knex");

class MatchInviteService {
  async getMatchsInviteByTeamId(team_id) {
    let Matchs = [];
    try {
      Matchs = await knex.from("match_invite")
      .select(["team.name as team_away_name", 
      "team.image_url as team_away_image_url",
      "team.id as team_away_id",
      "team2.name as team_home_name", 
      "team2.image_url as team_home_image_url",
      "team2.id as team_home_id", 
      "match_invite.created_at",
      "match_invite.status",
      "match_invite.id"
    ])
      .where({ user_one_id: team_id })
      .orWhere({user_two_id: team_id })
      .leftJoin("team", "team.id", "match_invite.user_one_id")
      .leftJoin('team as team2', 'team2.id', 'match_invite.user_two_id')
      .orderBy('match_invite.created_at');
    } catch (error) {
      console.log(error);
    }
    return Matchs;
  }

  async createMatchInvite(user_one_id, user_two_id) {
    let isCreated = null;
    try {
      let obj = {
        user_one_id,
        user_two_id,
      };
      await knex
        .from("match_invite")
        .insert(obj)
        .then((res) => {
          if (res) {
            isCreated = res[0];
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

  async getMatchInviteById(id) {
    let matchInvite = null;
    await knex
    .from("match_invite")
    .select(["team.name as team_away_name", 
    "team.image_url as team_away_image_url",
    "team.id as team_away_id",
    "team2.name as team_home_name", 
    "team2.image_url as team_home_image_url",
    "team2.id as team_home_id", 
    "match_invite.created_at",
    "match_invite.status",
  ])
  .where("match_invite.id", id)
    .leftJoin("team", "team.id", "match_invite.user_one_id")
    .leftJoin('team as team2', 'team2.id', 'match_invite.user_two_id')
    .orderBy('match_invite.created_at')
    .then((res) => {
      if (res) {
        matchInvite = res;
      }
    });
    return matchInvite; 
  }

  async checkIfTeamCanAcceptInvite(team_id) {
    let canPlay = false;
    const today = new Date().toISOString().slice(0, 10); // get today's date in ISO format
    const existingInvite = await knex
      .from("match_invite")
      .select("id")
      .where((qb) => {
        qb.where({ user_one_id: team_id }).orWhere({ user_two_id: team_id });
      })
      .where({'status': '2'})
      .whereRaw(`DATE(created_at) = ?`, today)
    if (existingInvite.length === 0) {
      canPlay = true;
    }
    return canPlay; 
  }

  async updateMatchInviteById(id) {
    let hasUpdated = false;
    try {
      await knex
        .from("match_invite")
        .where({ id: id })
        .update({ status: 2 })
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

}

module.exports = MatchInviteService;
