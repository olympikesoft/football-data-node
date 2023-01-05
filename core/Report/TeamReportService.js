var knex = require('../../knex');

class TeamReportService {
    async getReportFromTeamById(team_id){
        let CurrentYear = new Date().getFullYear();

        let team_report = null;
        try {
            let q = await knex
            .select(['formation.name', 'team_reports.*'])
            .from('team_reports')
            .where('team_reports.team_id', team_id)
            .where("season.year", CurrentYear)
            .leftJoin('formation', 'formation.id', 'team_reports.Formation_id')
            .leftJoin('team', 'team.id', 'team_reports.team_id')
            .leftJoin('season', 'season.id', 'team_reports.season_id')

            if(q){
                team_report = q[0];
            }

        } catch (error) {
            console.log(error);
        }
        return team_report;
    }
}
module.exports = TeamReportService; 
