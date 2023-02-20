"use strict";

const redCards_home = 0;
const redCard_away = 0;
const positions = ["goalkeeper", "defender", "midfielder", "striker"];
var score_home = 0;
var score_away = 0;
var events_history = [];
var functions = require("../../utils/functions");

const getEvents = () => {
  return events_history;
};

const setEvents = (event_el) => {
  let events = getEvents();
  if (event_el != undefined && events != undefined) {
    events.push(event_el);
  }
  console.log(`${event_el}`);
};

const averagePlayerValues = (string, team_players, number_redcards) => {
  let number_players = team_players.filter(
    (player) => player.isplaying === 1
  ).length;

  if (number_redcards > 0) {
    number_players = number_players - number_redcards;
  }

  const arrayOfPlayersOnField = team_players.filter(
    (player) => player.isplaying === 1
  );

  const totalValues = arrayOfPlayersOnField.reduce((total, value) => {
    const sum = total + value[string];
    return sum;
  }, 0);

  return totalValues / number_players;
};


const getScoreFromTeam = (team_players) => {
  return team_players.reduce(function (acc, obj) {
    return acc + obj.goals_scored;
  }, 0);
};

const setupEvent = (attackingTeam, matchTime, isAttacking) => {
  let randomValue = genRandomValue(100) + 1;
  if (randomValue > 2 && randomValue <= 5 && isAttacking) {
    increaseValues(3, attackingTeam["team_players"], "attack_capacity", [
      "deffender",
      "midfielder",
      "striker",
    ]);
    increaseValues(3, attackingTeam["team_players"], "skills_capacity", [
      "midfielder",
      "deffender",
      "striker",
    ]);

    const attackingPlayer = randomPlayer(attackingTeam["team_players"], true);
    /* put defense and other option after*/
    let team_attacking = attackingTeam.details;
    // '' === No player passed in
    generateCommentary("chance", attackingPlayer, matchTime, team_attacking);
  }

  reduceValues(3, attackingTeam["team_players"], "attack_capacity", [
    "striker",
    "midfielder",
    "defender",
    "goalkeeper",
  ]);
  reduceValues(3, attackingTeam["team_players"], "deffense_capacity", [
    "striker",
    "midfielder",
    "defender",
    "goalkeeper",
  ]);
};

const randomSubstitute = (position, team_players, matchTime) => {
  const arrayOfSuitablePlayers = team_players.filter(
    (player) =>
      player.position === position &&
      player.isplaying === 1 &&
      player.status !== "ejected" &&
      player.status !== "subbed-off" &&
      player.status !== "subbed-on"
  );
  const randomIndex = Math.floor(Math.random() * arrayOfSuitablePlayers.length);
  return arrayOfSuitablePlayers[randomIndex];
};

const randomPlayerByPosition = (position, team_players, sub) => {
  if (
    team_players === undefined ||
    position === undefined ||
    team_players.length === 0
  ) {
    return;
  }
  const arrayOfSuitablePlayers = team_players.filter(
    (player) =>
      player.position === position &&
      player.isplaying === 1 &&
      player.status !== sub
  );
  const randomIndex = Math.floor(Math.random() * arrayOfSuitablePlayers.length);
  return arrayOfSuitablePlayers[randomIndex];
};

const randomPlayer = (team_players, isAttacking) => {
  var arrayOfPlayersOnField = null;
  if (isAttacking) {
    arrayOfPlayersOnField = team_players.filter(
      (player) => player.isplaying === 1 && player.position != "goalkeeper"
    );
  } else {
    arrayOfPlayersOnField = team_players.filter(
      (player) => player.isplaying === 1
    );
  }
  const randomIndex = Math.floor(Math.random() * arrayOfPlayersOnField.length);
  return arrayOfPlayersOnField[randomIndex];
};

const increaseValues = (value, team_players, attribute, arrayOfPositions) => {
  const arrayOfPlayersOnField = team_players.filter(
    (player) =>
      player.isplaying === 1 && arrayOfPositions.includes(player.position)
  );
  for (var i = 0; i < arrayOfPlayersOnField.length; i++) {
    arrayOfPlayersOnField[i][attribute] += value;
  }
};

