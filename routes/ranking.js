var express = require('express');
var router = express.Router();

//var userMiddleware = require('../middleware/auth');
//var verifyHasManager = require('../middleware/checkManager');

const RankingController = require("../core/Ranking/RankingController");
const ranking = new RankingController();

router.get('/teams-win', (req, res, next) => ranking.getRankingWin(req, res, next));
router.get('/players-scored', (req, res, next) => ranking.getRankingPlayerScored(req, res, next));

module.exports = router;

        