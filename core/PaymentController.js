"use strict";

var firebase = require("firebase/compat/app");
require("firebase/compat/database");

const stripe = require("stripe")("sk_test_NEbjH7cEfVImWXfCVnVZc5Ar");

const firebaseConfig = {
  apiKey: "AIzaSyALE9n5g1VbyvlljRA349MnF4gYJDausaM",
  authDomain: "kidstreamplay.firebaseapp.com",
  databaseURL: "https://kidstreamplay-default-rtdb.firebaseio.com",
  projectId: "kidstreamplay",
  storageBucket: "kidstreamplay.appspot.com",
  messagingSenderId: "331334625731",
  appId: "1:331334625731:web:8295ac0128f4bd6130f576",
  measurementId: "G-VXC5XJYF5N",
};

firebase.initializeApp(firebaseConfig);

var db = firebase.database();

class PaymentController {
  async cancelPayment(req, res, next) {
    let user_id = req.user.id;
    let position_id = req.body.position_id;
    try {
      let team_id = await TeamService.getTeamByUser(user_id);
      let players_from_team = await PlayerService.getPlayersfromTeam(
        team_id[0].id
      );
      let players = await TransferService.GetTransfersExcludingPlayers(
        team_id[0].id,
        players_from_team.length > 0
          ? players_from_team.map((el) => el.player_id)
          : [],
        position_id ?? ""
      );
      if (players.length > 0) {
        return res.status(200).json({ players: players });
      } else {
        return res.status(404).json({ message: "No players on market" });
      }
    } catch (err) {
      if (err) {
        next(err);
      }
    }
  }

  async acceptPayment(req, res, next) {
    try {
      const event = req.body;
      event.data.object.id =
        "cs_test_a1244pgyrawde7jS7iPDykiLYvTpbuo5nuelRntar6PdvszGNugeIHv7Ao";
      if (event.type === "checkout.session.completed") {
        const session = event.data.object;

        const subscription = await db
          .ref("/subscriptions/")
          .orderByChild("checkoutSessionId")
          .equalTo(session.id)
          .once("value");
        const subscriptionData = subscription.val();

        if (!subscriptionData) {
          res.status(404).send({ error: "Not Found" });
        }

        let userUuid = "",
          subscriptionUuid = "",
          subscriptionPlanUuid = "";

        for (let key in subscriptionData) {
          userUuid = subscriptionData[key].userUuid;
          subscriptionUuid = key;
          subscriptionPlanUuid = subscriptionData[key].subscriptionPlanUuid;
        }

        const subscriptionPlan = await db
          .ref("/subscriptionPlans/" + subscriptionPlanUuid)
          .once("value");
        const subscriptionPlanData = subscriptionPlan.val();

        let creatorId = subscriptionPlanData.creatorId;

        let newDate = new Date();

        let paymentKey = db.ref("payments").push().key;

        let postData = {
          userUuid,
          subscriptionUuid,
          checkoutSessionId: session.id,
          totalAmount: session.amount_total,
          paymentStripeId: session.payment_intent,
          receiverUuid: creatorId,
          createdAt: newDate,
        };

        var updates = {};
        updates["/payments/" + paymentKey] = postData;
        await db.ref().update(updates);

        const alreadyFollows = await db
          .ref("/followers/")
          .orderByChild("userUuid_followerMaster")
          .equalTo(userUuid + "_" + creatorId)
          .once("value");
        const followData = alreadyFollows.val();

        if (!followData) {
          let post = {
            userUuid,
            followerMaster: creatorId,
            createdAt: newDate,
            userUuid_followerMaster: userUuid + "_" + creatorId,
          };
          let followersKey = db.ref("followers").push().key;
          var update = {};
          update["/followers/" + followersKey] = post;
          await db.ref().update(update);
        }

        var key = "/subscriptions/" + subscriptionUuid;
        let form = {
          [key + "/status"]: "success",
        };
        await db.ref().update(form);
        res.status(200).json({ success: true });
      }
    } catch (err) {
      if (err) {
        next(err);
      }
    }
  }

  async recurrentPayment(req, res, next) {
    let user_id = req.user.id;
    let playerId = parseInt(req.body.playerId);
    let price = parseInt(req.body.price);
    try {
      let checkPlayerAlreadySale = await TransferService.checkPlayerAlreadySale(
        user_id,
        playerId
      );

      if (checkPlayerAlreadySale.length > 0) {
        return res.status(200).json({
          message: "You cannot sell the same player twice",
          success: false,
        });
      }
      let teamUser = await TeamService.getTeamByUser(user_id);

      let players_from_team = await PlayerService.getPlayersfromTeam(
        teamUser[0].id
      );

      if (players_from_team.length < 11) {
        if (
          players_from_team.filter((x) => x.player_id === market[0].player_id)
            .length > 0
        ) {
          return res.status(200).json({
            message: "You cannot sell player",
            success: false,
          });
        }
      }

      let sellPlayer = await TransferService.sellerTeamPlayer(
        teamUser[0].id,
        playerId,
        price
      );
      if (sellPlayer) {
        return res.status(200).json({ success: true });
      } else {
        return res.status(200).json({
          message: "Error on adding player to buyer, try later",
          success: false,
        });
      }
    } catch (err) {
      if (err) {
        next(err);
      }
    }
  }

  async getPaymentsUser(req, res, next) {
    let { userUuid } = req.body;
    try {
      const snapshot = await db
        .ref("/payments/")
        .orderByChild("userUuid")
        .equalTo(userUuid)
        .once("value");
      const data = snapshot.val();
      if (data) {
        let payments = [];
        for (let payment in data) {
          payments.push({
            id: payment,
            ...data[payment],
          });
        }
        res.json(payments);
      } else {
        res.json({ message: "No payments found" });
      }
    } catch (error) {}
  }
}
module.exports = PaymentController;
