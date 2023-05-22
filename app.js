var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
const cors = require("cors");
const session = require("express-session");

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

//require("./schedule/matches")();
//require("./schedule/league")();
//require("./schedule/squad")();

var paymentsRouter = require("./routes/payments");
var subscriptionsRouter = require("./routes/subscriptions");
var accountsRouter = require("./routes/accounts");
var moviesRouter = require("./routes/movies");

var app = express();

app.use(logger("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(
  session({
    secret: process.env.secret,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(cookieParser());
app.use(express.static(path.join(__dirname, "public")));

app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, content-type, Accept, x-access-token"
  );
  next();
});

app.get('/oauth/callback', async (req, res) => {
  const { code, state } = req.query; // state contains the user ID

  try {
    const response = await stripe.oauth.token({
      grant_type: 'authorization_code',
      code: code,
    });

    const { stripe_user_id } = response;

    // Store stripe_user_id in Firebase
    var key = "users/" + state;
    let postData = {
      [key + '/stripeAccountId']: stripe_user_id
    };
    await db.ref().update(postData);

    res.redirect('http://localhost:5173/settings/success-stripe');
  } catch (error) {
    console.error('Error in OAuth callback: ', error);
    res.status(500).json({ error: 'Failed in OAuth callback' });
  }
});


app.use("/api/payments", paymentsRouter);
app.use("/api/subscriptions", subscriptionsRouter);
app.use("/api/accounts", accountsRouter);
app.use("/api/movies", moviesRouter);

module.exports = app;
