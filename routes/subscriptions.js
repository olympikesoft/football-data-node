var express = require('express');
var router = express.Router();


const SubscriptionController = require("../core/SubscriptionController.js");
const subscription = new SubscriptionController();

router.post('/create-checkout-session', (req, res, next) => subscription.createCheckoutSessionSubscription(req, res, next));
router.post('/create-subscription-plan', (req, res, next) => subscription.createSubscriptionPlanByAccount(req, res, next));
router.post('/get-subscriptions-creator', (req, res, next) => subscription.getSubscriptionsByCreator(req, res, next));
router.get('/get-subscriptions-user', (req, res, next) => subscription.getSubscriptionsByUser(req, res, next));

module.exports = router;

        