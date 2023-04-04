const { faker } = require("@faker-js/faker");
const fileType = require("file-type");

var SquadService = require("../Squad/SquadService");
var SquadService = new SquadService();

var ManagerService = require("../Manager/ManagerService");
var ManagerService = new ManagerService();

var PlayerService = require("../Player/PlayerService");
var PlayerService = new PlayerService();

var TeamService = require("../Team/TeamService");
var TeamService = new TeamService();

var MatchService = require("../Match/MatchService");
var MatchService = new MatchService();

var LeagueService = require("../League/LeagueService");
var LeagueService = new LeagueService();

class TeamController {
  async getTeam(req, res, next) {
    let userId = req.user.id;
    try {
      let team = await TeamService.getTeamByUser(userId);
      if (!team && team.length === 0) {
        return res.status(404).json({ Message: "No team" });
      }
      return res.status(200).json({ team: team });
    } catch (err) {
      if (err) {
        next(err);
      }
    }
  }

  async linkTeamLeague(req, res, next) {
    const userId = req.user.id;
    const leagueId = req.body.leagueId;

    try {
      let checkTeam = await TeamService.getTeamByUser(userId);

      if (checkTeam.length === 0) {
        throw new Error("Dont have team, please create!");
      }

      let league = await LeagueService.getLeagueById(leagueId);

      if (league.length === 0) {
        throw new Error("League not exist!");
      }

      if (league[0].active > 1) {
        throw new Error("League closed!");
      }

      if (league[0].teams_reached === league[0].teams_limit) {
        throw new Error("League closed!");
      }

      let teamHasAlreadyLeagues = await LeagueService.getTeamLeagues(checkTeam[0].id);
      if (teamHasAlreadyLeagues.length > 0 ){
        if (teamHasAlreadyLeagues[0].active === 1) {
          throw new Error("Team cannot link to another league if league not finished!");
        }
      }

      let checkExistAlreadyOnLeague = await LeagueService.getTeamandLeagues(
        checkTeam[0].id,
        leagueId
      );

      if (checkExistAlreadyOnLeague.length > 0) {
        throw new Error("Team already linked with League.");
      }

      await LeagueService.addTeamLeague(checkTeam[0].id, leagueId);
      let teamsLeague = league[0].teams_reached + 1;
      await LeagueService.updateLeague(
        leagueId,
        teamsLeague,
        teamsLeague === league[0].teams_limit ? 2 : 1
      );
      return res
        .status(200)
        .json({ message: "Team link to League", success: true });
    } catch (err) {
      if (err) {
        next(err);
      }
    }
  }

  async getTeams(req, res, next) {
    let userId = req.user.id;
    try {
      let team = await TeamService.getTeamByUser(userId);
      if (!team && team.length === 0) {
        return res.status(404).json({ Message: "No team" });
      }
      let teams = await TeamService.getTeamsExceptUserTeam(team[0].id);
      if (!teams && teams.length === 0) {
        return res.status(404).json({ Message: "No teams" });
      }
  
      const playerPositions = ["goalkeeper", "defender", "midfielder", "striker"];
  
      const getPlayersOveral = async (teamId, position) => {
        const players = await PlayerService.getPlayersfromTeamAndPosition(teamId, position);
        const overal = players.reduce((sum, player) => sum + player[`${position}_capacity`], 0);
        return Math.floor(overal / players.length);
      };
  
      const teamsWithPlayersOveral = await Promise.all(
        teams.map(async (team) => {
          const playersPromises = playerPositions.map((position) => getPlayersOveral(team.id, position));
          const [goalkeeperOveral, deffenseOveral, middleOveral, strikerOveral] = await Promise.all(playersPromises);
          return {
            ...team,
            goalkeeperOveral,
            deffenseOveral,
            MiddleOveral: middleOveral,
            StrickerOveral: strikerOveral,
          };
        })
      );
  
      return res.status(200).json({ teams: teamsWithPlayersOveral });
    } catch (err) {
      if (err) {
        next(err);
      }
    }
  }
  

