var LeagueService = require("./LeagueService");
var LeagueService = new LeagueService();

class LeagueController {
  async getLeagues(req, res, next) {
    let leagues = [];
    try {
      // return list of leagues that not reached
      leagues = await LeagueService.getLeagues();
      if (leagues.length > 0) {
        return res
          .status(200)
          .json({ leagues: leagues });
      } else {
        res.status(400).json({ message: "Not found" });
      }
    } catch (error) {
      console.log(error);
    }
  }
}

module.exports = LeagueController;
