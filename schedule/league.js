const Cron = require("node-cron");
var knex = require("../knex");
var functions = require("../utils/functions");

module.exports = () => {
  Cron.schedule("* * * * *", async () => {
    // Get all the leagues from the database
    const leagues = await knex("league").select("*");
    for (const league of leagues) {
      // Check if the league has reached its team limit
      if (league.teams_reached === league.teams_limit && league.active === 1) {
        // Get all the teams in the league
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
                date: match.date,
                league_id: league.id,
              });
              console.log("Match created:", match);
            } catch (error) {
              console.log("Error creating match:", error);
            }
          });
        });
        // Update the league's rounds_completed and teams_reached fields
        await knex("league").where("id", league.id).update({
          active: 2,
        });
      }
    }
  });
};
