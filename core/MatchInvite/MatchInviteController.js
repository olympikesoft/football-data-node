var MatchInviteService = require("./MatchInviteService");
var MatchInviteService = new MatchInviteService();

var TeamService = require("../Team/TeamService");
var TeamService = new TeamService();

var ManagerService = require("../Manager/ManagerService");
var ManagerService = new ManagerService();

var SquadService = require("../Squad/SquadService");
var SquadService = new SquadService();

var PlayerService = require("../Player/PlayerService");
var PlayerService = new PlayerService();

class MatchInviteController {
  async getMatchesInviteCurrentTeam(req, res, next) {
    let userId = req.user.id;
    try {
      let team = await TeamService.getTeamByUser(userId);
      if (!team && team.length === 0) {
        return res.status(404).json({ Message: "No team" });
      }

      let matchesInvites = await MatchInviteService.getMatchsInviteByTeamId(
        team[0].id
      );

      if (matchesInvites.length > 0) {
        let result = matchesInvites.map((t) => {
          let teamDisplay =
            t.team_away_id === team[0].id
              ? {
                  teamId: t.team_home_id,
                  teamName: t.team_home_name,
                  teamImage: t.team_home_image_url,
                  status: t.status === 1 ? 'Pending': 'Approved',
                  invited: t.user_one_id === team[0].id ? 'Sended' : 'Received',
                  id: t.id,
                  date: t.created_at,
                }
              : {
                  teamId: t.team_away_id,
                  teamName: t.team_away_name,
                  teamImage: t.team_away_image_url,
                  status: t.status === 1 ? 'Pending': 'Approved',
                  invited: t.user_one_id === team[0].id ? 'Sended' : 'Received',
                  id: t.id,
                  date: t.created_at
                };
          return teamDisplay;
        });

        return res.status(200).json({ matchesInvites: result });
      } else {
        return res.status(404).json({ Message: "No matchesInvites" });
      }
    } catch (err) {
      if (err) {
        next(err);
      }
    }
  }

  async createMatchInvite(req, res, next) {
    let userId = req.user.id;
    let teamOpponentId = parseInt(req.body.teamOpponentId);
    try {
      let team = await TeamService.getTeamByUser(userId);
      let team_away = await TeamService.getTeamById(teamOpponentId);
      if (!team && team.length === 0) {
        return res.status(404).json({ Message: "No team" });
      }
      if (!team_away) {
        return res.status(404).json({ Message: "No team away" });
      }

      let insertMatchInvite = await MatchInviteService.createMatchInvite(
        team[0].id,
        team_away[0].id
      );
      if (insertMatchInvite) {
        return res.status(200).json({ insertMatchInvite: insertMatchInvite, success: true });
      } else {
        return res.status(404).json({ Message: "No Match create", success: false });
      }
    } catch (err) {
      return res.status(500).json({ Message: "No Match create", success: false });
      if (err) {
        next(err);
      }
    }
  }

  async acceptMatchInvite(req, res, next) {
    let matchInviteId = req.body.matchInviteId;
    let userId = req.user.id;
    let today = new Date();
    let tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);

    console.log('matchInviteId', matchInviteId);

    try {
      let team = await TeamService.getTeamByUser(userId);
      if (!team && team.length === 0) {
        return res.status(404).json({ Message: "No team" });
      }

      let matchInvite = await MatchInviteService.getMatchInviteById(matchInviteId);


      if(matchInvite.length === 0){
        return res.status(404).json({ Message: "No Match create", success: false });
      }

      // Only able to accept 1 match invite per day
      let checkTeamInvite = await MatchInviteService.checkIfTeamCanAcceptInvite(team[0].id);
      if(!checkTeamInvite){
        return res.status(500).json({ Message: "No able to accept match invite more than one day", success: false});
      }
      let acceptInvite = await MatchInviteService.updateMatchInviteById(matchInviteId);
      if (acceptInvite) {

        let insertMatch = await MatchService.createMatch(
          matchInvite.team_home_id,
          matchInvite.team_away_id,
          tomorrow
        );

        // create match
        return res.status(200).json({ Message: 'Match invite accepted, now you have 24 hours to prepare to the match!' , success: true });
      } else {
        return res.status(404).json({ Message: "No Match create", success: false });
      }
    } catch (err) {
      return res.status(500).json({ Message: "No Match create", success: false });
    }
  }
}

module.exports = MatchInviteController;