const reduceValues = (value, team_players, attribute, arrayOfPositions) => {
  if (team_players.length > 0) {
    const arrayOfPlayersOnField = team_players.filter(
      (player) =>
        player.isplaying === 1 && arrayOfPositions.includes(player.position)
    );
    for (var i = 0; i < arrayOfPlayersOnField.length; i++) {
      if (arrayOfPlayersOnField[i][attribute] > 0) {
        arrayOfPlayersOnField[i][attribute] -= value;
      }
    }
  }
};

const generateCommentary = (scenario, player, matchTime, team) => {
  const commentary = {
    goal: [
      `Goal! from ${player.name}`,
      `${player.name}  scored! `,
      `That's a great finish for ${player.name} -  `,
      `What a goal by ${player.name}  -  `,
      `${player.name} finishes off the move!  -  `,
    ],
    freekick: [
      `It's a freekick`,
      `${player.name} to take the freekick `,
      `He lines up the freekick `,
      `This is a chance to get a cross in `,
    ],
    wastedFreekick: [
      `${player.name} loses possession `,
      `That's ended up in row Z `,
      `The attack amounts to nothing `,
      `${player.name} has wasted that opportunity `,
      `${player.name}'s effort goes over the bar `,
      `He hands back possession to the other team `,
    ],
    yellow: [
      `He's going in the book`,
      `Ouch! ${player.name} will get a yellow for that`,
      `That's a booking`,
      `It's a yellow!`,
      `The ref is taking his name`,
    ],
    secondYellow: [
      `He's already been booked...`,
      `That's a second yellow`,
      `${player.name} is shown a red!`,
      `${player.name} is off`,
    ],
    straightRed: [
      `${player.name} is shown a straight red!`,
      `${player.name} is off`,
      `The ref has given him straight red!`,
    ],
    penalty: [
      `The referee points to the spot`,
      `That's a penalty`,
      `${player.name} is fouled in the area`,
      `The ref blows his whistle. Penalty.`,
    ],
    missedPenalty: [
      `Saved!`,
      `It's over the bar`,
      `${player.name} has missed it!`,
      `Oh dear! ${player.name}'s put it wide'`,
    ],
    injury: [
      `${player.name}'s is going off`,
      `${player.name} is injured`,
      `${player.name} can't continue`,
    ],
    chance: [
      `The ball is wasted`,
      `Possession is sloppily given away`,
      `That is wasted`,
      `The referee pulls back play`,
      `The ball goes out for a throw`,
      `Good interception!`,
      `He's robbed him of possesion`,
      `That was a wayward ball`,
      `He can't quite get on the end of that one`,
    ],
    nearMiss: [
      `${player.name} is limping, but he'll be okay`,
      `That's a sore one.`,
      `${player.name} looks to be struggling`,
      `There's a nasty coming together`,
      `The referee waves play on`,
    ],
  };

  if (scenario === "goal") {
    player.rating = player.rating >= 10 ? player.rating + 1.5 : 9.5;
    player.goals_scored = player.goals_scored + 1;
    player.stamina = player.stamina - 2;
    player.goals_score = [];
    player.goals_score.push({
      minute: matchTime,
      comment: commentary[scenario][0],
    });
  }

  if (scenario === "yellow") {
    player.rating = player.rating >= 1 ? player.rating - 0.5 : 1;
    player.yellow_card = player.yellow_card + 1;
  }

  if (scenario === "straightRed" || scenario === "secondYellow") {
    player.rating = 1;
    player.red_card = 1;
  }

  const randomIndex = genRandomValue(commentary[scenario].length);
  const message = {
    event: commentary[scenario][randomIndex],
    minute: matchTime,
    situation: scenario,
    player: player,
    team: team,
  };
  setEvents(message);
};

const getMinutesToPlay = () => {
  let number = Math.random(90, 95);
  return number;
};

const genRandomValue = (value) => {
  return Math.floor(Math.random() * value);
};

