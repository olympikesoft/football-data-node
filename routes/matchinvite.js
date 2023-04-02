var express = require('express');
var router = express.Router();

var userMiddleware = require("../middleware/auth");
var verifyHasManager = require("../middleware/checkManager");
var MatchInviteController  = require('../core/MatchInvite/MatchInviteController')

const matchInvite = new MatchInviteController();

router.get('/list', userMiddleware, verifyHasManager, (req, res, next) => matchInvite.getMatchesInviteCurrentTeam(req, res, next));
router.post('/create', userMiddleware, verifyHasManager, (req, res, next) => matchInvite.createMatchInvite(req, res, next));
router.post('/accept', userMiddleware, verifyHasManager, (req, res, next) => matchInvite.acceptMatchInvite(req, res, next));

module.exports = router;

        