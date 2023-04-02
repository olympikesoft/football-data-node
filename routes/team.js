var express = require('express');
var multer = require('multer');
const upload = multer();
var router = express.Router();

var userMiddleware = require('../middleware/auth');
var verifyHasManager = require('../middleware/checkManager');

const TeamController = require("../core/Team/TeamController");
const team = new TeamController();


router.get('/manager/get/team', userMiddleware, verifyHasManager, (req, res, next) => team.getTeam(req, res, next));
router.get('/get/list', userMiddleware, (req, res, next) => team.getTeams(req, res, next));
router.post('/manager/create/team', upload.single("image"), userMiddleware, (req, res, next) =>  team.createTeam(req, res, next));
router.post('/manager/team/linkLeague', userMiddleware, (req, res, next) =>  team.linkTeamLeague(req, res, next));
module.exports = router;

        