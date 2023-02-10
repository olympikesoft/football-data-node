const Cron = require("node-cron");
const fs = require('fs').promises;
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
    Cron.schedule('* * * * *', async () => {
      const matches = await MatchService.getMatchNotPlayed();
      console.log(matches.length);
      const matchesReport = [];
      for (let index = 0; index < matches.length; index++) {
        console.log('enter loop');
        const match = matches[index];
        const matchObject = {
          match: {
            team_away: {
              team_players: [],
              formation: '4-4-2',
              details: {},
            },
            team_home: {
              team_players: [],
              formation: '4-4-2',
              details: {},
            },
            match_summary: { events: [] },
            score_away: 0,
            score_home: 0
          },
        };
        const teamHome = await TeamService.getTeamById(match.team_home_id);
        const teamSquadHome = await SquadService.getSquadByMatch(match.team_home_id, match.id);
        const teamAway = await TeamService.getTeamById(match.team_away_id);
        const teamSquadAway = await SquadService.getSquadByMatch(match.team_away_id, match.id);

        
        matchObject.match.team_away.details = teamAway;
        matchObject.match.team_home.details = teamHome;
        matchObject.match.team_away.team_players = teamSquadAway;
        matchObject.match.team_home.team_players = teamSquadHome;
    
        let matchReport = actions.matchSimulator(matchObject, true).then((res) => {
            console.log('res', res);
            let data = JSON.stringify(matchesReport);
            fs.writeFile('data.json', data);
        });
        matchesReport.push(matchObject);
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
