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

      for (let index = 0; index < teams.length; index++) {
        let teamEl = teams[index];
        let matches = await MatchService.getMatchsByTeamId(teamEl.id);

        teams[index]["n_matches"] = matches.length;
        teams[index]["n_goals_scored"] = matches
          .filter(
            (match) =>
              match.team_home_id === teamEl.id ||
              match.team_away_id === teamEl.id
          )
          .reduce((totalGoals, match) => {
            if (match.team_home_id === teamEl.id) {
              return totalGoals + match.score_home;
            } else {
              return totalGoals + match.score_away;
            }
          }, 0);
        teams[index]["n_goals_conceded"] = matches
          .filter(
            (x) => x.team_away_id === teamEl.id || x.team_home_id === teamEl.id
          )
          .reduce(
            (sum, record) =>
              sum +
              (teamEl.id === record.team_away_id
                ? record.score_home
                : record.score_away),
            0
          );

        const wins = matches.filter((match) => {
          const isHomeTeam = match.team_home_id === teamEl.id;
          const isAwayTeam = match.team_away_id === teamEl.id;

          // Check if the team won the match
          if (isHomeTeam && match.score_home > match.score_away) {
            return true;
          } else if (isAwayTeam && match.score_away > match.score_home) {
            return true;
          }

          return false;
        });

        teams[index]["percentage_win"] = (wins.length / matches.length) * 100;

        let playersGoalKeeper = await PlayerService.getPlayersfromTeamAndPosition(teamEl.id, 'goalkeeper');
        let playersDeffenders = await PlayerService.getPlayersfromTeamAndPosition(teamEl.id, 'defender');
        let playersMiddlefield = await PlayerService.getPlayersfromTeamAndPosition(teamEl.id, 'midfielder');
        let playersStrickers = await PlayerService.getPlayersfromTeamAndPosition(teamEl.id, 'striker');

        let goalKeeperOveral =  playersGoalKeeper.reduce(
          (sum, record) =>
            sum + record.goalkeeper_capacity,
          0
        );

        teams[index]["goalkeeperOveral"] =  Math.floor((goalKeeperOveral / playersGoalKeeper.length));

        let deffenseOveral = playersDeffenders.reduce(
          (sum, record) =>
            sum + record.deffense_capacity,
          0
        );
        teams[index]["deffenseOveral"] = Math.floor((deffenseOveral / playersDeffenders.length));

        
        let MiddleOveral = playersMiddlefield.reduce(
          (sum, record) =>
            sum + record.middle_capacity,
          0
        );
        teams[index]["MiddleOveral"] = Math.floor((MiddleOveral / playersMiddlefield.length));

        let StrickerOveral = playersStrickers.reduce(
          (sum, record) =>
            sum + record.attack_capacity,
          0
        );
        teams[index]["StrickerOveral"] = Math.floor((StrickerOveral / playersStrickers.length));

      }
      return res.status(200).json({ teams: teams });
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
    const image = req.body.image;
    const image_url = new Buffer.from(image, "binary").toString("base64");

    if (Buffer.byteLength(image, "binary") > 500000) {
      // 500 KB
      return res
        .status(400)
        .send({ message: "Image size should be less than 500 KB." });
    }

    const type = fileType(Buffer.from(image, "binary"));
    if (
      !type ||
      !["image/jpeg", "image/png", "image/gif"].includes(type.mime)
    ) {
      return res
        .status(400)
        .send({ message: "Image type should be jpeg, png, or gif." });
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
        description,
        formationId,
        image_url
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

        await PlayerService.insertPlayerToTeam(goalKeeper, newTeam);
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
          await PlayerService.insertPlayerToTeam(deffender, newTeam);
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
          await PlayerService.insertPlayerToTeam(middlefield, newTeam);
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
          await PlayerService.insertPlayerToTeam(stricker, newTeam);
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
