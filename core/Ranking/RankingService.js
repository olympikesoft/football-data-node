var knex = require("../../knex");

class RankingService {
  async getRankingTeamWin() {
    let rankings = [];
    try {
      rankings = await knex
        .from("matchs")
        .select(
          "team.id",
          "team.image_url",
          "team.name",
          knex.raw("COUNT(*) AS wins")
        )
        .from(function () {
          this.select("team_home_id AS team_id", "score_home", "score_away")
            .from("matchs")
            .unionAll(function () {
              this.select(
                "team_away_id AS team_id",
                "score_away",
                "score_home"
              ).from("matchs");
            })
            .as("subquery");
        })
        .where("score_home", ">", "score_away")
        .join("team", "team.id", "=", "subquery.team_id")
        .groupBy("team.id")
        .orderBy("wins", "desc");
    } catch (error) {
      console.log("error", error);
    }
    return rankings;
  }

  async getRankingPlayerScore() {
    let rankings = [];
    try {
      rankings = await knex
        .select(
          "player.id as player_id",
          "player.name",
          knex.raw("SUM(player_report.goals) as goals_scored")
        )
        .from("player_report")
        .leftJoin("player", "player.id", "=", "player_report.player_id")
        .groupBy("player_id")
        .orderBy("goals_scored", "desc");
    } catch (error) {
      console.log("error", error);
    }
    return rankings;
  }
}

module.exports = RankingService;
