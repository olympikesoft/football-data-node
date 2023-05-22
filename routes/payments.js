var express = require('express');
var router = express.Router();


const PaymentController = require("../core/PaymentController.js");
const transaction = new PaymentController();

router.post('/cancel-payment', (req, res, next) => transaction.cancelPayment(req, res, next));
router.post('/accept-payment', (req, res, next) => transaction.acceptPayment(req, res, next));
router.post('/recurrent-payment', (req, res, next) => transaction.recurrentPayment(req, res, next));
router.post('/get-payments-user', (req, res, next) => transaction.getPaymentsUser(req, res, next));

module.exports = router;

        