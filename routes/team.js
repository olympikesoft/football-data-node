var express = require('express');
var router = express.Router();

var userMiddleware = require('../middleware/auth');
var verifyHasManager = require('../middleware/checkManager');

const TeamController = require("../core/Team/TeamController");
const team = new TeamController();


router.get('/manager/get/team', userMiddleware, verifyHasManager, (req, res, next) => team.getTeam(req, res, next));
router.post('/manager/create/team', userMiddleware, verifyHasManager, (req, res, next) =>  team.createTeam(req, res, next));

module.exports = router;

        