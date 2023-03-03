var ManagerService = require("../core/Manager/ManagerService");
var ManagerService = new ManagerService();
const jwt = require("jsonwebtoken");

const verifyHasManager = async (req, res, next) => {
  var token = req.headers['x-access-token'];
  let tokenId = null;
  
  jwt.verify(token, process.env.secret, (err, decoded) => {
   tokenId = decoded.id
  });

  let control = await ManagerService.checkManagerbyUser(tokenId);
  if (!control) {
    return res
      .status(403)
      .send({ auth: false, message: "No manager available" });
  } else {
    next();
  }
};
module.exports = verifyHasManager;