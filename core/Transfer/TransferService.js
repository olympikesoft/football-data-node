var knex = require("../../knex");

class TransferService {
  /***
   *
   * Get Players to buy not to sell;
   * Exclude team_id seller;
   *
   */
  async GetTransfers(team_id) {
    let players = [];

    try {
      let q = await knex
        .select([
          "transfers.id",
          "position.name as position_name",
          "transfers.price",
          "player.id as player_id",
          "player.*",
        ])
        .from("transfers")
        .whereNot("transfers.seller_team_id", team_id)
        .whereNull("buy_team_id")
        .where("transfers.status", "1")
        .leftJoin("player", "player.id", "transfers.player_id")
        .leftJoin("team", "team.id", "transfers.seller_team_id")
        .leftJoin("team_has_player", function () {
          this.on("team_has_player.player_id", "player.id").on(
            "team_has_player.team_id",
            "team.id"
          );
        })
        .leftJoin("position", "position.id", "player.position_id");

      if (q) {
        players = q;
      }
    } catch (error) {
      console.log(error);
    }
    return players;
  }

  async GetTransfersId(id, team_id) {
    let players = [];

    try {
      let q = await knex
        .select([
          "transfers.id",
          "position.name as position_name",
          "transfers.price",
          "player.id as player_id",
          "player.*",
        ])
        .from("transfers")
        .where("transfers.id", id)
        .whereNot("transfers.seller_team_id", team_id)
        .whereNull("buy_team_id")
        .where("transfers.status", "1")
        .leftJoin("player", "player.id", "transfers.player_id")
        .leftJoin("team", "team.id", "transfers.seller_team_id")
        .leftJoin("team_has_player", function () {
          this.on("team_has_player.player_id", "player.id").on(
            "team_has_player.team_id",
            "team.id"
          );
        })
        .leftJoin("position", "position.id", "player.position_id");

      if (q) {
        players = q;
      }
    } catch (error) {
      console.log(error);
    }
    return players;
  }

  async GetTransfersExcludingPlayers(team_id, players_ids, position_id) {
    let players = [];
    let q = null;
    try {
      if (parseInt(position_id) > 0) {
        q = await knex
          .select([
            "transfers.id as transfer_id",
            "position.name as position_name",
            "transfers.price",
            "player.id as player_id",
            "player.*",
          ])
          .from("transfers")
          .whereNot("transfers.seller_team_id", team_id)
          .whereNull("buy_team_id")
          .where("transfers.status", "1")
          .where("position.id", parseInt(position_id))
          .whereNotIn("player.id", players_ids)
          .leftJoin("player", "player.id", "transfers.player_id")
          .leftJoin("team", "team.id", "transfers.seller_team_id")
          .leftJoin("team_has_player", function () {
            this.on("team_has_player.player_id", "player.id").on(
              "team_has_player.team_id",
              "team.id"
            );
          })
          .leftJoin("position", "position.id", "player.position_id");
      } else {
        q = await knex
          .select([
            "transfers.id as transfer_id",
            "position.name as position_name",
            "transfers.price",
            "player.id as player_id",
            "player.*",
          ])
          .from("transfers")
          .whereNot("transfers.seller_team_id", team_id)
          .whereNull("buy_team_id")
          .where("transfers.status", "1")
          .whereNotIn("player.id", players_ids)
          .leftJoin("player", "player.id", "transfers.player_id")
          .leftJoin("team", "team.id", "transfers.seller_team_id")
          .leftJoin("team_has_player", function () {
            this.on("team_has_player.player_id", "player.id").on(
              "team_has_player.team_id",
              "team.id"
            );
          })
          .leftJoin("position", "position.id", "player.position_id");
      }

      if (q) {
        players = q;
      }
    } catch (error) {
      console.log(error);
    }
    return players;
  }

  async GetTransfersbyPlayerOnSale(id) {
    let market = [];

    try {
      let q = await knex
        .select([
          "transfers.id",
          "transfers.price",
          "player.id as player_id",
          "transfers.seller_team_id",
          "team.id as team_id",
          "player.*",
          "position.name as position_name",
          "country.name as country_name",
        ])
        .from("transfers")
        .where("player.id", id)
        .where("transfers.status", "1")
        .leftJoin("team", "team.id", "transfers.seller_team_id")
        .leftJoin("player", "player.id", "transfers.player_id")
        .leftJoin("team_has_player", function () {
          this.on("team_has_player.player_id", "player.id").on(
            "team_has_player.team_id",
            "team.id"
          );
        })
        .leftJoin("position", "position.id", "player.Position_id")
        .leftJoin("country", "country.id", "player.Country_id");
      // .toSQL();

      if (q) {
        market = q;
      }
    } catch (error) {
      console.log(error);
    }
    return market;
  }

  async GetTransfersbyIdOnSale(id) {
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
        .where("transfers.id", id)
        .where("transfers.status", "1")
        .leftJoin("team", "team.id", "transfers.seller_team_id")
        .leftJoin("player", "player.id", "transfers.player_id")
        .leftJoin("team_has_player", function () {
          this.on("team_has_player.player_id", "player.id").on(
            "team_has_player.team_id",
            "team.id"
          );
        });
      // .toSQL();

      console.log(q);

      if (q) {
        market = q;
      }
    } catch (error) {
      console.log(error);
    }
    return market;
  }

  async SellerTeamByBot(seller_team_id, player_id, player_cost) {
    let haveSelled = false;

    let object = {
      status: 1,
      seller_team_id: seller_team_id,
      player_id: player_id,
      isBot: 1,
      price: player_cost,
    };
    try {
      await knex
        .from("transfers")
        .insert(object)
        .then((res) => {
          if (res) {
            haveSelled = true;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
    return haveSelled;
  }

  async SellerTeamPlayer(seller_team_id, player_id, player_cost) {
    let haveSelled = false;

    let object = {
      status: 1,
      seller_team_id: seller_team_id,
      player_id: player_id,
      price: player_cost,
    };
    try {
      await knex
        .from("transfers")
        .insert(object)
        .then((res) => {
          if (res) {
            haveSelled = true;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
    return haveSelled;
  }

  async BuyPlayerToTeam(id, buy_team_id) {
    let haveBuyUpdated = false;
    let now = new Date();

    let object = { date_buy: now, buy_team_id: buy_team_id, status: 2 };

    try {
      await knex
        .from("transfers")
        .where("transfers.id", id)
        .update(object)
        .then((res) => {
          if (res) {
            haveBuyUpdated = true;
          }
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (error) {
      console.log(error);
    }
    return haveBuyUpdated;
  }
}

module.exports = TransferService;
