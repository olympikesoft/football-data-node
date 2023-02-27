var MatchService = require("../Match/MatchService");
var MatchService = new MatchService();

var TeamService = require("../Team/TeamService");
var TeamService = new TeamService();

var ManagerService = require("../Manager/ManagerService");
var ManagerService = new ManagerService();

var SquadService = require("../Squad/SquadService");
var SquadService = new SquadService();

var PlayerService = require("../Player/PlayerService");
var PlayerService = new PlayerService();

var RankingService = require("../Ranking/RankingService");
var RankingService = new RankingService();

class RankingController {
  async getRankingWin(req, res, next) {
    try {
      let ranking = await RankingService.getRankingTeamWin();
      if (ranking.length > 0) {
        return res.status(200).json({ ranking: ranking });
      } else {
        return res.status(404).json({ Message: "No ranking" });
      }
    } catch (error) {
        console.log('error', error)
      return res.status(501).json({ error: error });
    }
  }

  async getRankingPlayerScored(req, res, next) {
    try {
      let ranking = await RankingService.getRankingPlayerScore();
      if (ranking.length > 0) {
        return res.status(200).json({ ranking: ranking });
      } else {
        return res.status(404).json({ Message: "No ranking" });
      }
    } catch (error) {
        console.log('error', error)
      return res.status(501).json({ error: error });
    }
  }
}

module.exports = RankingController;
