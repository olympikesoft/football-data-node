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
  async GetMatchs(req, res, next) {
    let matches = [];
    try {
      matches = await MatchService.getMatchs();
      matches.sort(
        (a, b) => new Date(b.date_created) - new Date(a.date_created)
      );

      return res
        .status(200)
        .json({ matches: matches, matchesNumber: matches.length });
    } catch (error) {
      console.log("error", error);
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

  async GetMatch(req, res, next) {
    let match_id = req.param("match_id");
    try {
      let match = await MatchService.getMatch(match_id);
      if (!match) {
        return res.status(404).json({ Message: "No match" });
      }
      if (
        match["team_away_id"] === undefined &&
        match["team_home_id"] === undefined
      )
        return res.status(401).json({ Message: "No match started" });
      let object = {
        match: {
          team_away: {
            manager: {},
            team_players: [],
            formation: {},
            details: {},
          },
          team_home: {
            manager: {},
            team_players: [],
            formation: {},
            details: {},
          },
          match_summary: { events: [] },
        },
      };

      object.match.match_summary = match;

      const formation_home = await TeamReportService.getReportFromTeamById(
        match["team_home_id"]
      );

      if (formation_home) {
        object.match.team_home.formation = formation_home;
      }

      object.match.team_home.team = "team_home";
      object.match.team_home.details.id = match["team_home_id"];

      const players_home = await SquadService.getSquadByMatch(
        match["team_home_id"],
        match["id"]
      );

      if (players_home.length > 0) {
        for (let k = 0; k < players_home.length; k++) {
          const player = await PlayerService.getPlayersbyId(
            players_home[k]["player_id"]
          );
          if (players_home[k]["isplaying"] === 1) {
            player.isplaying = 1;
            player.rating = 5;
          } else {
            player.rating = 0;
            player.isplaying = 0;
          }
          player.red_card = 0;
          player.yellow_card = 0;
          player.goals_scored = 0;
          player.goals_score_array = [];
          object.match.team_home.team_players.push(player);
        }
      }

      const formation_away = await TeamReportService.getReportFromTeamById(
        match["team_away_id"]
      );

      if (formation_away) {
        object.match.team_away.formation = formation_away;
      }

      object.match.team_away.team = "team_away";
      object.match.team_away.details.id = match["team_away_id"];

      const players_away = await SquadService.getSquadByMatch(
        match["team_away_id"],
        match["id"]
      );

      if (players_away.length > 0) {
        for (let k = 0; k < players_away.length; k++) {
          const player = await PlayerService.getPlayersbyId(
            players_away[k]["player_id"]
          );
          if (players_away[k]["isplaying"] === 1) {
            player.isplaying = 1;
            player.rating = 5;
          } else {
            player.rating = 0;
            player.isplaying = 0;
          }
          player.goals_scored = 0;
          player.goals_score_array = [];
          player.red_card = 0;
          player.yellow_card = 0;

          object.match.team_away.team_players.push(player);
        }
      }
      return res.status(200).json({ match: object });
    } catch (error) {
      console.log("error", error);
    }
  }
}

module.exports = MatchController;
