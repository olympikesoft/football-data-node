var knex = require("../../knex");

class MatchService {
  async getMatchs() {
    let Matchs = [];
    try {
      Matchs = await knex.from("matchs");
    } catch (error) {
      console.log(error);
    }
    return Matchs;
  }

  async createMatch(
    team_away_id,
    team_home_id,
    hour_match,
    date_match,
  ) {
    let isCreated = null;
    try {
      let obj = {
        team_away_id,
        team_home_id,
        hour_match,
        date_match
      };
      await knex
        .from("matchs")
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

  async getMatch(id) {
    let match = null;
    try {
      let q = await knex.from("matchs").where("id", id);

      if (q) {
        match = q[0];
      }
    } catch (error) {
      console.log(error);
    }
    return match;
  }

  async getMatchNotPlayed() {
    let match = null;
    try {
      let q = await knex.from("matchs").where("status", 0);
      if (q) {
        match = q;
      }
    } catch (error) {
      console.log(error);
    }
    return match;
  }
}

module.exports = MatchService;
