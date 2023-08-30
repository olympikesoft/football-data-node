"use strict";

var firebase = require("firebase/compat/app");
require("firebase/compat/database");

const stripe = require("stripe")("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");

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

  async acceptPayment(req, res, next) {
    try {
      const event = req.body;
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

  async getPaymentsCreators(req, res, next) {
    let { userUuid } = req.body;
    try {
      const snapshot = await db
        .ref("/payments/")
        .orderByChild("receiverUuid")
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
