var knex = require("../../knex");

var LeagueService = require("./LeagueService");
var LeagueService = new LeagueService();

class LeagueController {
  async getLeagues(req, res, next) {
    let leagues = [];
    try {
      // return list of leagues that not reached
      leagues = await LeagueService.getLeagues();
      if (leagues.length > 0) {
        return res.status(200).json({ leagues: leagues });
      } else {
        res.status(400).json({ message: "Not found" });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async getLeagueStand(req, res, next) {
    let leagueId = req.query.leagueId
    let round = req.query.round;
    try {
      const homeResults = await knex
        .from("matchs")
        .leftJoin(
          "team as home_team",
          "home_team.id",
          "=",
          "matchs.team_home_id"
        )
        .leftJoin(
          "team as away_team",
          "away_team.id",
          "=",
          "matchs.team_away_id"
        )
        .where("matchs.league_id", leagueId)
        .where("matchs.round", round)
        .select(
          "home_team.id as team_id",
          "home_team.name as team_name",
          knex.raw("COUNT(*) as total_matches"),
          knex.raw(
            "SUM(CASE WHEN matchs.team_home_id = home_team.id AND matchs.score_home > matchs.score_away THEN 1 WHEN matchs.team_away_id = home_team.id AND matchs.score_away > matchs.score_home THEN 1 ELSE 0 END) as wins"
          ),
          knex.raw(
            "SUM(CASE WHEN matchs.team_home_id = home_team.id AND matchs.score_home < matchs.score_away THEN 1 WHEN matchs.team_away_id = home_team.id AND matchs.score_away < matchs.score_home THEN 1 ELSE 0 END) as losses"
          ),
          knex.raw(
            "SUM(CASE WHEN matchs.team_home_id = home_team.id AND matchs.score_home = matchs.score_away THEN 1 WHEN matchs.team_away_id = home_team.id AND matchs.score_away = matchs.score_home THEN 1 ELSE 0 END) as draws"
          ),
          knex.raw(
            "SUM(CASE WHEN matchs.team_home_id = home_team.id THEN matchs.score_home ELSE matchs.score_away END) as goals_for"
          ),
          knex.raw(
            "SUM(CASE WHEN matchs.team_home_id = home_team.id THEN matchs.score_away ELSE matchs.score_home END) as goals_against"
          ),
          knex.raw(`
      SUM(CASE
        WHEN matchs.team_home_id = home_team.id AND matchs.score_home > matchs.score_away THEN 3
        WHEN matchs.team_home_id = home_team.id AND matchs.score_home = matchs.score_away THEN 1
        ELSE 0
      END) +
      SUM(CASE
        WHEN matchs.team_away_id = home_team.id AND matchs.score_away > matchs.score_home THEN 3
        WHEN matchs.team_away_id = home_team.id AND matchs.score_home = matchs.score_away THEN 1
        ELSE 0
      END) as points`)
        )
        .groupBy("home_team.id")
        .orderBy("points", "desc")
        .orderBy("goals_for", "desc")
        .orderBy("team_name", "asc");

      const awayResults = await knex
        .from("matchs")
        .leftJoin(
          "team as home_team",
          "home_team.id",
          "=",
          "matchs.team_home_id"
        )
        .leftJoin(
          "team as away_team",
          "away_team.id",
          "=",
          "matchs.team_away_id"
        )
        .where("matchs.league_id", leagueId)
        .where("matchs.round", round)
        .select(
          "away_team.id as team_id",
          "away_team.name as team_name",
          knex.raw("COUNT(*) as total_matches"),
          knex.raw(
            "SUM(CASE WHEN matchs.team_home_id = away_team.id AND matchs.score_home > matchs.score_away THEN 1 WHEN matchs.team_away_id = away_team.id AND matchs.score_away > matchs.score_home THEN 1 ELSE 0 END) as wins"
          ),
          knex.raw(
            "SUM(CASE WHEN matchs.team_home_id = away_team.id AND matchs.score_home < matchs.score_away THEN 1 WHEN matchs.team_away_id = away_team.id AND matchs.score_away < matchs.score_home THEN 1 ELSE 0 END) as losses"
          ),
          knex.raw(
            "SUM(CASE WHEN matchs.team_home_id = away_team.id AND matchs.score_home = matchs.score_away THEN 1 WHEN matchs.team_away_id = away_team.id AND matchs.score_away = matchs.score_home THEN 1 ELSE 0 END) as draws"
          ),
          knex.raw(
            "SUM(CASE WHEN matchs.team_home_id = away_team.id THEN matchs.score_away ELSE matchs.score_home END) as goals_for"
          ),
          knex.raw(
            "SUM(CASE WHEN matchs.team_home_id = away_team.id THEN matchs.score_home ELSE matchs.score_home END) as goals_against"
          ),
          knex.raw(
            "SUM(CASE WHEN matchs.team_home_id = home_team.id AND matchs.score_home < matchs.score_away THEN 3 WHEN matchs.team_away_id = home_team.id AND matchs.score_away < matchs.score_home THEN 3 WHEN matchs.team_home_id = home_team.id AND matchs.score_home = matchs.score_away THEN 1 WHEN matchs.team_away_id = home_team.id AND matchs.score_away = matchs.score_home THEN 1 ELSE 0 END) + SUM(CASE WHEN matchs.team_home_id = away_team.id AND matchs.score_home > matchs.score_away THEN 3 WHEN matchs.team_away_id = away_team.id AND matchs.score_away > matchs.score_home THEN 3 WHEN matchs.team_home_id = away_team.id AND matchs.score_home = matchs.score_away THEN 1 WHEN matchs.team_away_id = away_team.id AND matchs.score_away = matchs.score_home THEN 1 ELSE 0 END) as points"
          )
        )
        .groupBy("away_team.id")
        .orderBy("points", "desc")
        .orderBy("goals_for", "desc")
        .orderBy("team_name", "asc");

      // Merge home and away results into a single array
      const results = [...homeResults, ...awayResults];

      // Group results by team ID and aggregate statistics
      const standings = results.reduce((standings, result) => {
        const teamId = result.team_id;
        const teamName = result.team_name;
        const totalMatches =
          (standings[teamId]?.totalMatches ?? 0) + result.total_matches;
        const wins = (standings[teamId]?.wins ?? 0) + result.wins;
        const losses = (standings[teamId]?.losses ?? 0) + result.losses;
        const draws = (standings[teamId]?.draws ?? 0) + result.draws;
        const goalsFor = (standings[teamId]?.goalsFor ?? 0) + result.goals_for;
        const goalsAgainst =
          (standings[teamId]?.goalsAgainst ?? 0) + result.goals_against;
        const points = (standings[teamId]?.points ?? 0) + result.points;

        standings[teamId] = {
          teamId,
          teamName,
          totalMatches,
          wins,
          losses,
          draws,
          goalsFor,
          goalsAgainst,
          goalDifference: goalsFor - goalsAgainst,
          points,
        };

        return standings;
      }, {});

      // Convert standings object to array and sort by points, goal difference, and goals for
      const sortedStandings = Object.values(standings).sort((a, b) => {
        if (a.points !== b.points) {
          return b.points - a.points;
        }

        if (a.goalDifference !== b.goalDifference) {
          return b.goalDifference - a.goalDifference;
        }

        return b.goalsFor - a.goalsFor;
      });

      return res.status(200).json({ stands: sortedStandings });
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = LeagueController;
