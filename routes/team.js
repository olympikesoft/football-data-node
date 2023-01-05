var express = require('express');
var router = express.Router();
var TeamController  = require('../core/Team/TeamController')

const team = new TeamController();

router.get('/info', (req, res, next) => team.GetTeam(req, res, next));
router.get('/not-selected', (req, res, next) => team.GetTeamsNotSelected(req, res, next));

module.exports = router;

        