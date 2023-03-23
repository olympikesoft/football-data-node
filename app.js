var express = require("express");
var path = require("path");
var cookieParser = require("cookie-parser");
var logger = require("morgan");
require("dotenv").config();
const cors = require("cors");
const session = require("express-session");
const passport = require("passport");
const jwt = require("jsonwebtoken");
const DiscordStrategy = require("passport-discord").Strategy;
const DiscordOAuth2 = require("discord-oauth2");
var knex = require("./knex");

/*
require("./schedule/matches")();
require("./schedule/league")();
require("./schedule/squad")();
*/

var indexRouter = require("./routes/index");
var usersRouter = require("./routes/users");
var matchRouter = require("./routes/match");
var teamRouter = require("./routes/team");
var authRouter = require("./routes/auth");
var transferRouter = require("./routes/transfer");
var playerRouter = require("./routes/player");
var squadRouter = require("./routes/squad");
var matchInviteRouter = require("./routes/matchinvite");
var transactionRouter = require("./routes/transactions");
var rankingRouter = require("./routes/ranking");
var leagueRouter = require("./routes/league");

var app = express();
// var server = app.listen(port); socket.io

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
app.use(passport.initialize());
app.use(passport.session());

app.use(express.static(path.join(__dirname, "public")));

// allow requests from a specific origin
app.use(cors({
  origin: 'https://urchin-app-mv3vn.ondigitalocean.app'
}));

// set the Access-Control-Allow-Origin header for all responses
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', 'https://urchin-app-mv3vn.ondigitalocean.app');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
  res.header('Access-Control-Allow-Credentials', true);
  next();
});


const discordOAuth2 = new DiscordOAuth2({
  clientId: process.env.DISCORD_CLIENT_ID,
  clientSecret: process.env.DISCORD_CLIENT_SECRET,
  redirectUri: "http://localhost:9000/auth/discord/callback",
});

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

passport.use(
  new DiscordStrategy(
    {
      clientID: process.env.DISCORD_CLIENT_ID,
      clientSecret: process.env.DISCORD_CLIENT_SECRET,
      callbackURL: "http://localhost:9000/auth/discord/callback",
      scope: ["identify", "email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      const discordUser = await discordOAuth2.getUser(accessToken);
      console.log("discordUser", discordUser);
      const user = {
        id: discordUser.id,
        username: discordUser.username,
        email: discordUser.email,
      };
      done(null, user);
    }
  )
);

app.get("/auth/discord", passport.authenticate("discord"));

app.get(
  "/auth/discord/callback",
  passport.authenticate("discord", {
    failureRedirect: "/login",
  }),
  async (req, res) => {
    const token = jwt.sign(req.user, process.env.secret);
    res.cookie("jwt", token);

    const user = req.user;
    const existingUser = await knex("user")
      .where("discord_id", user.id)
      .first();

    if (existingUser) {
      await knex("user").where("discord_id", user.id).update({
        username: user.username,
        email: user.email,
      });
    } else {
      await knex("user").insert({
        discord_id: user.id,
        username: user.username,
        email: user.email,
      });
    }
    res.redirect("http://localhost:9000");
  }
);

app.get("/api/user", (req, res) => {
  const token = req.cookies.jwt;
  if (!token) {
    return res.sendStatus(401);
  }
  try {
    const user = jwt.verify(token, process.env.secret);
    res.json(user);
  } catch (err) {
    res.sendStatus(401);
  }
});

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/api/match", matchRouter);
app.use("/api/team", teamRouter);
app.use("/api/auth", authRouter);
app.use("/api/transfer", transferRouter);
app.use("/api/player", playerRouter);
app.use("/api/squad", squadRouter);
app.use("/api/match-invite", matchInviteRouter);
app.use("/api/transaction", transactionRouter);
app.use("/api/ranking", rankingRouter);
app.use("/api/league", leagueRouter);

module.exports = app;
