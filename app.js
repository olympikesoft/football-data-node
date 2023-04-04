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

require("./schedule/matches")();
require("./schedule/league")();
require("./schedule/squad")();

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

var UserService = require("./core/User/UserService");
var UserService = new UserService();

var ManagerService = require("./core/Manager/ManagerService");
var ManagerService = new ManagerService();

var TeamService = require("./core/Team/TeamService");
var TeamService = new TeamService();

var LeagueService = require("./core/League/LeagueService");
var LeagueService = new LeagueService();


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

app.use(cors());

app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, content-type, Accept, x-access-token"
  );
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

      let userInfo = await UserService.getUserByDiscord(discordUser.id);

      if (!userInfo) {
      const registerUser = await UserService.registerDiscord(
        discordUser.email,
        discordUser.username,
        discordUser.id,
        discordUser.username,
        `https://cdn.discordapp.com/avatars/${discordUser.id}/${discordUser.avatar}.png`
      );
        let obj = { user_id: registerUser };
        await ManagerService.createManager(obj);
        let user = await UserService.getUser(registerUser);
        const token = jwt.sign(
          {
            id: user.user[0].id,
            name: user.user[0].name,
            email: user.user[0].email,
            stars: user.user[0].stars,
            money: user.user[0].money_game,
            avatar_url: user.user[0].avatar_url,
          },
          process.env.secret,
          {
            expiresIn: 86400,
          }
        );
        let user_content = {
          token: token,
          user: user.user,
          path: "/create-team",
        };
        return done(null, user_content);
      } else {
        const token = jwt.sign(
          {
            id: userInfo.user[0].id,
            name: userInfo.user[0].name,
            email: userInfo.user[0].email,
            stars: userInfo.user[0].stars,
            money: userInfo.user[0].money_game,
            avatar_url: user.user[0].avatar_url,
          },
          process.env.secret,
          {
            expiresIn: 86400,
          }
        );
        let path = "/lineup-team";
        let checkTeam = await TeamService.getTeamByUser(userInfo.user[0].id);
        if (checkTeam.length === 0) {
          path = "/create-team?step=1"; // create-team
        }
        if (checkTeam.length > 0) {
          let teamHasLeague = await LeagueService.getTeamLeagues(
            checkTeam[0].id
          );

          if (teamHasLeague.length === 0) {
            path = "/create-team?step=2";
          } else {
            let league = await LeagueService.getLeagueById(
              teamHasLeague[0].league_id
            );
            if (league[0].status === 2) {
              path = "/create-team?step=2";
            }
          }
        }
        let user_content = {
          token: token,
          user: userInfo,
          path: path,
        };
        return done(null, user_content);
      }
    }
  )
);

app.get('/auth/discord', passport.authenticate('discord'));
app.get('/auth/discord/callback',
    passport.authenticate('discord', { failureRedirect: '/' }),
    function(req, res) {
        res.json(req.user);
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
