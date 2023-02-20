var knex = require("../../knex");
var moment = require('moment');

class MatchService {
  async getMatchsByTeamId(team_id) {
    let Matchs = [];
    try {
      Matchs = await knex.from("matchs")
      .select(["team.name as team_away_name", 
      "team.image_url as team_away_image_url",
      "team.id as team_away_id",
      "team2.name as team_home_name", 
      "team2.image_url as team_home_image_url",
      "team2.id as team_home_id", 
      "matchs.score_away", "matchs.score_home", "matchs.date_match", "matchs.hour_match"])
      .where({ team_away_id: team_id })
      .orWhere({team_home_id: team_id })
      .leftJoin("team", "team.id", "matchs.team_away_id")
      .leftJoin('team as team2', 'team2.id', 'matchs.team_home_id')
      .orderBy('matchs.date_match');
    } catch (error) {
      console.log(error);
    }
    return Matchs;
  }

  async createMatch(team_away_id, team_home_id, hour_match, date_match) {
    let isCreated = null;
    try {
      let obj = {
        team_away_id,
        team_home_id,
        hour_match,
        date_match,
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
        .insert({ minute: minute.toString(), Player_id, match_id, team_id, comment, situation })
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
    console.log(red_cards,
      goals,
      injuries,
      yellow_cards,
      rating,
      player_id,
      match_id,
      team_id)
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
