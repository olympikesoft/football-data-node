const Cron = require("node-cron");
var knex = require("../knex");
var functions = require("../utils/functions");

module.exports = () => {
  Cron.schedule("0 0 * * *", async () => {
    const leagues = await knex("league").select("*");
    for (const league of leagues) {
      if (league.teams_reached === league.teams_limit && league.active === 1) {
        const teams = await knex("team_has_league")
          .where("league_id", league.id)
          .select("*");

        const roundMatches = functions.generateSchedule(
          teams.map((el) => el.team_id)
        );

        roundMatches.forEach((round) => {
          round.forEach(async (match) => {
            try {
              const result = await knex("matchs").insert({
                round: match.round,
                team_home_id: match.home_team,
                team_away_id: match.away_team,
                date_game: match.date,
                league_id: league.id,
              });
              console.log("Match created:", match);
            } catch (error) {
              console.log("Error creating match:", error);
            }
          });
        });

        const round1Date = roundMatches[0][0].date;
        const lastMatch = roundMatches[roundMatches.length - 1];
        const lastDate = lastMatch.date;

        // Update the league's rounds_completed and teams_reached fields
        await knex("league").where("id", league.id).update({
          active: 2,
          date_start: round1Date,
          date_end: lastDate,
        });
      }
    }
  });
};
