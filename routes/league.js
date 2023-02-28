var express = require('express');
var router = express.Router();
var LeagueController  = require('../core/League/LeagueController')

const league = new LeagueController();

router.get('/list', (req, res, next) => league.getLeagues(req, res, next));
router.get('/stands', (req, res, next) => league.getLeagueStand(req, res, next));

module.exports = router;

        