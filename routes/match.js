var express = require('express');
var router = express.Router();
var MatchController  = require('../core/Match/MatchController')

const match = new MatchController();

router.get('/list', (req, res, next) => match.GetMatchs(req, res, next));
router.get('/info', (req, res, next) => match.GetMatch(req, res, next));


module.exports = router;

        