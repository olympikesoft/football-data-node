var LeagueService = require('./LeagueService')
var LeagueService = new LeagueService();

class LeagueController {

    async GetLeagues(req, res, next) {
        let leagues = [];
        try {
            leagues = await LeagueService.getLeagues();

            if (leagues.length > 0) {
                res.status(200).json({ 'leagues': leagues, 'leagues_number': leagues.length })
            } else {
                res.status(400).json({ 'message': 'Not found' })
            }

        } catch (error) {
            console.log(error);
            Sentry.captureException(error);
        }
    }
}

module.exports = LeagueController; 