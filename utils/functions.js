const moment = require("moment");

const convertFloatMinutes = (value) => {
  let conversionInHours = Math.floor(value / 60) + (value % 60) / 100;
  return conversionInHours;
};

const generateSchedule = (teams) => {
  const numberOfRounds = teams.length - 1;
  const numberOfMatchesPerRound = teams.length / 2;
  const schedule = [];

  for (let round = 1; round <= numberOfRounds; round++) {
    const matches = [];

    // Assign home and away teams for each match
    const homeTeams = teams.slice(0, numberOfMatchesPerRound);
    const awayTeams = teams.slice(numberOfMatchesPerRound).reverse();

    for (let i = 0; i < numberOfMatchesPerRound; i++) {
      if (round % 2 === 0 && i === 0) {
        matches.push({
          round,
          home_team: awayTeams[i],
          away_team: homeTeams[i],
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        });
      } else {
        matches.push({
          round,
          home_team: homeTeams[i],
          away_team: awayTeams[i],
          date: new Date(
            Date.now() + round * 7 * 24 * 60 * 60 * 1000
          ).toISOString(),
        });
      }
    }

    schedule.push(matches);

    // Rotate the teams
    const lastTeam = teams.pop();
    teams.splice(1, 0, lastTeam);
  }

  return schedule;
};

module.exports = {
  convertFloatMinutes,
  generateSchedule,
};
