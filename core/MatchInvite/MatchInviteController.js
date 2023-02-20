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
                }
              : {
                  teamId: t.team_away_id,
                  teamName: t.team_away_name,
                  teamImage: t.team_away_image_url,
                  status: t.status === 1 ? 'Pending': 'Approved',
                  invited: t.user_one_id === team[0].id ? 'Sended' : 'Received',
                  id: t.id,
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
      if (!team_away && team_away.length === 0) {
        return res.status(404).json({ Message: "No team away" });
      }

      let insertMatchInvite = await MatchInviteService.createMatchInvite(
        team[0].id,
        team_away[0].id
      );
      if (insertMatchInvite) {
        return res.status(200).json({ insertMatchInvite: insertMatchInvite });
      } else {
        return res.status(404).json({ Message: "No Match create" });
      }
    } catch (err) {
      if (err) {
        next(err);
      }
    }
  }
}

module.exports = MatchInviteController;
