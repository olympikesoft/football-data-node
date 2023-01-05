const Cron = require("node-cron");
const { faker } = require("@faker-js/faker");

var PlayerService = require("../core/Player/PlayerService");
var PlayerService = new PlayerService();

module.exports = () => {
  Cron.schedule("*/5 * * * *", async () => {
    let min = 0.5;
    let max = 10.0;
    let positionsId = [1, 3, 4, 5];
    let minValue = 100000;
    let maxValue = 1000000;
    let name = faker.name.findName(undefined, undefined, "male"); // we need to check the names for the faker because shows mr and mrs. first names
    let date_birthday = faker.date.past(25, new Date(2005, 0, 1));
    let image_url = faker.image.imageUrl(1234, 2345);
    let attack_capacity = (Math.random() * (min - max) + max).toFixed(4);
    let deffense_capacity = (Math.random() * (min - max) + max).toFixed(4);
    let middle_capacity = (Math.random() * (min - max) + max).toFixed(4);
    let stamina = (Math.random() * (min - max) + max).toFixed(4);
    let speed_capacity = (Math.random() * (min - max) + max).toFixed(4);
    let aggressivity_capacity = (Math.random() * (min - max) + max).toFixed(4);
    let skills_capacity = (Math.random() * (min - max) + max).toFixed(4);
    let height = (Math.random() * (1.5 - 2.05) + 2.05).toFixed(4);
    let weight_capacity = (Math.random() * (min - max) + max).toFixed(4);
    let number = Math.random() * (1 - 99) + 99;
    let Position_id =
      positionsId[Math.floor(Math.random() * positionsId.length)];
    let Country_id = Math.random() * (1 - 5) + 5;
    let price_cost = Math.random() * (minValue - maxValue) + maxValue;
    let price_stars = Math.random() * (1 - 1000) + 1000;
    let moral = 100;
    let playerId = await PlayerService.insertPlayer(
      name,
      date_birthday,
      image_url,
      attack_capacity,
      deffense_capacity,
      middle_capacity,
      stamina,
      speed_capacity,
      aggressivity_capacity,
      skills_capacity,
      height,
      weight_capacity,
      number,
      Position_id,
      Country_id,
      price_cost,
      price_stars,
      moral
    );
    await PlayerService.InsertPlayerToTeam(playerId, null, 1);
  });
};