/*
 const move = (homeTeam, awayTeam) =>{

    //const homeBar = document.getElementById('homeBar');

    // Calculate the two teams creativity scores and covert them into a percentage out of 100 - this is for the possession bar.
    // It +/- a small low level integer to keep it moving continously
   // width = (homeTeam.averagePlayerValues('creativity') / (homeTeam.averagePlayerValues('creativity') + awayTeam.averagePlayerValues('creativity')) * 100) + (Math.random() < 0.5 ? -genRandomValue(3) : genRandomValue(3));
    //homeBar.style.width = width + '%';
}*/

const selectTeam = (homeTeam, awayTeam) => {
  let average_Team_Home_skills = averagePlayerValues(
    "skills_capacity",
    homeTeam.team_players,
    0
  );
  let average_Team_Away_skills = averagePlayerValues(
    "skills_capacity",
    awayTeam.team_players,
    0
  );

  let average_Team_Home_attack_capacity = averagePlayerValues(
    "attack_capacity",
    homeTeam.team_players,
    0
  );
  let average_Team_Away_attack_capacity = averagePlayerValues(
    "attack_capacity",
    awayTeam.team_players,
    0
  );

  let average_Team_Home_speed_capacity = averagePlayerValues(
    "speed_capacity",
    awayTeam.team_players,
    0
  );
  let average_Team_Away_speed_capacity = averagePlayerValues(
    "speed_capacity",
    awayTeam.team_players,
    0
  );

  const homeRandom =
    average_Team_Home_skills > 0
      ? genRandomValue(average_Team_Home_skills)
      : averagePlayerValues("stamina", homeTeam.team_players, 0) +
          average_Team_Home_attack_capacity >
        0
      ? genRandomValue(average_Team_Home_attack_capacity)
      : genRandomValue(average_Team_Home_speed_capacity);
  const awayRandom =
    average_Team_Away_skills > 0
      ? genRandomValue(average_Team_Away_skills)
      : averagePlayerValues("stamina", awayTeam.team_players, 0) +
          average_Team_Away_attack_capacity >
        0
      ? genRandomValue(average_Team_Away_attack_capacity)
      : genRandomValue(average_Team_Away_speed_capacity) * 3;

  if (homeRandom >= awayRandom) {
    return [homeTeam, awayTeam];
  } else {
    return [awayTeam, homeTeam];
  }
};

