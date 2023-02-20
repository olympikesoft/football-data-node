var knex = require("../../knex");

class TransactionService {
  async transactionsOverall(teamId) {
    let transactions = [];
    try {
        transactions = await knex
        .select(knex.raw('DATE(date_buy) AS date'))
        .select(knex.raw('SUM(CASE WHEN seller_team_id = ? THEN -price ELSE price END) AS amount', [teamId]))
        .from('transfers')
        .where('seller_team_id', '=', teamId)
        .orWhere('buy_team_id', '=', teamId)
        .groupBy('date');
    } catch (error) {
      console.log(error);
    }
    return transactions;
  }

  async getTeamSells(id) {
    let market = [];
    try {
      let q = await knex
        .select([
          "transfers.id",
          "transfers.price",
          "player.id as player_id",
          "transfers.seller_team_id",
        ])
        .from("transfers")
        .where("transfers.seller_team_id", id)
        .leftJoin("team", "team.id", "transfers.seller_team_id")
        .leftJoin("team as team2", "team2.id", "transfers.buy_team_id")
        .leftJoin("player", "player.id", "transfers.player_id")
        .leftJoin("team_has_player", function () {
          this.on("team_has_player.player_id", "player.id").on(
            "team_has_player.team_id",
            "team.id"
          );
        });
      if (q) {
        market = q;
      }
    } catch (error) {
      console.log(error);
    }
    return market;
  }

  async getTeamBuys(id) {
    let market = [];
    try {
      let q = await knex
        .select([
          "transfers.id",
          "transfers.price",
          "player.id as player_id",
          "transfers.seller_team_id",
        ])
        .from("transfers")
        .where("transfers.buy_team_id", id)
        .leftJoin("team", "team.id", "transfers.seller_team_id")
        .leftJoin("team as team2", "team2.id", "transfers.buy_team_id")
        .leftJoin("player", "player.id", "transfers.player_id")
        .leftJoin("team_has_player", function () {
          this.on("team_has_player.player_id", "player.id").on(
            "team_has_player.team_id",
            "team.id"
          );
        });
      if (q) {
        market = q;
      }
    } catch (error) {
      console.log(error);
    }
    return market;
  }
}

module.exports = TransactionService;
