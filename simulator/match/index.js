  var actions = require("./actions");



  export const matchSimulator = (room, matches, play) => {
    return new Promise((resolve, reject) => {
      let matchTime =  actions.getMinutesToPlay();
      let match = matches[0]['match'];
  
  
      let home_team = match.team_home;
      let away_team = match.team_away;
     
      let home_team_name = match.team_away
      let home_team_subs = match.match_summary.subs_home;
      let away_team_subs = match.match_summary.subs_away;
      let match_summary = match.match_summary
  
      let team_away_move = false;
      let team_home_move = false;
      let cpuMode = false;
  
      const timerID = setInterval(function() {
        if(play && matchTime < 91){
            const eventValue = actions.genRandomValue(100) + 1;
  
            if(matchTime != undefined){
      
            const [attackingTeam, defendingTeam] = actions.selectTeam(home_team, away_team);
            if(attackingTeam.team === 'team_home'){
              team_home_move = true;
            }else{
              team_away_move = true;
            }
            
            setupEvent(attackingTeam);
      
            if (eventValue % 30 === 0) {
              // Random (Striker, Midfielder) vs. Goalkeeper > RandTheirAttack vs. RandGoalkeeper
              actions.increaseValues(actions.genRandomValue(3), attackingTeam["team_players"],'attack_capacity',['midfielder', 'striker']);
              actions.increaseValues(actions.genRandomValue(3),attackingTeam["team_players"],'skills_capacity',['midfielder', 'striker']);
              actions.reduceValues(actions.genRandomValue(3),defendingTeam["team_players"],'deffense_capacity',['midfielder', 'defender', 'goalkeeper']);
              actions.goalChance(attackingTeam, defendingTeam, matchTime, team_home_move, team_away_move);
              match_summary.score_away = actions.GetScoreFromTeam( away_team.team_players);
              match_summary.score_home = actions.GetScoreFromTeam(home_team.team_players);
              match_summary.events = actions.getEvents();
  
              //io.sockets.in(room).emit('chat_message_show', match_summary.events[match_summary.events.length - 1]);
             // io.sockets.in(room).emit('score_match', { score_home : match_summary.score_home, 'score_away' : match_summary.score_away});
            }
  
            if (eventValue % 25 === 0) {
              actions.reduceValues(actions.genRandomValue(20),attackingTeam["team_players"],'deffense_capacity',['midfielder', 'defender', 'goalkeeper']);
              actions.reduceValues(actions.genRandomValue(20),attackingTeam["team_players"],'attack_capacity',['midfielder', 'defender', 'goalkeeper']);
              actions.increaseValues(actions.genRandomValue(20), defendingTeam["team_players"],'attack_capacity',['midfielder', 'striker']);
              actions.goalChance(attackingTeam, defendingTeam, matchTime, team_home_move, team_away_move);
  
              match_summary.score_away = actions.GetScoreFromTeam( away_team.team_players);
              match_summary.score_home = actions.GetScoreFromTeam(home_team.team_players);
              match_summary.events = actions.getEvents();
  
              //io.sockets.in(room).emit('chat_message_show', match_summary.events[match_summary.events.length - 1]);
              //io.sockets.in(room).emit('score_match', { score_home : match_summary.score_home, 'score_away' : match_summary.score_away});
            }
  
            if (eventValue % (actions.genRandomValue(30) + 90) === 0) {
              // Striker vs. Goalkeeper > RandTheirAttack vs. RandGoalkeeperPenalty
              actions.reduceValues(actions.genRandomValue(10), defendingTeam["team_players"],'deffense_capacity',['midfielder', 'defender', 'goalkeeper']);
              handlePenalty(attackingTeam, defendingTeam, matchTime, team_home_move, team_away_move);
  
              match_summary.score_away = actions.GetScoreFromTeam( away_team.team_players);
              match_summary.score_home = actions.GetScoreFromTeam(home_team.team_players);
              match_summary.events = actions.getEvents();
              
              //io.sockets.in(room).emit('chat_message_show', match_summary.events[match_summary.events.length - 1]);
              //io.sockets.in(room).emit('score_match', { score_home : match_summary.score_home, 'score_away' : match_summary.score_away});
            }
      
            if (eventValue % 90 === 0) {
              // Random Player => Discipline > random
              straightRed(defendingTeam, matchTime);
              actions.increaseValues(20,attackingTeam["team_players"],'deffense_capacity',['striker','midfielder', 'defender', 'goalkeeper']);
              actions.reduceValues(20,attackingTeam["team_players"],'attack_capacity',['striker','midfielder', 'defender', 'goalkeeper']);
              actions.reduceValues(20,attackingTeam["team_players"],'skills_capacity',['striker','midfielder', 'defender', 'goalkeeper']);
  
              match_summary.events = actions.getEvents();
              //io.sockets.in(room).emit('chat_message_show', match_summary.events[match_summary.events.length - 1]);
              //io.sockets.in(room).emit('score_match', { score_home : match_summary.score_home, 'score_away' : match_summary.score_away});
            }
            //
            if (eventValue % 22 === 0) {
              // Striker vs. Goalkeeper > RandTheirFreekick vs. RandGoalkeeperPenalty
              actions.increaseValues(5,attackingTeam["team_players"],'attack_capacity',['midfielder', 'striker']);
              actions.increaseValues(5,defendingTeam["team_players"],'attack_capacity',['midfielder', 'striker']);
              handleFreekick(attackingTeam, defendingTeam, matchTime, team_home_move, team_away_move);
              match_summary.score_away = actions.GetScoreFromTeam( away_team.team_players);
              match_summary.score_home = actions.GetScoreFromTeam(home_team.team_players);
              match_summary.events = actions.getEvents();
  
              //io.sockets.in(room).emit('chat_message_show', match_summary.events[match_summary.events.length - 1]);
              //io.sockets.in(room).emit('score_match', { score_home : match_summary.score_home, 'score_away' : match_summary.score_away});
            }
      
            if (eventValue % 18 === 0) {
              // RandomPlayer => discipline + matchtime rand vs. random
              actions.handleDiscipline(attackingTeam, defendingTeam, matchTime);
              actions.increaseValues(20,defendingTeam["team_players"],'deffense_capacity',['striker','midfielder', 'defender', 'goalkeeper']);
              actions.reduceValues(10,attackingTeam["team_players"],'attack_capacity',['striker','midfielder', 'defender', 'goalkeeper']);
              actions.reduceValues(10,attackingTeam["team_players"],'skills_capacity',['striker','midfielder', 'defender', 'goalkeeper']);
  
              match_summary.events = actions.getEvents();
            
              //io.sockets.in(room).emit('score_match', { score_home : match_summary.score_home, 'score_away' : match_summary.score_away});
              //io.sockets.in(room).emit('chat_message_show', match_summary.events[match_summary.events.length - 1]);
  
            }
      
            if (eventValue % 25 === 0) {
              actions.handleInjury(attackingTeam, matchTime);
              actions.reduceValues(3, defendingTeam["team_players"],'skills_capacity',['striker','midfielder', 'defender', 'goalkeeper']);
  
              match_summary.events = actions.getEvents();
            
              //io.sockets.in(room).emit('score_match', { score_home : match_summary.score_home, 'score_away' : match_summary.score_away});
              //io.sockets.in(room).emit('chat_message_show', match_summary.events[match_summary.events.length - 1]);
  
            }
      
            // If playing CPU mode, auto generate substituitons
            if(cpuMode) {
              if (eventValue % 10 === 0 && away_team_subs< 6 && matchTime > 50) {
                const [chosenPosition] = actions.randomPosition();
                const removePlayer = actions.randomPlayerByPosition(chosenPosition, defendingTeam['team_players'], 'subbed-on');
                const addPlayer = actions.randomSubstitute(chosenPosition, defendingTeam['team_players'], matchTime);
      
                // Checked that there is a player in that position available to come on. If not, don't run the substitution
                if (removePlayer && addPlayer) {
                  removePlayer.playing = !removePlayer.playing;
                  // substitute(defendingTeam, removePlayer, matchTime);
                    addPlayer.playing = !addPlayer.playing;
                  // substitute(defendingTeam, addPlayer, matchTime);
                }
              }
            }
      
            // Reduce fitness of players in a random position
            const positionForFitnessReduction = actions.randomPosition();
            actions.reduceValues(actions.genRandomValue(5), defendingTeam["team_players"],'stamina',positionForFitnessReduction);
            actions.increaseValues(actions.genRandomValue(6), defendingTeam["team_players"],'skills_capacity',positionForFitnessReduction);
            actions.reduceValues(actions.genRandomValue(5), attackingTeam["team_players"],'stamina',positionForFitnessReduction);
            actions.reduceValues(actions.genRandomValue(5), attackingTeam["team_players"],'speed_capacity',positionForFitnessReduction);
   
            move();
            // Update the timer
            if(matchTime == 44 ) {
              console.log(`That's half-time!`);
              //run = !run;
              //$primaryButton.text('Play');
            }
  
          
            if(matchTime >= 90) {
  
              match_summary.score_away = actions.GetScoreFromTeam( away_team.team_players);
              match_summary.score_home = actions.GetScoreFromTeam(home_team.team_players);
  
              console.log(`|||||||||||||||||||||||||That's full-time!||||||||||||||||||||||||`);
              clearInterval(timerID);
              console.log(`||${match_summary[0].home_team_name}|||${match_summary.score_home}|||||||||||That's full-time!|| ${match_summary[0].away_team_name}|||${match_summary.score_away}|||||`);
              console.log(`Finish`);
  
              //io.sockets.in(room).emit('chat_message_show', match_summary.events[match_summary.events.length - 1]);
              //io.sockets.in(room).emit('score_match', { score_home : match_summary.score_home, 'score_away' : match_summary.score_away});
  
  
              play = false;
              resolve(match);
              return false;
            } else {
              matchTime++;
              console.log(`Match time - ${matchTime}`);
            }
          }
            
          }else{
            clearInterval(timerID);
          }
        },200);
    })
  }
  
  module.exports = {
    matchSimulator,
  };
  