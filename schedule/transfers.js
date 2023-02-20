const Cron = require("node-cron");

var PlayerService = require("../core/Player/PlayerService");
var PlayerService = new PlayerService();

var TransferService = require("../core/Transfer/TransferService");
var TransferService = new TransferService();

module.exports = () => {
  Cron.schedule("*/2 * * * *", async () => {
    let players = await PlayerService.getPlayersHasNoTeam();
    for (let index = 0; index < players.length; index++) {
      const element = players[index];
      let checkPlayer = await PlayerService.checkPlayerHaveTeam(element.id);
      if (!checkPlayer) {
        await PlayerService.insertPlayerToTeam(element.id, null, 1);
        await TransferService.SellerTeamPlayer(
          1,
          element.id,
          element.price_cost
        );
      }
    }
  });
};
