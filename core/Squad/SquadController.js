var TeamService = require("../Team/TeamService");
var TeamService = new TeamService();

var ManagerService = require("../Manager/ManagerService");
var ManagerService = new ManagerService();

var SquadService = require("../Squad/SquadService");
var SquadService = new SquadService();

var PlayerService = require("../Player/PlayerService");
var PlayerService = new PlayerService();

class SquadController {
  async generateSquad(req, res, next) {
    let user_id = req.user.id;
    let squad = {
      goalkeeper: [],
      deffender: [],
      middlefield: [],
      stricker: [],
    };

    let errors = {
      goalkeeperMissing: false,
      deffenderMissing: false,
      middlefieldMissing: false,
      strickersMissing: false,
    };

    try {
      let team = await TeamService.getTeamByUser(user_id);
      if (!team) {
        return res.status(400).json({ message: "No team finded" });
      }

      let players = await PlayerService.getPlayersfromTeam(team[0].id);

      if (!players) {
        return res.status(400).json({ message: "No players to team" });
      }

      if (players.length < 11) {
        return res.status(400).json({
          message:
            "No players enough to play the match, please buy more players",
        });
      }

      let checkHasSquad = await SquadService.getSquadDefined(team[0].id);

      if (checkHasSquad.length > 0) {
        return res.status(200).json({
          squad: checkHasSquad
            .sort((a, b) => a.position_id - b.position_id)
            .filter(function (el, i, c) {
              return i == c.indexOf(el);
            }),
          formation: "4-4-2",
        });
      } else {
        let players_goalkeeper =
          await PlayerService.getPlayersManagerAndPosition(
            "goalkeeper",
            user_id
          );

        if (players_goalkeeper.length > 0) {
          for (let index = 0; index < players_goalkeeper.length; index++) {
            let obj = {};
            if (index === 0) {
              obj.IsPlaying = 1;
            } else {
              obj.IsPlaying = 0;
            }
            obj.player = players_goalkeeper[index];
            squad.goalkeeper.push(obj);
          }
        } else {
          errors.goalkeeperMissing = true;
        }

        let players_defender = await PlayerService.getPlayersManagerAndPosition(
          "defender",
          user_id
        );

        if (players_defender.length > 0) {
          for (let index = 0; index < players_defender.length; index++) {
            let obj = {};
            if (index < 4) {
              obj.IsPlaying = 1;
            } else {
              obj.IsPlaying = 0;
            }
            obj.player = players_defender[index];
            squad.deffender.push(obj);
          }
        }

        let players_middle = await PlayerService.getPlayersManagerAndPosition(
          "midfielder",
          user_id
        );

        if (players_middle.length > 0) {
          for (let index = 0; index < players_middle.length; index++) {
            let obj = {};
            if (index < 4) {
              obj.IsPlaying = 1;
            } else {
              obj.IsPlaying = 0;
            }
            obj.player = players_middle[index];
            squad.middlefield.push(obj);
          }
        }

        let players_attack = await PlayerService.getPlayersManagerAndPosition(
          "striker",
          user_id
        );

        if (players_attack.length > 0) {
          for (let index = 0; index < players_attack.length; index++) {
            let obj = {};
            if (index < 2) {
              obj.IsPlaying = 1;
            } else {
              obj.IsPlaying = 0;
            }
            obj.player = players_attack[index];
            squad.stricker.push(obj);
          }
        }

        for (let f = 0; f < squad.goalkeeper.length; f++) {
          let define_goalkeepers = await SquadService.generateSquad(
            team[0].id,
            squad.goalkeeper[f].player.id,
            squad.goalkeeper[f].player.position_id,
            squad.goalkeeper[f].IsPlaying
          );
        }

        for (let j = 0; j < squad.deffender.length; j++) {
          let define_deffender = await SquadService.generateSquad(
            team[0].id,
            squad.deffender[j].player.id,
            squad.deffender[j].player.position_id,
            squad.deffender[j].IsPlaying
          );
        }

        for (let l = 0; l < squad.middlefield.length; l++) {
          let define_middlefield = await SquadService.generateSquad(
            team[0].id,
            squad.middlefield[l].player.id,
            squad.middlefield[l].player.position_id,
            squad.middlefield[l].IsPlaying
          );
        }

        for (let k = 0; k < squad.stricker.length; k++) {
          let define_strickers = await SquadService.generateSquad(
            team[0].id,
            squad.stricker[k].player.id,
            squad.stricker[k].player.position_id,
            squad.stricker[k].IsPlaying
          );
        }

        return res.status(200).json({ squad: squad });
      }
    } catch (err) {
      if (err) {
        next(err);
      }
    }
  }

