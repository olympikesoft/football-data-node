var knex = require('../../knex');

class LeagueService {
    async getLeagues() {
        let leagues = [];
    try {
        leagues = await knex
            .from('league')

    } catch (error) {
        console.log(error);
    }
    return leagues;
  }
}

module.exports = LeagueService; 