const goalChance = (
  attackingTeam,
  defendingTeam,
  matchTime,
  team_home_move,
  team_away_move
) => {
  const attackingPlayer = randomPlayer(
    attackingTeam["team_players"],
    true
  ); /* put defense and other option after*/
  const defendingPlayer = randomPlayerByPosition(
    "defender",
    defendingTeam["team_players"]
  );

  let team_attacking = attackingTeam.details;
  let team_deffending = defendingTeam.details;

  // console.log(
  //   ` attackingPlayer - ${attackingPlayer.attack_capacity} | defendingPlayer - ${defendingPlayer.name} | ${defendingPlayer.deffense_capacity}`
  // );

  if (
    Math.trunc(attackingPlayer.attack_capacity) >
      Math.trunc(defendingPlayer.deffense_capacity) &&
    Math.trunc(attackingPlayer.speed_capacity) >
      Math.trunc(defendingPlayer.speed_capacity) &&
    Math.trunc(attackingPlayer.stamina) > Math.trunc(defendingPlayer.stamina)
  ) {
    generateCommentary("goal", attackingPlayer, matchTime, team_attacking);
    updateScore(team_home_move, team_away_move);

    reduceValues(
      2,
      attackingTeam["team_players"],
      "speed_capacity",
      ["deffender", "stricker", "midfielder"]
    );

    reduceValues(
      2,
      attackingTeam["team_players"],
      "stamina",
      ["deffender", "stricker", "midfielder"]
    );

    reduceValues(
      2,
      defendingTeam["team_players"],
      "stamina",
      ["deffender", "stricker", "midfielder"]
    );

    // Refactor these messages - use a  which passes in player, teamObject, color and icon name
    // console.log($(`#${attackingTeam.place}Events`).append(`<i class='fa fa-futbol-o' style='color:white;' aria-hidden='true'></i> ${matchTime} mins: ${attackingPlayer.name} scored<br/>`))

    console.log(`${matchTime} mins: ${attackingPlayer.name} scored<br/>`);
  } else {
    /*home team => attackingPlayer*/
    const attackingPlayer = randomPlayerByPosition(
      "defender",
      attackingTeam["team_players"]
    );
    const defendingPlayer = randomPlayer(defendingTeam["team_players"], true);

    console.log(
      ` OPORTUNITY attackingPlayer - ${attackingPlayer.deffense_capacity} | defendingPlayer - ${defendingPlayer.name} | ${defendingPlayer.attack_capacity}`
    );

    if (
      Math.trunc(attackingPlayer.attack_capacity) >
      Math.trunc(defendingPlayer.deffense_capacity) &&
    Math.trunc(attackingPlayer.speed_capacity) >
      Math.trunc(defendingPlayer.speed_capacity) &&
    Math.trunc(attackingPlayer.stamina) > Math.trunc(defendingPlayer.stamina)
    ) {
      console.log("GOAL BY AWAY TEAM");
      generateCommentary("goal", defendingPlayer, matchTime, team_deffending);
      team_away_move = true;
      team_home_move = false;
      updateScore(team_home_move, team_away_move);

      attackingPlayer.attack_capacity += 1;
      defendingPlayer.deffense_capacity -= 1;

      reduceValues(
        2,
        attackingTeam["team_players"],
        "stamina",
        ["deffender", "stricker", "midfielder"]
      );
  
      reduceValues(
        2,
        defendingTeam["team_players"],
        "stamina",
        ["deffender", "stricker", "midfielder"]
      );

      // Refactor these messages - use a  which passes in player, teamObject, color and icon name
      // console.log($(`#${attackingTeam.place}Events`).append(`<i class='fa fa-futbol-o' style='color:white;' aria-hidden='true'></i> ${matchTime} mins: ${attackingPlayer.name} scored<br/>`))

      console.log(`${matchTime} mins: ${defendingPlayer.name} scored<br/>`);
    }else{

      reduceValues(
        1,
        attackingTeam["team_players"],
        "attack_capacity",
        ["deffender", "stricker", "midfielder"]
      );
  
      increaseValues(
        1,
        defendingTeam["team_players"],
        "deffense_capacity",
        ["deffender", "stricker", "midfielder"]
      );

      generateCommentary("chance", defendingPlayer, matchTime, team_deffending);

    }
  }
};

const handleDiscipline = (attackingTeam, defendingTeam, matchTime) => {
  // Refactor
  // ATTACKING TEAM REDUNDANT
  // teamString can be substituted for defendingTeam.place
  const defendingPlayer = randomPlayer(defendingTeam["team_players"], false);

  let team_attacking = attackingTeam.details;
  let team_deffending = defendingTeam.details;
  //console.log(defendingPlayer, 'defendingPlayer');

  // Takes match time in account, which decreases the likelihood of bookings happening earlier in the game.
  // console.log('defendingPlayer', defendingPlayer);
  if (
    genRandomValue(defendingPlayer.aggressivity_capacity) + (100 - matchTime) <
      90 &&
    defendingPlayer.status !== "ejected"
  ) {
    // Already booked? Send him off!
    if (defendingPlayer.status === "yellow") {
      // Refactor create a class or pass in as an object - one line
      reduceValues(10, defendingTeam["team_players"], "deffense_capacity", [
        "striker",
        "midfielder",
        "defender",
        "goalkeeper",
      ]);
      reduceValues(5, defendingTeam["team_players"], "attack_capacity", [
        "striker",
        "midfielder",
        "defender",
        "goalkeeper",
      ]);
      reduceValues(5, defendingTeam["team_players"], "skills_capacity", [
        "striker",
        "midfielder",
        "defender",
        "goalkeeper",
      ]);

      generateCommentary(
        "secondYellow",
        defendingPlayer,
        matchTime,
        team_deffending
      );

      // Refactor these messages - use a  which passes in player, teamObject, color and icon name
      console.log(`${matchTime} mins: ${defendingPlayer.name} sent off<br/>`);
      defendingPlayer.status = "ejected";
      defendingPlayer.isplaying = 0;
    } else {
      generateCommentary("yellow", defendingPlayer, matchTime, team_deffending);
      defendingPlayer.deffense_capacity -= 8;

      console.log(`${matchTime} mins: ${defendingPlayer.name} booked<br/>`);
      defendingPlayer.status = "yellow";
      defendingPlayer.stamina -= genRandomValue(10);
    }
  }
};

