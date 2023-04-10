const Cron = require("node-cron");
const knex = require("../knex");
const functions = require("../utils/functions");
const sendEmail = require('../core/services/email/NodeMailService');
const path = require('path');

module.exports = () => {
  Cron.schedule("* * * * *", async () => {
    const leagues = await knex("league")
      .select("*")
      .where("active", 1)
      .andWhereRaw("teams_reached = teams_limit");

    for (const league of leagues) {

      const teams = await knex("team_has_league")
        .where("league_id", league.id)
        .leftJoin("team", "team.id", "team_has_league.team_id")
        .leftJoin("league", "league.id", "team_has_league.league_id")
        .select("team.*");

      const usersEmails = await knex("teams").select(["user.email", "user.name"])
      .from("team")
      .whereIn("team.id", teams.map((el) => el.id))
      .leftJoin("manager", "manager.id", "team.manager_id")
      .leftJoin("user", "user.id", "manager.user_id");

      const roundMatches = functions.generateSchedule(
        teams.map((el) => el.id)
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

      const emailPromises = usersEmails.map(async (user) => {
        const emailData = {
          round1Date: round1Date,
          lastDate: lastDate,
          teams: teams,
          roundMatches: roundMatches,
          league: league,
          user: user
        };
        const recipient = user.email;
        const subject = `🚀 Get Ready to Soar in ${league.name} - Exciting Matchups, Dates & Teams Inside!`;
        const templatePath = path.join(__dirname, '..', 'public', 'templates', 'leagueStart.ejs');
        try {
          await sendEmail(recipient, subject, templatePath, emailData);
          console.log('Email sent successfully to', recipient);
        } catch (error) {
          console.error('Failed to send email to', recipient, ':', error);
        }
      });
      
      try {
        await Promise.all(emailPromises);
        console.log('All emails sent successfully');
      } catch (error) {
        console.error('Failed to send some emails:', error);
      }
      
    }
  });
};
