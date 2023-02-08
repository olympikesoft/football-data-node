const { faker } = require("@faker-js/faker");

var SquadService = require("../Squad/SquadService");
var SquadService = new SquadService();

var ManagerService = require("../Manager/ManagerService");
var ManagerService = new ManagerService();

var PlayerService = require("../Player/PlayerService");
var PlayerService = new PlayerService();

var TeamService = require("../Team/TeamService");
var TeamService = new TeamService();

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

  async createTeam(req, res, next) {
    const name = req.body.name;
    const userId = req.user.id;
    const description = req.body.description;
    const formationId = req.body.formationId;

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
        description,
        formationId
      );

      // if teamCreated create random players base on formation    
      if (newTeam) {

        // 1 goalkeeper
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

        await PlayerService.InsertPlayerToTeam(goalKeeper, newTeam);
        // 4 defenders

        for (let index = 0; index < 4; index++) {
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
          await PlayerService.InsertPlayerToTeam(deffender, newTeam);
        }

        // 4 middlefield


        for (let index = 0; index < 4; index++) {
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
          await PlayerService.InsertPlayerToTeam(middlefield, newTeam);
        }
     
        for (let index = 0; index < 2; index++) {
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
          await PlayerService.InsertPlayerToTeam(stricker, newTeam);
        }
        return res.status(200).json({ newTeam: newTeam });
      }
    } catch (err) {
      if (err) {
        next(err);
      }
    }
  }
}

module.exports = TeamController;
