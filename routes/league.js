var express = require('express');
var router = express.Router();
var LeagueController  = require('../core/League/LeagueController')
var userMiddleware = require("../middleware/auth");

const league = new LeagueController();

router.get('/list', (req, res, next) => league.getLeagues(req, res, next));
router.get('/team/stands', userMiddleware, (req, res, next) => league.getTeamLeagueStand(req, res, next));
router.get('/team/stand', userMiddleware, (req, res, next) => league.getTeamLeaguePositionStand(req, res, next));

router.get('/stands', (req, res, next) => league.getLeagueStand(req, res, next));

module.exports = router;

        