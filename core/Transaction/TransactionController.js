"use strict";

var UserService = require("../User/UserService");
var UserService = new UserService();

var TeamService = require("../Team/TeamService");
var TeamService = new TeamService();

var TransactionService = require("./TransactionService");
var TransactionService = new TransactionService();

var PlayerService = require("../Player/PlayerService");
var PlayerService = new PlayerService();

class TransactionController {
  //Transactions
  async getBuyTransactions(req, res, next) {
    let user_id = req.user.id;
    try {
      let teamUser = await TeamService.getTeamByUser(user_id);
      if (!teamUser) {
        return res.status(501).json({ Message: "No team" });
      }
      let transactionsBuy = await TransactionService.getTeamBuys(teamUser[0].id);
      if (transactionsBuy.length === 0) {
        return res.status(404).json({ Message: "No transactions" });
      }

      if (transactionsBuy.length > 0) {
        return res.status(404).json({ transactions: transactionsBuy });
      }
    } catch (err) {
      if (err) {
        next(err);
      }
    }
  }

  async getSellTransactions(req, res, next) {
    let user_id = req.user.id;
    try {
      let teamUser = await TeamService.getTeamByUser(user_id);
      if (!teamUser) {
        return res.status(501).json({ Message: "No team" });
      }
      let transactions = await TransactionService.getTeamSells(teamUser[0].id);
      if (transactionsSell.length === 0) {
        return res.status(404).json({ Message: "No transactions" });
      }

      if (transactionsSell.length > 0) {
        return res.status(404).json({ transactions: transactionsSell });
      }
    } catch (err) {
      if (err) {
        next(err);
      }
    }
  }

  async getOverallTransactions(req, res, next) {
    let user_id = req.user.id;
    try {
      let teamUser = await TeamService.getTeamByUser(user_id);
      if (!teamUser) {
        return res.status(501).json({ Message: "No team" });
      }
      let userInfo = await UserService.getUser(user_id);
      let transactions = await TransactionService.transactionsOverall(teamUser[0].id);
      let userMoney = userInfo.user[0].money_game;
      let initialValue = 2000000;

      if (transactions.length === 0) {
        return res.status(200).json({ transactions: [], userMoney: userMoney });
      }

      if (transactions.length > 0) {
        let result = transactions.map(t => {
            let amount = t.amount * (t.amount > 0 ? -1 : 1);
            let balance = initialValue += amount; // Update balance
            return { date: t.date, amount, balance };
        });

        let transactionsLst = [{date: userInfo.user[0].date_created,  amount: 0, balance: initialValue }]

        return res.status(200).json({ transactions: transactionsLst.concat(result), userMoney: userMoney });
      }
    } catch (err) {
      if (err) {
        console.log('error', err);
      }
    }
  }
}
module.exports = TransactionController;
