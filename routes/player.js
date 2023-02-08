var express = require("express");
var router = express.Router();

var userMiddleware = require("../middleware/auth");
var verifyHasManager = require("../middleware/checkManager");

const PlayerController = require("../core/Player/PlayerController");
const player = new PlayerController();

router.get("/team", userMiddleware, verifyHasManager, (req, res, next) =>
  player.getPlayersFromManager(req, res, next)
);

router.get("/team/:teamId", userMiddleware, verifyHasManager, (req, res, next) =>
  player.getPlayersFromTeam(req, res, next)
);

module.exports = router;
