var express = require('express');
var router = express.Router();

var userMiddleware = require("../middleware/auth");
var verifyHasManager = require("../middleware/checkManager");
var SquadController  = require('../core/Squad/SquadController')

const squad = new SquadController();

//router.post('/create', userMiddleware, verifyHasManager, (req, res, next) => squad.generateSquad(req, res, next));
router.get('/get', userMiddleware, verifyHasManager, (req, res, next) => squad.getSquadTeam(req, res, next));
//router.post('/add-player', userMiddleware, verifyHasManager, (req, res, next) => squad.addPlayerSquadMatch(req, res, next));
router.post('/update', userMiddleware, verifyHasManager, (req, res, next) => squad.swapPlayerSquadMatch(req, res, next));

module.exports = router;

        