var express = require('express');
var router = express.Router();
var LeagueController  = require('../core/League/LeagueController')

const league = new LeagueController();

router.get('/list', (req, res, next) => league.GetLeagues(req, res, next));

module.exports = router;

        