  async getSquadTeam(req, res, next) {
    let user_id = req.user.id;
    let squad = {
      goalkeeper: [],
      deffender: [],
      middlefield: [],
      stricker: [],
    };

    let errors = {
      goalkeeperMissing: false,
      deffenderMissing: false,
      middlefieldMissing: false,
      strickersMissing: false,
    };

    try {
      let team = await TeamService.getTeamByUser(user_id);
      if (!team) {
        return res.status(400).json({ message: "No team finded" });
      }

      let players = await PlayerService.getPlayersfromTeam(team[0].id);

      if (!players) {
        return res.status(400).json({ message: "No players to team" });
      }

      if (players.length < 11) {
        return res.status(400).json({
          message:
            "No players enough to play the match, please buy more players",
        });
      }

      let checkHasSquad = await SquadService.getSquadDefined(team[0].id);

      if (checkHasSquad.length > 0) {
        return res.status(200).json({
          squad: checkHasSquad
            .sort((a, b) => a.position_id - b.position_id)
            .filter(function (el, i, c) {
              return i == c.indexOf(el);
            }),
          formation: "4-4-2",
        });
      } else {
        let players_goalkeeper =
          await PlayerService.getPlayersManagerAndPosition(
            "goalkeeper",
            user_id
          );

        if (players_goalkeeper.length > 0) {
          for (let index = 0; index < players_goalkeeper.length; index++) {
            let obj = {};
            if (index === 0) {
              obj.IsPlaying = 1;
            } else {
              obj.IsPlaying = 0;
            }
            obj.player = players_goalkeeper[index];
            squad.goalkeeper.push(obj);
          }
        } else {
          errors.goalkeeperMissing = true;
        }

        let players_defender = await PlayerService.getPlayersManagerAndPosition(
          "defender",
          user_id
        );

        if (players_defender.length > 0) {
          for (let index = 0; index < players_defender.length; index++) {
            let obj = {};
            if (index < 4) {
              obj.IsPlaying = 1;
            } else {
              obj.IsPlaying = 0;
            }
            obj.player = players_defender[index];
            squad.deffender.push(obj);
          }
        }

        let players_middle = await PlayerService.getPlayersManagerAndPosition(
          "midfielder",
          user_id
        );

        if (players_middle.length > 0) {
          for (let index = 0; index < players_middle.length; index++) {
            let obj = {};
            if (index < 4) {
              obj.IsPlaying = 1;
            } else {
              obj.IsPlaying = 0;
            }
            obj.player = players_middle[index];
            squad.middlefield.push(obj);
          }
        }

        let players_attack = await PlayerService.getPlayersManagerAndPosition(
          "striker",
          user_id
        );

        if (players_attack.length > 0) {
          for (let index = 0; index < players_attack.length; index++) {
            let obj = {};
            if (index < 2) {
              obj.IsPlaying = 1;
            } else {
              obj.IsPlaying = 0;
            }
            obj.player = players_attack[index];
            squad.stricker.push(obj);
          }
        }
        return res.status(200).json({ squad: squad });
      }
    } catch (err) {
      if (err) {
        next(err);
      }
    }
  }
}
module.exports = SquadController;