const handleInjury = (attackingTeam, matchTime) => {
  const attackingPlayer = randomPlayer(attackingTeam["team_players"], true);
  let team_attacking = attackingTeam.details;
  if (genRandomValue(101) % 40 === 0) {
    generateCommentary("injury", attackingPlayer, matchTime, team_attacking);
    console.log(`${matchTime} mins: ${attackingPlayer.name} injured<br/>`);
    // if (/*attackingTeam.place === 'away' &&*/ cpuMode) {
    attackingPlayer.isplaying = 0;
    // substitute(awayTeam, attackingPlayer);
    //const addPlayer = awayTeam.randomSubstitute(attackingPlayer.position);
    // addPlayer.isplaying = 1;
    //substitute(awayTeam, addPlayer);
    /*} else {*/
    attackingPlayer.stamina = 0 + genRandomValue(30);
    attackingPlayer.status = "injured";
    /*attackingPlayer.isplaying = 0;
  }*/
  } else {
    attackingPlayer.stamina -= genRandomValue(15);
    attackingPlayer.deffense_capacity -= genRandomValue(10);
    attackingPlayer.attack_capacity -= genRandomValue(10);
    // Refactor -
    generateCommentary("nearMiss", attackingPlayer, matchTime, team_attacking);
  }
};

const handleFreekick = (
  attackingTeam,
  defendingTeam,
  matchTime,
  team_home_move,
  team_away_move
) => {
  let minute = functions.convertFloatMinutes(matchTime);
  let team_attacking = attackingTeam.details;
  const attackingPlayer = randomPlayerByPosition(
    "midfielder",
    attackingTeam["team_players"]
  );
  const defendingPlayer = randomPlayerByPosition(
    "goalkeeper",
    defendingTeam["team_players"]
  );

  if (
    defendingPlayer !== undefined &&
    defendingPlayer.deffense_capacity !== undefined &&
    attackingPlayer.attack_capacity > defendingPlayer.deffense_capacity &&
    attackingPlayer.skills_capacity > defendingPlayer.skills_capacity && genRandomValue(2) % 2 === 0  ) {
    generateCommentary("freekick", attackingPlayer, matchTime, team_attacking);
    console.log(`${minute} mins: ${attackingPlayer.name} scored<br/>`);
    updateScore(team_home_move, team_away_move);
    defendingPlayer.deffense_capacity -= 1;
    attackingPlayer.attack_capacity += 1;
    generateCommentary("goal", attackingPlayer, matchTime, team_attacking);
  } else {
    generateCommentary(
      "wastedFreekick",
      attackingPlayer,
      matchTime,
      team_attacking
    );
    attackingPlayer.skills_capacity -= 1;
    reduceValues(
      genRandomValue(3),
      attackingTeam["team_players"],
      "attack_capacity",
      ["striker", "midfielder"]
    );
    reduceValues(
      genRandomValue(3),
      attackingTeam["team_players"],
      "skills_capacity",
      ["striker", "midfielder"]
    );
    defendingPlayer.deffense_capacity += 1;
  }
};

