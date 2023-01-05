var TeamReportService = require("../Report/TeamReportService");
var TeamReportService = new TeamReportService();

var SquadService = require("../Squad/SquadService");
var SquadService = new SquadService();

var PlayerService = require("../Player/PlayerService");
var PlayerService = new PlayerService();

var TeamService = require("../Team/TeamService");
var TeamService = new TeamService();

class TeamController {
  async GetTeam(req, res, next) {
    let team_id = req.param("team_id");
    try {
      let team = await TeamService.getTeamById(team_id);
      if (!team && team.length === 0) {
        return res.status(404).json({ Message: "No team" });
      }

      let object = {
        team: {
          team_players: [],
          formation: {},
          team: {},
        },
      };

      const formation_home = await TeamReportService.getReportFromTeamById(
        team[0].id
      );

      if (formation_home) {
        object.team.formation = formation_home;
      }

      object.team.team = team;

      let players = await PlayerService.getPlayersfromTeam(team[0].id);
      object.team.players = players;

      return res.status(200).json({ team: object });
    } catch (error) {
      console.log("error", error);
    }
  }

  async GetTeamsNotSelected(req, res, next) {
    let league_id = req.param("league_id");
    try {
      let teams = await TeamService.getTeamsNotSelectedByLeague(league_id);
      if (!teams && teams.length === 0) {
        return res.status(404).json({ Message: "No team" });
      }
      return res.status(200).json({ teams: teams });
    } catch (error) {
      console.log("error", error);
    }
  }
}

module.exports = TeamController;
