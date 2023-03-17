var knex = require("../../knex");
var moment = require("moment");

class MatchService {
  async getMatchsByTeamId(team_id) {
    let Matchs = [];
    try {
      Matchs = await knex
        .from("matchs")
        .select([
          "team.name as team_away_name",
          "team.image_url as team_away_image_url",
          "team.id as team_away_id",
          "team2.name as team_home_name",
          "team2.image_url as team_home_image_url",
          "team2.id as team_home_id",
          "matchs.score_away",
          "matchs.score_home",
          "matchs.date_match",
          "matchs.hour_match",
        ])
        .where({ team_away_id: team_id })
        .orWhere({ team_home_id: team_id })
        .leftJoin("team", "team.id", "matchs.team_away_id")
        .leftJoin("team as team2", "team2.id", "matchs.team_home_id")
        .orderBy("matchs.date_match");
    } catch (error) {
      console.log(error);
    }
    return Matchs;
  }

  async createMatch(team_away_id, team_home_id, league_id, date) {
    let isCreated = null;
    try {
      let obj = {
        team_away_id,
        team_home_id,
        date,
        league_id,
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

  async getUpCommingMatches(team_id) {
    let matches = [];
    try {
      await knex
        .select(["matchs.id as match_id", "team.id as team_home_id", "team2.id as team_away_id"])
        .from("matchs")
        .where(function () {
          this.where({ team_away_id: team_id }).orWhere({
            team_home_id: team_id,
          });
        })
        .where("matchs.date_game", ">=", knex.raw("NOW()"))
        .where(knex.raw("DATE(matchs.date_game)"), ">=", knex.raw("CURDATE()"))
        .where("matchs.status", 1)
        .leftJoin("team", "team.id", "matchs.team_away_id")
        .leftJoin("team as team2", "team2.id", "matchs.team_home_id")
        .orderBy("matchs.date_game", "desc")
        .then((res) => {
          if (res) {
            matches = res;
          }
        });
    } catch (error) {
      console.log(error);
    }
    return matches;
  }

  async getPreviousMatches(team_id) {
    let matches = [];
    try {
      await knex
        .select(["matchs.*"])
        .from("matchs")
        .where(function () {
          this.where({ team_away_id: team_id }).orWhere({
            team_home_id: team_id,
          });
        })
        .where("matchs.date_game", "<", knex.raw("NOW()"))
        .where(knex.raw("DATE(matchs.date_game)"), "<", knex.raw("CURDATE()"))
        .leftJoin("team", "team.id", "matchs.team_away_id")
        .leftJoin("team as team2", "team2.id", "matchs.team_home_id")
        .orderBy("matchs.date_game", "desc")
        .then((res) => {
          if (res) {
            matches = res;
          }
        });
    } catch (error) {
      console.log(error);
    }
    return matches;
  }

  async getMatch(id) {
    let match = null;
    try {
      let q = await knex
        .from("matchs")
        .select([
          "team.name as team_away_name",
          "team.image_url as team_away_image_url",
          "team.id as team_away_id",
          "team2.name as team_home_name",
          "team2.image_url as team_home_image_url",
          "team2.id as team_home_id",
          "matchs.score_away",
          "matchs.score_home",
          "matchs.date_match",
          "matchs.hour_match",
          "matchs.id as id",
          "matchs.matchdatetime",
        ])
        .leftJoin("team", "team.id", "matchs.team_away_id")
        .leftJoin("team as team2", "team2.id", "matchs.team_home_id")
        .where("matchs.id", id);

      if (q) {
        match = q[0];
      }
    } catch (error) {
      console.log(error);
    }
    return match;
  }

  async getMatchReport(match_id) {
    let matchSummary = [];
    try {
      await knex
        .from("match_report")
        .where("match_id", match_id)
        .orderBy("match_report.minute", "desc")
        .then((res) => {
          if (res) {
            matchSummary = res;
          }
        });
    } catch (error) {
      console.log(error);
    }
    return matchSummary;
  }

  async createMatchReport(
    minute,
    Player_id,
    match_id,
    team_id,
    comment,
    situation
  ) {
    let hasCreated = false;
    //let minutes_formated = moment().startOf('day').add(parseFloat(minute), "hours").format("mm:ss");
    try {
      await knex
        .from("match_report")
        .insert({
          minute: minute.toString(),
          Player_id,
          match_id,
          team_id,
          comment,
          situation,
        })
        .then((res) => {
          if (res) {
            hasCreated = true;
          }
        });
    } catch (error) {
      console.log(error);
    }
    return hasCreated;
  }

  async createMatchPlayerReport(
    red_cards,
    goals,
    injuries,
    yellow_cards,
    rating,
    player_id,
    match_id,
    team_id
  ) {
    let hasCreated = false;
    try {
      await knex
        .from("player_report")
        .insert({
          red_cards: red_cards,
          goals: goals,
          injuries: injuries,
          yellow_cards: yellow_cards,
          rating: rating,
          player_id: player_id,
          match_id: match_id,
          team_id: team_id,
        })
        .then((res) => {
          if (res) {
            hasCreated = true;
          }
        });
    } catch (error) {
      console.log(error);
    }
    return hasCreated;
  }

  async updateSquadInfo(id, squad_generated_home, squad_generated_away){
    let hasUpdated = false;
    try {
      await knex
        .from("matchs")
        .where({ id: id })
        .update({ squad_generated_home: squad_generated_home, squad_generated_away: squad_generated_away })
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

  // update score and update from status === 2
  async updateMatchResultById(id, score_home, score_away) {
    let hasUpdated = false;
    try {
      await knex
        .from("matchs")
        .where({ id: id })
        .update({ score_away: score_away, score_home: score_home, status: 2 })
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

  /* match not played but the squad was generated*/
  async getMatchNotPlayed() {
    let match = null;
    const currentDate = new Date().toISOString().split("T")[0];
    try {
      let q = await knex
        .from("matchs")
        .where("status", 1)
        .where("squad_generated_home", 1)
        .where("squad_generated_away", 1)
        .whereRaw(`DATE(date_game) = '${currentDate}'`);
      if (q) {
        match = q;
      }
    } catch (error) {
      console.log(error);
    }
    return match;
  }

  /* match not played but the squad was not generated*/
  async getMatchNotSquadPlayed() {
    let match = null;
    try {
      let q = await knex
        .from("matchs")
        .where("status", 1)
        .where("squad_generated_home", 0)
        .where("squad_generated_away", 0)
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
