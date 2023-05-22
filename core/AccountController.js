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

class AccountController {
  async getUserContent(userUuid) {
    const snapshot = await db.ref("/users/" + userUuid).once("value");
    return snapshot.val();
  }

  async getCompanyFollowAccount(req, res, next) {
    const { user } = req.body;
    try {
      const snapshot = await db
        .ref("/followers/")
        .orderByChild("followerMaster")
        .equalTo(user)
        .once("value");
      const data = snapshot.val();
      let promises = [];

      if (data) {
        for (let key in data) {
          promises.push(this.getUserContent(data[key].userUuid));
        }
        Promise.all(promises)
          .then((followers) => {
            res.json(followers);
          })
          .catch((error) => {
            // handle error here
            console.error(error);
            res.status(500).send(error);
          });
      } else {
        res.status(404).send({ message: "Not Found" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to get company follow account" });
    }
  }

  async getFollowersAccount(req, res, next) {
    const { user } = req.body;
    try {
      const snapshot = await db
        .ref("/followers/")
        .orderByChild("followerMaster")
        .equalTo(user)
        .once("value");
      const data = snapshot.val();
      let promises = [];

      if (data) {
        for (let key in data) {
          promises.push(this.getUserContent(data[key].userUuid));
        }

        Promise.all(promises)
          .then((followers) => {
            res.json(followers);
          })
          .catch((error) => {
            // handle error here
            console.error(error);
            res.status(500).send(error);
          });
      } else {
        res.status(404).send({ message: "Not Found" });
      }
    } catch (error) {
      console.log(error);
      res.status(500).json({ error: "Failed to get followers account" });
    }
  }

  async createAccountBanking(req, res, next) {
    const { token, capabilities, user } = req.body;
    try {
      const userSnapshot = await db.ref("users/" + user).once("value");
      const userData = userSnapshot.val();

      // Check if user exists in Firebase
      if (!userData) {
        res.status(404).json({ error: "User not found" });
        return;
      }

      const account = await stripe.accounts.create({
        type: "custom",
        country: userData.country,
        email: userData.email,
        business_type: "company",
        external_account: token,
        capabilities: capabilities,
      });

      const updateTos = await stripe.accounts.update(account.id, {
        tos_acceptance: {
          date: 1609798905,
          ip: "8.8.8.8",
        },
      });

      var key = "users/" + user;
      let postData = {
        [key + "/stripeAccountId"]: account.id,
      };
      await db.ref().update(postData);
      res.json(account);
    } catch (error) {
      console.error("Error creating Stripe account: ", error);
      res.status(500).json({ error: "Failed to create Stripe account" });
    }
  }
}
module.exports = AccountController;
