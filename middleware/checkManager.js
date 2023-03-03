var ManagerService = require("../core/Manager/ManagerService");
var ManagerService = new ManagerService();

const verifyHasManager = async (req, res, next) => {
  let user_id = req.user.id;
  console.log(user_id, 'user_id');
  let control = await ManagerService.checkManagerbyUser(user_id);
  if (!control) {
    return res
      .status(403)
      .send({ auth: false, message: "No manager available" });
  } else {
    next();
  }
};
module.exports = verifyHasManager;