  async createTeam(req, res, next) {
    const name = req.body.name;
    const userId = req.user.id;
    const formationId = 1;
    const colorHome = req.body.colorHome;
    const colorAway = req.body.colorAway;
    const image = req.file.buffer.toString('base64')

    if (req.file.size > 500000) {
      // 500 KB
      return res
        .status(400)
        .send({ message: "Image size should be less than 500 KB." });
    }

    let fileTypeIsValid = false;

    let mimeType = req.file.mimetype
    switch (mimeType) {
      case "image/png":
        fileTypeIsValid = true;
        break;
      case "image/jpeg":
        fileTypeIsValid = true;
        break;
      default:
        fileTypeIsValid = false;
        break;
    }

    if (!fileTypeIsValid) {
      return res.status(400).send({ message: "File type not supported." });
    }

    let min = 0.5;
    let max = 5.0;
    let minValue = 1000;
    let maxValue = 3000;

    let existTeam = await TeamService.getTeam(name);
    if (existTeam.length > 0) {
      throw new Error("Exist team already!");
    }
    try {
      let manager = await ManagerService.getManagerbyUserId(userId);
      let checkTeam = await TeamService.getTeamByUser(userId);
      if (checkTeam.length > 0) {
        throw new Error("Already have team!");
      }
      let newTeam = await TeamService.createTeam(
        name,
        manager.id,
        formationId,
        image,
        colorHome,
        colorAway
      );

      // if teamCreated create random players base on formation
      if (newTeam) {

        for (let index = 0; index < 2; index++) {
          let goalKeeper = await PlayerService.insertPlayer(
            faker.name.findName(undefined, undefined, "male"),
            faker.date.past(25, new Date(2005, 0, 1)),
            faker.image.imageUrl(1234, 2345),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (1.5 - 2.05) + 2.05).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            Math.random() * (1 - 999999) + 999999,
            1,
            Math.random() * (1 - 5) + 5,
            Math.random() * (minValue - maxValue) + maxValue,
            0,
            100
          );
          await PlayerService.insertPlayerToTeam(goalKeeper, newTeam);
        }

        // 4 defenders
        for (let index = 0; index < 6; index++) {
          const deffender = await PlayerService.insertPlayer(
            faker.name.findName(undefined, undefined, "male"),
            faker.date.past(25, new Date(2005, 0, 1)),
            faker.image.imageUrl(1234, 2345),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (1.5 - 2.05) + 2.05).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            Math.random() * (1 - 999999) + 999999,
            3,
            Math.random() * (1 - 5) + 5,
            Math.random() * (minValue - maxValue) + maxValue,
            0,
            100
          );
          await PlayerService.insertPlayerToTeam(deffender, newTeam);
        }

        // 4 middlefield

        for (let index = 0; index < 6; index++) {
          const middlefield = await PlayerService.insertPlayer(
            faker.name.findName(undefined, undefined, "male"),
            faker.date.past(25, new Date(2005, 0, 1)),
            faker.image.imageUrl(1234, 2345),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (1.5 - 2.05) + 2.05).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            Math.random() * (1 - 999999) + 999999,
            4,
            Math.random() * (1 - 5) + 5,
            Math.random() * (minValue - maxValue) + maxValue,
            0,
            100
          );
          await PlayerService.insertPlayerToTeam(middlefield, newTeam);
        }

        for (let index = 0; index < 4; index++) {
          const stricker = await PlayerService.insertPlayer(
            faker.name.findName(undefined, undefined, "male"),
            faker.date.past(25, new Date(2005, 0, 1)),
            faker.image.imageUrl(1234, 2345),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            (Math.random() * (1.5 - 2.05) + 2.05).toFixed(4),
            (Math.random() * (min - max) + max).toFixed(4),
            Math.random() * (1 - 999999) + 999999,
            5,
            Math.random() * (1 - 5) + 5,
            Math.random() * (minValue - maxValue) + maxValue,
            0,
            100
          );
          await PlayerService.insertPlayerToTeam(stricker, newTeam);
        }
        return res.status(200).json({ newTeam: newTeam });
      }
    } catch (err) {
      if (err) {
        console.log('err createTeam', err)
      }
    }
  }
}

module.exports = TeamController;
