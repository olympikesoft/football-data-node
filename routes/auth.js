const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

const UserController = require("../core/User/UserController");
const userController = new UserController();

router.post("/login", (req, res) => {
  userController.login(req, res);
});

router.post("/register", (req, res) => {
  userController.register(req, res);
});

/*
router.post("/login", function (req, res, next) {
  passport.authenticate("local", (err, user, info) => {
    if (!user) return res.status(404).send({ error: "User not found" });
    if (user.error) return res.status(200).send({ error: "Error on authentication" });
    if (!user.hasTeam) return res.status(400).send({ error: "User not found" });
    let token = user.token;
    let path = user.hasTeam === true ? "/squad" : "/chooseteam";
    delete user["token"];
    return res.status(200).send({ token: token, user: user, path: path });
  })(req, res, next);
});
*/

module.exports = router;

/*

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
}); */