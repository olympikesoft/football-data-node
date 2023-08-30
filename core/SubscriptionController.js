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

class SubscriptionController {
  async createCheckoutSessionSubscription(req, res, next) {
    const isWeb = req.headers['platform'] === 'web';
    const { subscriptionPlanUuid, userUuid } = req.body;

    try {
      // Wait for the data from Firebase
      const snapshot = await db
        .ref("/subscriptionPlans/" + subscriptionPlanUuid)
        .once("value");
      const subscriptionPlanData = snapshot.val();

      const user = await db
      .ref("/users/" + subscriptionPlanData.creatorId)
      .once("value");
    
      const userData = user.val();

      if(!userData.stripeAccountId){
        res.status(500).send({ message: 'Please connect to Stripe bussiness before adding subscriptions on your system.'})
      }

      let accountId = userData.stripeAccountId;

      const successUrl = 'http://localhost:5173/payment/success-stripe';
      const cancelUrl = 'http://localhost:9000/api/payments/cancel-payment';

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price: subscriptionPlanData.subscriptionStripePriceId,
            quantity: 1,
          },
        ],
        payment_intent_data: {
          application_fee_amount: 200,
        },
        mode: 'payment',
        success_url: successUrl,
        cancel_url: cancelUrl,
      }, {stripeAccount: accountId}); 

      var key = db.ref("subscriptions").push().key;

      let newDate = new Date();
      if (subscriptionPlanData.subscriptionPlanType === 'month') {
        newDate.setMonth(newDate.getMonth() + 1);
      } else if (interval === 'year') {
        newDate.setFullYear(newDate.getFullYear() + 1);
      }

      let postData = {
        userUuid: userUuid,
        subscriptionPlanUuid: subscriptionPlanUuid,
        subscriptionPlanCreatorUuid: subscriptionPlanData.creatorId,
        pinCode: key,
        checkoutSessionId: session.id,
        date_start: new Date(),
        date_end: newDate,
        status: "pending",
        createAt: new Date(),
      };

      var updates = {};
      updates["/subscriptions/" + key] = postData;

      await db.ref().update(updates);
      res.json({ session });
    } catch (error) {
      console.log("Data could not be updated.", error);
    }
  }

  async createSubscriptionPlanByAccount(req, res, next) {
      const { selectedSubscriptionPlanType, subscriptionPlanTitle, subscriptionPlanPrice, subscriptionPlanCurrency, userUuid, image } = req.body;
      try {
        const snapshot = await db
        .ref("/users/" + userUuid)
        .once("value");
      
        const userData = snapshot.val();

        if(!userData.stripeAccountId){
          res.status(500).send({ message: 'Please connect to Stripe bussiness before adding subscriptions on your system.'})
        }

        let accountId = userData.stripeAccountId;

        const product = await stripe.products.create(
          {
            name: subscriptionPlanTitle,
            type: 'service',
          },
          {
            stripeAccount: accountId,
          }
        );
    
        // Create price
        const price = await stripe.prices.create(
          {
            unit_amount: subscriptionPlanPrice * 100,
            currency: subscriptionPlanCurrency,
            product: product.id,
          },
          {
            stripeAccount: accountId,
          }
        );

        var key = db.ref("subscriptionPlans").push().key;

        let postData = {
          subscriptionPlanTitle,
          creatorId: userUuid,
          subscriptionPlanType: selectedSubscriptionPlanType,
          subscriptionPlanCurrency,
          subscriptionPlanPrice: subscriptionPlanPrice,
          subscriptionStripeProductId: product.id,
          subscriptionStripePriceId: price.id,
          imageUrl: image,
          createAt: new Date(),
        };
  
        var updates = {};
        updates["/subscriptionPlans/" + key] = postData;
  
        await db.ref().update(updates);
        res.json({ success: true });
      } catch (error) {
        console.error('Error creating plan: ', error);
        res.status(500).json({ error: 'Failed to create plan' });
      }
    }

    async getSubscriptionsByCreator(req, res, next) {
      const { userUuid } = req.body;
      try {
        const snapshot = await db
        .ref("/subscriptions/")
        .orderByChild("subscriptionPlanCreatorUuid")
        .equalTo(userUuid)
        .once("value");

      let subscriptions = [];
      const data = snapshot.val();
      for (let key in data) {
        const subscriptionData = await this.getPlanFromSubscription(
          data[key].subscriptionPlanUuid
        );
        subscriptions.push({
          subscriptionData,
          id: key, 
          ...data[key]
        });
      }
      if (subscriptions.length > 0) {
        res.json(subscriptions);
      }else {
        res.json({ message: "Not found" });
      }
      } catch (error) {
        console.error('Error getSubscriptionsByCreator: ', error);
        res.status(500).json({ error: 'Failed to getSubscriptionsByCreator' });
      }
    }

    async getPlanFromSubscription(subscriptionPlanUuid) {
      const snapshot = await db.ref("subscriptionPlans/" + subscriptionPlanUuid).once("value");
      return snapshot.val();
    }

    async getSubscriptionsByUser(req, res, next) {
      let { userUuid } = req.query;
      try {
        const snapshot = await db
        .ref("/subscriptions/")
        .orderByChild("userUuid")
        .equalTo(userUuid)
        .once("value");
      const data = snapshot.val();

      let subscriptions = [];
      for (let key in data) {
        const subscriptionData = await this.getPlanFromSubscription(
          data[key].subscriptionPlanUuid
        );
        subscriptions.push({
          subscriptionData,
          id: key, 
          ...data[key]
        });
      }
      if (subscriptions.length > 0) {
        res.json(subscriptions);
      }else {
        res.json({ message: "Not found" });
      }
      } catch (error) {
        console.error('Error creating plan: ', error);
        res.status(500).json({ error: 'Failed to get plans' });
      }
    }
}
module.exports = SubscriptionController;
