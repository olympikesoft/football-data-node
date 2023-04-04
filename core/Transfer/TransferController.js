"use strict";

var UserService = require("../User/UserService");
var UserService = new UserService();

var TeamService = require("../Team/TeamService");
var TeamService = new TeamService();

var TransferService = require("../Transfer/TransferService");
var TransferService = new TransferService();

var PlayerService = require("../Player/PlayerService");
var PlayerService = new PlayerService();

class TransfersController {
  async getTransferMarket(req, res, next) {
    let user_id = req.user.id;
    let position_id = req.body.position_id;
    try {
      let team_id = await TeamService.getTeamByUser(user_id);
      let players_from_team = await PlayerService.getPlayersfromTeam(
        team_id[0].id
      );
      let players = await TransferService.GetTransfersExcludingPlayers(
        team_id[0].id,
        players_from_team.length > 0
          ? players_from_team.map((el) => el.player_id)
          : [],
        position_id ?? ""
      );
      if (players.length > 0) {
        return res.status(200).json({ players: players });
      } else {
        return res.status(404).json({ message: "No players on market" });
      }
    } catch (err) {
      if (err) {
        next(err);
      }
    }
  }

  async buyPlayer(req, res, next) {
    let user_id = req.user.id;
    let market_id = parseInt(req.body.market_id);
    try {
      let teamUser = await TeamService.getTeamByUser(user_id);

      let market = await TransferService.GetTransfersbyIdOnSale(market_id);

      let players_from_team = await PlayerService.getPlayersfromTeam(
        teamUser[0].id
      );

      if (players_from_team.length > 0) {
        if (
          players_from_team.filter((x) => x.player_id === market[0].player_id)
            .length > 0
        ) {
          return res
            .status(200)
            .json({ message: "You cannot buy the same player" });
        }
      }

      let user_money_buy = await UserService.getInformation(user_id);

      if (parseInt(market[0].seller_team_id) === parseInt(teamUser[0].id)) {
        return res
          .status(200)
          .json({ message: "You cannot buy your own player" });
      }

      if (parseInt(teamUser[0].money_game) < parseInt(market[0].price)) {
        return res
          .status(200)
          .json({ message: "No money enough to buy the player." });
      }

      let team_seller = await TeamService.getUserByTeam(
        market[0].seller_team_id
      );

      let buy_player_operation = await TransferService.BuyPlayerToTeam(
        market_id,
        teamUser[0].id
      );
      let user_buy =
        parseInt(user_money_buy[0].money_game) - parseInt(market[0].price);
      let user_seller =
        parseInt(team_seller[0].money_game) + parseInt(market[0].price);

      let update_user_buy = await UserService.updateUser(user_id, {
        money_game: user_buy,
      });

      let update_user_seller = await UserService.updateUser(team_seller[0].id, {
        money_game: user_seller,
      });

      let delete_player = await PlayerService.RemovePlayerFromTeam(
        market[0].player_id,
        market[0].seller_team_id
      );

      let insert_player = await PlayerService.insertPlayerToTeam(
        market[0].player_id,
        teamUser[0].id
      );
      if (insert_player) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(200).json({
          message: "Error on adding player to buyer, try later",
        });
      }
    } catch (err) {
      if (err) {
        next(err);
      }
    }
  }
}
module.exports = TransfersController;
