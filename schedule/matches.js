const Cron = require("node-cron");
const fs = require("fs").promises;
var actions = require("../simulator/match/index");

var MatchService = require("../core/Match/MatchService");
var TeamService = require("../core/Team/TeamService");
var PlayerService = require("../core/Player/PlayerService");
var SquadService = require("../core/Squad/SquadService");

var TeamService = new TeamService();
var MatchService = new MatchService();
var PlayerService = new PlayerService();
var SquadService = new SquadService();

module.exports = () => {
  Cron.schedule("* * * * *", async () => {
    const matches = await MatchService.getMatchNotPlayed();
    for (let index = 0; index < matches.length; index++) {
      const match = matches[index];
      const matchObject = {
        match: {
          team_away: {
            team_players: [],
            formation: "4-4-2",
            details: {},
          },
          team_home: {
            team_players: [],
            formation: "4-4-2",
            details: {},
          },
          match_summary: { events: [] },
          score_away: 0,
          score_home: 0,
        },
      };
      const teamHome = await TeamService.getTeamById(match.team_home_id);
      const teamSquadHome = await SquadService.getSquadByMatch(
        match.team_home_id,
        match.id
      );
      const teamAway = await TeamService.getTeamById(match.team_away_id);
      const teamSquadAway = await SquadService.getSquadByMatch(
        match.team_away_id,
        match.id
      );

      matchObject.match.team_away.details = teamAway;
      matchObject.match.team_home.details = teamHome;
      matchObject.match.team_away.team_players = teamSquadAway;
      matchObject.match.team_home.team_players = teamSquadHome;

      let simulate = await actions.matchSimulator(matchObject, true);

      let data = JSON.stringify(matchObject.match);

      let scoreHome = matchObject.match.match_summary.events.filter(
        (el) => el.situation === "goal" && el.team.id === teamHome.id
      ).length;
      let scoreAway = matchObject.match.match_summary.events.filter(
        (el) => el.situation === "goal" && el.team.id === teamAway.id
      ).length;

      let updateMatch = await MatchService.updateMatchResultById(
        match.id,
        scoreHome,
        scoreAway
      );

      for (let j = 0; j < matchObject.match.match_summary.events.length; j++) {
        let event = matchObject.match.match_summary.events[j];
        await MatchService.createMatchReport(
          event.minute,
          event.player.id,
          match.id,
          event.team.id,
          event.event,
          event.situation
        );
      }

      let teamAwayEvents = matchObject.match.match_summary.events.filter( el => el.team.id === teamAway.id && el.situation === 'goal');

      for (let j = 0; j < teamAwayEvents.length; j++) {
        let playerEvents = teamAwayEvents[j].filter(el => el.player.id);
        await MatchService.createMatchPlayerReport(
          0,
          player_events_away[j].goals_scored,
          0,
          player_events_away[j].yellow_card,
          player_events_away[j].rating,
          match.id,
          matches_details[0].away_team_id
        );
      }

      /*for (let j = 0; j < player_events_home.length; j++) {
        await MatchService.CreateMatchPlayerReport(
          player_events_home[j].red_card,
          player_events_home[j].goals_scored,
          0,
          player_events_home[j].yellow_card,
          player_events_home[j].rating,
          parseInt(player_events_home[j].id),
          value.match_summary[0].id,
          matches_details[0].home_team_id
        );
      }*/
      fs.writeFile("data.json", data);

      matchObject = null;
    }

    /*const data = JSON.stringify(matchesReport);
      try {
        await fs.writeFile('matchesReport.json', data);
        console.log('File matchesReport.json written successfully.');
      } catch (err) {
        console.error('An error occurred while writing to file matchesReport.json:', err);
      }*/
  });
};
