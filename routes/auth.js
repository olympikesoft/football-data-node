const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");
const passport = require("passport");

var UserController  = require('../core/User/UserController')
const userControll = new UserController();


router.post("/register/user", (req, res, next) =>
  userControll.Register(req, res, next)
);

router.post("/email", function (req, res, next) {
  passport.authenticate("local", function (err, user, info) {
    if (user !== undefined) {
      if (user.error) {
        res.status(200).send({ error: "Error on authentication" });
      }
      if (user.hasTeam != null) {
        let token = user.token;
        delete user["token"];
        if (user.hasTeam === true) {
          return res
            .status(200)
            .send({ token: token, user: user, path: "/squad" });
        } else {
          return res
            .status(200)
            .send({ token: token, user: user, path: "/chooseteam" });
        }
      } else {
        return res.status(400).send({ error: "User not found" });
      }
    } else {
      res.status(404).send({ error: "User not found" });
    }
  })(req, res, next);
});

router.get("/success", function (req, res) {
  let user = req.user;
  if (err) {
    console.log(err);
  }
  if (user !== undefined) {
    if (user.error) {
      res.status(200).send({ error: "Error on authentication" });
    }
    if (user.hasSubscription !== undefined) {
      res.status(200).send({ token: user.token, admin: true });
    } else {
      res.status(200).send({ token: user.token, admin: false });
    }
  } else {
    res.status(200).send({ error: "User not found" });
  }
});

router.get("/error", function (req, res) {
  res.status(400).json({ message: "error" });
});

router.get("/get/user", checkAuth, (req, res, next) =>
  userControll.GetUser(req, res, next)
);

router.get("/me", function (req, res) {
  var token = req.headers["x-access-token"];
  if (!token)
    return res.status(401).send({ auth: false, message: "No token provided." });

  jwt.verify(token, keys.secret, function (err, decoded) {
    if (err)
      return res
        .status(500)
        .send({ auth: false, message: "Failed to authenticate token." });

    res.status(200).send(decoded);
  });
});

module.exports = router;