const handlePenalty = (
  attackingTeam,
  defendingTeam,
  matchTime,
  team_home_move,
  team_away_move
) => {
  let minute = functions.convertFloatMinutes(matchTime);

  let team_attacking = attackingTeam.details;
  let team_deffending = defendingTeam.details;

  const attackingPlayer = randomPlayerByPosition(
    "striker",
    attackingTeam["team_players"]
  );
  const defendingPlayer = randomPlayerByPosition(
    "goalkeeper",
    defendingTeam["team_players"]
  );
  const bookedPlayer = randomPlayerByPosition(
    "defender",
    defendingTeam["team_players"]
  );
  // Book the player?
  if (genRandomValue(100) > 25) {
    bookedPlayer.status = "yellow";
    console.log(`${minute} mins: ${bookedPlayer.name} booked<br/>`);
  }

  if (attackingPlayer && attackingPlayer.attack_capacity != undefined) {
    if (
      Math.trunc(attackingPlayer.attack_capacity) >
      Math.trunc(defendingPlayer.deffense_capacity) &&
    Math.trunc(attackingPlayer.aggressivity_capacity) >
      Math.trunc(defendingPlayer.aggressivity_capacity) &&
    Math.trunc(attackingPlayer.stamina) > Math.trunc(defendingPlayer.stamina)
    ) {
      generateCommentary("penalty", attackingPlayer, matchTime, team_attacking);
      console.log(
        `${minute} mins: ${attackingPlayer.name} scores penalty<br/>`
      );
      updateScore(team_home_move, team_away_move);
      generateCommentary("goal", attackingPlayer, matchTime, team_attacking);
      attackingPlayer.attack_capacity += 1;
      defendingPlayer.deffense_capacity -= 2;
    }
  } else {
    generateCommentary(
      "missedPenalty",
      attackingPlayer,
      matchTime,
      team_attacking
    );
    console.log(`${minute} mins: ${attackingPlayer.name} missed penalty<br/>`);
    defendingPlayer.deffense_capacity += 2;
    attackingPlayer.attack_capacity -= 2;
    defendingPlayer.aggressivity_capacity += 1;
  }
  defendingPlayer.stamina -= 1;
  attackingPlayer.stamina -= 2;
};

const straightRed = (defendingTeam, matchTime) => {
  let team_deffending = defendingTeam.details;

  const defendingPlayer = randomPlayer(defendingTeam["team_players"], false);
  while (defendingPlayer.position === "goalkeper") {
    defendingPlayer = randomPlayer(defendingTeam["team_players"], false);
  }
  if (genRandomValue(defendingPlayer.aggressive) + (100 - matchTime) < 25) {
    defendingPlayer.isplaying = 0;
    defendingPlayer.status = "ejected";

    this.generateCommentary(
      "straightRed",
      defendingPlayer,
      matchTime,
      team_deffending
    );
    $(`${matchTime} mins: ${defendingPlayer.name} sent off<br/>`);
    // if (defendingTeam.place === 'home') pausePlay();
  }
};

const updateScore = (team_home_move, team_away_move) => {
  if (team_home_move) {
    score_home = score_home + 1;
    console.log(
      `Goal from the home team, TEAM_HOME ${score_home} - AWAY_TEAM ${score_away}`
    );
  } else if (team_away_move) {
    score_away = score_away + 1;
    console.log(
      `Goal from the home team, TEAM_HOME ${score_home} - AWAY_TEAM ${score_away}`
    );
  }
};

const randomPosition = () => {
  const randomIndex = genRandomValue(positions.length) + 1;
  const chosenPosition = positions[randomIndex];
  return [chosenPosition];
};

/*
   const substitute = (teamObject, player, matchTime) =>  {
    console.log('substitute');

    if (teamObject.subs < 7) {
      if (!player.isplaying === 1) {
        $(`${matchTime} mins: ${player.name} substituted<br/>`);
        teamObject.subs += 1;
        player.isplaying = 0;
        player.status = 'subbed-off';
      } else {
        $(`${matchTime} mins: ${player.name} substituted<br/>`);
        teamObject.subs += 1;
        player.isplaying = 1;
        player.status = 'subbed-on';
      }
    } else {
      console.log('You have had 3 subs!');
    }
  }
  */

module.exports = {
  genRandomValue,
  selectTeam,
  setupEvent,
  randomPosition,
  reduceValues,
  straightRed,
  handlePenalty,
  handleFreekick,
  getEvents,
  handleDiscipline,
  handleInjury,
  randomSubstitute,
  randomPlayer,
  randomPlayerByPosition,
  increaseValues,
  goalChance,
  getMinutesToPlay,
  getScoreFromTeam,
};
