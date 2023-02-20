var express = require('express');
var router = express.Router();

var userMiddleware = require('../middleware/auth');
var verifyHasManager = require('../middleware/checkManager');

const TransactionController = require("../core/Transaction/TransactionController");
const transaction = new TransactionController();

router.get('/team/buy', userMiddleware, verifyHasManager, (req, res, next) => transaction.getBuyTransactions(req, res, next));
router.get('/team/sell', userMiddleware, verifyHasManager, (req, res, next) => transaction.getSellTransactions(req, res, next));
router.get('/team/overall', userMiddleware, verifyHasManager, (req, res, next) => transaction.getOverallTransactions(req, res, next));

module.exports = router;

        