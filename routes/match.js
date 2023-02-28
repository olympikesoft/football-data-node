var express = require('express');

var router = express.Router();

var userMiddleware = require("../middleware/auth");
var verifyHasManager = require("../middleware/checkManager");
var MatchController  = require('../core/Match/MatchController')

const match = new MatchController();

router.get('/list', userMiddleware, verifyHasManager, (req, res, next) => match.getMatchesByCurrentTeam(req, res, next));
router.get('/info/:match_id', (req, res, next) => match.getMatch(req, res, next));
router.post('/create', userMiddleware, verifyHasManager, (req, res, next) => match.inviteMatch(req, res, next));

module.exports = router;

        