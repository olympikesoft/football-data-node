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
}

module.exports = MatchService;
