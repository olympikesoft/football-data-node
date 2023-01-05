var knex = require("../../knex");

class SeasonService {
  async getSeasonByYEAR(year) {
    let season = null;
    try {
      season = await knex.from("season").where("season.year", year);
    } catch (error) {
      console.log(error);
    }

    return season[0].id;
  }
}
module.exports = SeasonService;
