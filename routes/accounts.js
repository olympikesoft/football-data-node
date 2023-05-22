var express = require('express');
var router = express.Router();


const AccountController = require("../core/AccountController.js");
const account = new AccountController();

router.post('/create-account', (req, res, next) => account.createAccountBanking(req, res, next));
router.post('/get-followers', (req, res, next) => account.getFollowersAccount(req, res, next));
router.post('/get-company-follows', (req, res, next) => account.getCompanyFollowAccount(req, res, next));

module.exports = router;

        