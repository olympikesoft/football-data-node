var actions = require("./actions");

const matchSimulator = (matches, play) => {
  return new Promise((resolve, reject) => {
    let matchTime = actions.getMinutesToPlay();
    let match = matches["match"];

    let home_team = match.team_home;
    let away_team = match.team_away;

    match.match_summary.score_away = 0;
    match.match_summary.score_home = 0;
    let match_summary = match.match_summary;

    let team_away_move = false;
    let team_home_move = false;

    const timerID = setInterval(function () {
      if (matchTime <= 91) {
        // select team to execute
        const [attackingTeam, defendingTeam] = actions.selectTeam(
          home_team,
          away_team
        );

        const randomTeamMove = Math.random();

        if (randomTeamMove < 0.5) {
          team_home_move = true;
          team_away_move = false;
        } else {
          team_away_move = true;
          team_home_move = false;
        }

        const eventValue = actions.genRandomValue(100) + 1;

        if (eventValue > 20 && eventValue <= 23) {
          // Random (Striker, Midfielder) vs. Goalkeeper > RandTheirAttack vs. RandGoalkeeper
          console.log(
            "Random (Striker, Midfielder) vs. Goalkeeper > RandTheirAttack vs. RandGoalkeeper"
          );
          actions.increaseValues(
            actions.genRandomValue(3),
            attackingTeam["team_players"],
            "attack_capacity",
            ["midfielder", "striker"]
          );
          actions.increaseValues(
            actions.genRandomValue(3),
            attackingTeam["team_players"],
            "skills_capacity",
            ["midfielder", "striker"]
          );
          actions.reduceValues(
            actions.genRandomValue(10),
            defendingTeam["team_players"],
            "deffense_capacity",
            ["midfielder", "defender", "goalkeeper"]
          );
          actions.goalChance(
            attackingTeam,
            defendingTeam,
            matchTime,
            team_home_move,
            team_away_move
          );
          match_summary.score_away = actions.getScoreFromTeam(
            away_team.team_players
          );
          match_summary.score_home = actions.getScoreFromTeam(
            home_team.team_players
          );
          match_summary.events = actions.getEvents();
        } else if (eventValue % 31 === 0) {
          console.log("Goal Chance");

          actions.reduceValues(
            actions.genRandomValue(4),
            attackingTeam["team_players"],
            "deffense_capacity",
            ["midfielder", "defender", "goalkeeper"]
          );
          actions.reduceValues(
            actions.genRandomValue(4),
            attackingTeam["team_players"],
            "attack_capacity",
            ["midfielder", "defender", "goalkeeper"]
          );
          actions.increaseValues(
            actions.genRandomValue(4),
            defendingTeam["team_players"],
            "attack_capacity",
            ["midfielder", "striker"]
          );
          actions.goalChance(
            attackingTeam,
            defendingTeam,
            matchTime,
            team_home_move,
            team_away_move
          );

          match_summary.score_away = actions.getScoreFromTeam(
            away_team.team_players
          );
          match_summary.score_home = actions.getScoreFromTeam(
            home_team.team_players
          );
          match_summary.events = actions.getEvents();
        } else if (eventValue % 42 === 0) {
          console.log("Penalti chance");

          actions.reduceValues(
            actions.genRandomValue(5),
            defendingTeam["team_players"],
            "deffense_capacity",
            ["midfielder", "defender", "goalkeeper"]
          );
          actions.handlePenalty(
            attackingTeam,
            defendingTeam,
            matchTime,
            team_home_move,
            team_away_move
          );

          match_summary.score_away = actions.getScoreFromTeam(
            away_team.team_players
          );
          match_summary.score_home = actions.getScoreFromTeam(
            home_team.team_players
          );
          match_summary.events = actions.getEvents();
          /*} else if (eventValue > 50 && eventValue <= 55) {
          console.log("redcard");
          actions.straightRed(defendingTeam, matchTime);
          actions.increaseValues(
            20,
            attackingTeam["team_players"],
            "deffense_capacity",
            ["striker", "midfielder", "defender", "goalkeeper"]
          );
          actions.reduceValues(
            20,
            attackingTeam["team_players"],
            "attack_capacity",
            ["striker", "midfielder", "defender", "goalkeeper"]
          );
          actions.reduceValues(
            20,
            attackingTeam["team_players"],
            "skills_capacity",
            ["striker", "midfielder", "defender", "goalkeeper"]
          );

          match_summary.events = actions.getEvents();*/
        } else if (eventValue % 60 === 0) {
          actions.increaseValues(
            2,
            attackingTeam["team_players"],
            "attack_capacity",
            ["midfielder", "striker"]
          );
          actions.increaseValues(
            2,
            defendingTeam["team_players"],
            "attack_capacity",
            ["midfielder", "striker"]
          );
          actions.handleFreekick(
            attackingTeam,
            defendingTeam,
            matchTime,
            team_home_move,
            team_away_move
          );
          match_summary.score_away = actions.getScoreFromTeam(
            away_team.team_players
          );
          match_summary.score_home = actions.getScoreFromTeam(
            home_team.team_players
          );
          match_summary.events = actions.getEvents();
          /*} else if (eventValue > 0 && eventValue <= 20) {
          console.log("handleDiscipline");
          actions.handleDiscipline(attackingTeam, defendingTeam, matchTime);
          actions.increaseValues(
            20,
            defendingTeam["team_players"],
            "deffense_capacity",
            ["striker", "midfielder", "defender", "goalkeeper"]
          );
          actions.reduceValues(
            10,
            attackingTeam["team_players"],
            "attack_capacity",
            ["striker", "midfielder", "defender", "goalkeeper"]
          );
          actions.reduceValues(
            10,
            attackingTeam["team_players"],
            "skills_capacity",
            ["striker", "midfielder", "defender", "goalkeeper"]
          );

          match_summary.events = actions.getEvents();
        } else if (eventValue > 70 && eventValue <= 85) {
          console.log("handleInjury");
          actions.handleInjury(attackingTeam, matchTime);
          actions.reduceValues(
            3,
            defendingTeam["team_players"],
            "skills_capacity",
            ["striker", "midfielder", "defender", "goalkeeper"]
          );

          match_summary.events = actions.getEvents();*/
        } else {
          console.log("default");
          actions.setupEvent(attackingTeam, matchTime, true);
          actions.setupEvent(defendingTeam, matchTime, false);
        }

        // reduce energy from players
        let positionForFitnessReduction = actions.randomPosition();
        actions.reduceValues(
          actions.genRandomValue(5),
          defendingTeam["team_players"],
          "stamina",
          positionForFitnessReduction
        );
        actions.increaseValues(
          actions.genRandomValue(6),
          defendingTeam["team_players"],
          "skills_capacity",
          positionForFitnessReduction
        );
        actions.reduceValues(
          actions.genRandomValue(5),
          attackingTeam["team_players"],
          "stamina",
          positionForFitnessReduction
        );
        actions.reduceValues(
          actions.genRandomValue(5),
          attackingTeam["team_players"],
          "speed_capacity",
          positionForFitnessReduction
        );
        matchTime++;
      } else {
        match_summary.score_away = actions.getScoreFromTeam(
          away_team.team_players
        );
        match_summary.score_home = actions.getScoreFromTeam(
          home_team.team_players
        );
        console.log(match_summary);
        resolve(match);
        clearInterval(timerID);
      }
    }, 5);
  });
};

module.exports = {
  matchSimulator,
};
