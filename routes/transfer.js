var express = require('express');
var router = express.Router();

var userMiddleware = require('../middleware/auth');
var verifyHasManager = require('../middleware/checkManager');

const TransferController = require("../core/Transfer/TransferController");
const transfer = new TransferController();

router.get('/all', userMiddleware, verifyHasManager, (req, res, next) => transfer.getTransferMarket(req, res, next));
router.post('/buy', userMiddleware, verifyHasManager, (req, res, next) => transfer.buyPlayer(req, res, next));

module.exports = router;

        