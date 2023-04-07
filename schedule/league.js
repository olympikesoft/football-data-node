const Cron = require("node-cron");
const knex = require("../knex");
const functions = require("../utils/functions");

module.exports = () => {
  Cron.schedule("0 * * * *", async () => {
    const leagues = await knex("league")
      .select("*")
      .where("active", 1)
      .andWhereRaw("teams_reached = teams_limit");

      console.log(leagues);

    for (const league of leagues) {
      console.log(league.id);

      const teams = await knex("team_has_league")
        .where("league_id", league.id)
        .select("*");

      const roundMatches = functions.generateSchedule(
        teams.map((el) => el.team_id)
      );

      const matchesToInsert = [];

      for (const round of roundMatches) {
        for (const match of round) {
          const matchDate = new Date(match.date);
          const dateOnly = matchDate.toISOString().split("T")[0]; // format: 'YYYY-MM-DD'
          matchesToInsert.push({
            round: match.round,
            team_home_id: match.home_team,
            team_away_id: match.away_team,
            date_game: dateOnly,
            league_id: league.id,
          });
        }
      }

      try {
        await knex.transaction(async (trx) => {
          const batchSize = 1000;
          for (let i = 0; i < matchesToInsert.length; i += batchSize) {
            const batch = matchesToInsert.slice(i, i + batchSize);
            await trx("matchs").insert(batch);
          }
        });
        console.log("Matches created for league:", league.id);
      } catch (error) {
        console.log("Error creating matches for league:", league.id, error);
      }

      const round1Date = roundMatches[0][0].date;
      const lastMatch = roundMatches[roundMatches.length - 1];
      const lastDate = lastMatch.date;

      // Update the league's rounds_completed and teams_reached fields
      try {
        await knex("league")
          .where("id", league.id)
          .update({
            active: 2,
            date_start: new Date(round1Date),
            date_end: new Date(lastDate),
          });
        console.log("League updated:", league.id);
      } catch (error) {
        console.log("Error updating league:", league.id, error);
      }
    }
  });
};
