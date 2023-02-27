var MatchService = require("./MatchService");
var MatchService = new MatchService();

var TeamService = require("../Team/TeamService");
var TeamService = new TeamService();

var ManagerService = require("../Manager/ManagerService");
var ManagerService = new ManagerService();

var SquadService = require("../Squad/SquadService");
var SquadService = new SquadService();

var PlayerService = require("../Player/PlayerService");
var PlayerService = new PlayerService();

class MatchController {
  async getMatchesByCurrentTeam(req, res, next) {
    let userId = req.user.id;
    try {
      let team = await TeamService.getTeamByUser(userId);
      if (!team && team.length === 0) {
        return res.status(404).json({ Message: "No team" });
      }
      let matches = await MatchService.getMatchsByTeamId(team[0].id);

      if (matches.length > 0) {
        return res.status(200).json({ matches: matches });
      } else {
        return res.status(404).json({ Message: "No matches" });
      }
    } catch (err) {
      if (err) {
        next(err);
      }
    }
  }

  async inviteMatch(req, res, next) {
    let userId = req.user.id;
    let teamOpponentId = parseInt(req.body.teamOpponentId);
    let today = new Date();
    let tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const randomHour = `${7 + Math.floor(Math.random() * 17)}:${Math.floor(
      Math.random() * 60
    )}`;
    try {
      let team = await TeamService.getTeamByUser(userId);
      let team_away = await TeamService.getTeamById(teamOpponentId);
      if (!team && team.length === 0) {
        return res.status(404).json({ Message: "No team" });
      }
      if (!team_away && team_away.length === 0) {
        return res.status(404).json({ Message: "No team" });
      }

      let insertMatch = await MatchService.createMatch(
        team[0].id,
        team_away[0].id,
        randomHour,
        tomorrow
      );
      if (insertMatch) {
        // update squad for team away
        await SquadService.updateSquadCreatedAutomatic(
          team_away[0].id,
          insertMatch
        );

        // update squad for team home
        await SquadService.updateSquadCreatedAutomatic(team[0].id, insertMatch);

        return res.status(200).json({ insertMatch: insertMatch });
      } else {
        return res.status(200).json({ Message: "No Match create" });
      }
    } catch (err) {
      if (err) {
        next(err);
      }
    }
  }

  async getMatch(req, res, next) {
    let match_id = req.param("match_id");
    try {
      let match = await MatchService.getMatch(match_id);
      if (!match) {
        return res.status(404).json({ Message: "No match" });
      }

      let object = {
        match: {
          team_away: {
            team_players: [],
          },
          team_home: {
            team_players: [],
          },
          content: {},
          match_summary: { events: [] },
        },
      };

      object.match.content = match;

      const players_home = await SquadService.getSquadByMatch(
        match["team_home_id"],
        match["id"]
      );

      object.match.team_home.team_players = players_home;

      const players_away = await SquadService.getSquadByMatch(
        match["team_away_id"],
        match["id"]
      );

      object.match.team_away.team_players = players_away;

      let matchSummary = await MatchService.getMatchReport(match["id"]);
      matchSummary.sort((a, b) => {
        const minuteA = parseInt(parseFloat(a.minute) * 100);
        const minuteB = parseInt(parseFloat(b.minute) * 100);
        if (minuteA < minuteB) {
          return -1;
        }
        if (minuteA > minuteB) {
          return 1;
        }
        return 0;
      });
      object.match.match_summary = matchSummary;

      return res.status(200).json({ match: object });
    } catch (error) {
      console.log("error", error);
      return res.status(501).json({ error: error });
    }
  }
}

module.exports = MatchController;
