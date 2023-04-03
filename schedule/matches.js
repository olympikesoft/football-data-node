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
  Cron.schedule("0 0 * * *", async () => {
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

      if (teamSquadAway.length < 11 || teamSquadHome.length < 11) {
        await MatchService.updateMatchResultById(
          match.id,
          0,
          0
        );
      } else {
        matchObject.match.team_away.details = teamAway;
        matchObject.match.team_home.details = teamHome;
        matchObject.match.team_away.team_players = teamSquadAway;
        matchObject.match.team_home.team_players = teamSquadHome;

        let simulate = await actions.matchSimulator(matchObject, true);
        let teamScores = {
          [teamHome[0].id]: 0,
          [teamAway[0].id]: 0,
        };

        const events = matchObject.match.match_summary.events;
        const goalsAccumulator = {};
        for (const event of events) {
          if (event.situation === "goal") {
            const scorer = event.player.id;
            if (goalsAccumulator[scorer]) {
              goalsAccumulator[scorer]++;
            } else {
              goalsAccumulator[scorer] = 1;
            }
            if (event.team[0].id === teamAway[0].id) {
              teamScores[teamAway[0].id] += 1;
            }
            if (event.team[0].id === teamHome[0].id) {
              if (event.situation === "goal") {
                teamScores[teamHome[0].id] += 1;
              }
            }
          }
        }

        await MatchService.updateMatchResultById(
          match.id,
          teamScores[teamHome[0].id],
          teamScores[teamAway[0].id]
        );

        for (let j = 0; j < events.length; j++) {
          let event = events[j];
          await MatchService.createMatchReport(
            event.minute,
            event.player.id,
            match.id,
            event.team[0].id,
            event.event,
            event.situation
          );
        }

        for (let index = 0; index < teamSquadHome.length; index++) {
          const playerId = teamSquadAway[index].id;
          const goals =
            goalsAccumulator && goalsAccumulator[playerId]
              ? goalsAccumulator[playerId]
              : 0;
          let rating = 0;
          if (goals === 0) {
            rating = 6;
          }
          if (goals === 1 && goalsAccumulator[teamAway] === goals) {
            rating == 9;
          } else {
            if (goals === 1) {
              rating = 7;
            }
            if (goals > 1) {
              rating = 9;
            }
          }
          await MatchService.createMatchPlayerReport(
            0,
            goals,
            0,
            0,
            rating,
            playerId,
            match.id,
            teamAway[0].id
          );
        }

        for (let index = 0; index < teamSquadAway.length; index++) {
          const playerId = teamSquadAway[index].id;
          const goals =
            goalsAccumulator && goalsAccumulator[playerId]
              ? goalsAccumulator[playerId]
              : 0;
          let rating = 0;
          if (goals === 0) {
            rating = 6;
          }
          if (goals === 1 && goalsAccumulator[teamAway] === goals) {
            rating == 9;
          } else {
            if (goals === 1) {
              rating = 7;
            }
            if (goals > 1) {
              rating = 9;
            }
          }

          await MatchService.createMatchPlayerReport(
            0,
            goals,
            0,
            0,
            rating,
            playerId,
            match.id,
            teamAway[0].id
          );
        }

        matchObject = null;
      }
    }
  });
};
