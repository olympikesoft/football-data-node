var UserService = require("../User/UserService");
var UserService = new UserService();
var ManagerService = require("../Manager/ManagerService");
var ManagerService = new ManagerService();
const jwt = require("jsonwebtoken");

class UserController {
 
  async login(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;

    try {
      let existUser = await UserService.existUser(email);
      if (existUser) {
        const users = await UserService.login(email, password);
        if (Object.keys(users).length > 0) {
          return res.status(200).json({ user: users });
        } else {
          return res.status(400).json({ message: "error authentication" });
        }
      } else {
        return res.status(404).json({ message: "not found" });
      }
    } catch (error) {
      if (error) {
        next(error)
      }
    }
  }

  /*
  async getUser(req, res, next) {
    const user_id = req.user.id;

    try {
      let existUser = await this.UserService.checkPermissionstoAction(user_id);

      if (existUser) {
        const users = await this.UserService.GetInformaton(user_id);
        if (users) {
          return res.status(200).json({ UserService: users });
        } else {
          return this.sendErrorResponse(res, 404, "error authentication");
        }
      } else {
        return this.sendErrorResponse(res, 404, "not found");
      }
    } catch (error) {
      console.log(error);
      return this.sendErrorResponse(res, 500, "error");
    }
  }*/

  async register(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    const mobile_phone = req.body.mobile_phone;
    const name = req.body.name;
    let existUser = await UserService.existUser(email);
    if (existUser) {
      return res.status(404).json({ error: "error already exist account" });
    } else {
      const registerUser = await UserService.register(
        email,
        name,
        mobile_phone,
        password
      );
      if (registerUser > 0 && registerUser) {
        let obj = { user_id: registerUser };
        const manager = await ManagerService.createManager(obj);
        let user_content_detail = await UserService.getUser(registerUser);
        if (manager) {
          const token = jwt.sign(
            { id: user_content_detail.id },
            process.env.secret,
            {
              expiresIn: 86400,
            }
          );
          let user_content = {
            token: token,
            user: user_content_detail,
            path: "/chooseteam",
          };
          return res.status(200).json(user_content);
        } else {
          return res.status(404).json({ error: "error creating manager" });
        }
      }
      return res.status(404).json({ error: "error register" });
    }
  }
}

module.exports = UserController;
