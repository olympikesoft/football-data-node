const Cron = require("node-cron");
const fs = require("fs").promises;
var actions = require("../simulator/match/index");

var MatchService = require("../core/Match/MatchService");
var TeamService = require("../core/Team/TeamService");
var PlayerService = require("../core/Player/PlayerService");
var SquadService = require("../core/Squad/SquadService");

var TeamService = new TeamService();
var MatchService = new MatchService();
var PlayerService = new PlayerService();
var SquadService = new SquadService();

module.exports = () => {
  Cron.schedule("0 0 * * *", async () => {
    const matches = await MatchService.getMatchNotSquadPlayed();
    for (const match of matches) {
      const { id, team_home_id, team_away_id } = match;
      const teams = [team_home_id, team_away_id];

      for (const teamId of teams) {
        const squad = {
          goalkeeper: [],
          deffender: [],
          middlefield: [],
          stricker: [],
        };

        const players_goalkeeper =
          await PlayerService.getPlayersTeamAndPosition("goalkeeper", teamId);

        squad.goalkeeper = players_goalkeeper.map((player, index) => ({
          IsPlaying: index === 0 ? 1 : 0,
          player,
        }));

        const players_defender = await PlayerService.getPlayersTeamAndPosition(
          "defender",
          teamId
        );

        squad.deffender = players_defender.map((player, index) => ({
          IsPlaying: index < 4 ? 1 : 0,
          player,
        }));

        const players_middle = await PlayerService.getPlayersTeamAndPosition(
          "midfielder",
          teamId
        );

        squad.middlefield = players_middle.map((player, index) => ({
          IsPlaying: index < 4 ? 1 : 0,
          player,
        }));

        const players_attack = await PlayerService.getPlayersTeamAndPosition(
          "striker",
          teamId
        );

        squad.stricker = players_attack.map((player, index) => ({
          IsPlaying: index < 2 ? 1 : 0,
          player,
        }));

        const squadTasks = [
          ...squad.goalkeeper.map((player) =>
            SquadService.generateSquad(
              id,
              teamId,
              player.player.id,
              player.player.position_id,
              player.IsPlaying
            )
          ),
          ...squad.deffender.map((player) =>
            SquadService.generateSquad(
              id,
              teamId,
              player.player.id,
              player.player.position_id,
              player.IsPlaying
            )
          ),
          ...squad.middlefield.map((player) =>
            SquadService.generateSquad(
              id,
              teamId,
              player.player.id,
              player.player.position_id,
              player.IsPlaying
            )
          ),
          ...squad.stricker.map((player) =>
            SquadService.generateSquad(
              id,
              teamId,
              player.player.id,
              player.player.position_id,
              player.IsPlaying
            )
          ),
        ];

        await Promise.all(squadTasks);
      }

      await MatchService.updateSquadInfo(id, 1, 1);
    }
  });
};
