var ManagerService = require("../Manager/ManagerService");
var ManagerService = new ManagerService();

var PlayerService = require("../Player/PlayerService");
var PlayerService = new PlayerService();

var TeamService = require("../Team/TeamService");
var TeamService = new TeamService();

class PlayerController {

  async getPlayersFromManager(req, res, next) {
    let userId = req.user.id;
    try {
      let team = await TeamService.getTeamByUser(userId);
      if (!team && team.length === 0) {
        return res.status(404).json({ Message: "No team" });
      }
      let players = await PlayerService.getPlayersfromManager(userId);
      console.log('players', players);
      if (players) {
        return res.status(200).json({ players: players });
      } else {
        return res.status(200).json({ Message: "No Players" });
      }
    } catch (err) {
      if (err) {
        next(err);
      }
    }
  }

  async getPlayersFromTeam(req, res, next) {
    let userId = req.params.teamId;
    try {
      let team = await TeamService.getTeamByUser(userId);
      if (!team && team.length === 0) {
        return res.status(404).json({ Message: "No team" });
      }
      let players = await PlayerService.getPlayersfromManager(userId);
      if (players) {
        return res.status(200).json({ players: players });
      } else {
        return res.status(200).json({ Message: "No Players" });
      }
    } catch (err) {
      if (err) {
        next(err);
      }
    }
  }
}

module.exports = PlayerController;
