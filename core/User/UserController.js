var UserService = require("../User/UserService");
var UserService = new UserService();

var ManagerService = require("../Manager/ManagerService");
var ManagerService = new ManagerService();

var SeasonService = require("../Season/SeasonService");
var SeasonService = new SeasonService();

var TeamService = require("../Team/TeamService");
var TeamService = new TeamService();
const jwt = require("jsonwebtoken");

class UserController {
  async Login(req, res, next) {
    const email = req.body.Email;
    const password = req.body.Password;

    try {
      let existUser = await UserService.existUser(email);

      if (existUser) {
        const users = await UserService.login(email, password);
        if (users) {
          res.cookie("auth", users);

          return res.status(200).json({ user: users });
        } else {
          return res.status(400).json({ error: "error authentication" });
        }
      } else {
        return res.status(404).json({ message: "not found" });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async GetUser(req, res, next) {
    const user_id = req.user.id;

    try {
      let existUser = await UserService.checkPermissionstoAction(user_id);

      if (existUser) {
        const users = await user.GetInformaton(user_id);
        if (users) {
          return res.status(200).json({ UserService: users });
        } else {
          return res.status(404).json({ error: "error authentication" });
        }
      } else {
        return res.status(404).json({ message: "not found " });
      }
    } catch (error) {
      console.log(error);
    }
  }

  async Register(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;
    const mobile_phone = req.body.mobile_phone;
    const name = req.body.name;

    let CurrentYear = new Date().getFullYear();

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
        let season_id = await SeasonService.getSeasonByYEAR(CurrentYear);

        let obj = { user_id: registerUser, season_id: season_id };

        const manager = await ManagerService.CreateManager(obj);

        let user_content_detail = await UserService.getUser(registerUser);

        if (manager) {
          const token = jwt.sign(
            { id: user_content_detail.id },
            process.env.secret,
            {
              expiresIn: 86400, // expires in 24 hours
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

  async RegisterFB(form) {
    //const data = request.post()
    const id = form.id;
    const source = "fb";

    let existUser = await UserService.existUser(id, source);
    if (existUser) {
      return res.status(404).json({ error: "error already exist account" });
    } else {
      const registerUser = await UserService.registerGeneric(form);

      if (registerUser) {
        return res.status(200).json({ message: "sucess register" });
      }
      return res.status(404).json({ error: "error register" });
    }
  }

  async RegisterIp(req, res, next) {
    //const data = request.post()
    const ip = ip.address();

    let existUser = await UserService.existUser(email, ip);
    if (existUser) {
      return response.status(404).json({ error: "error authentication" });
    } else {
      const registerUser = await UserService.register(null, null, ip);

      if (registerUser) {
        return response.status(200).json({ message: "sucess register" });
      }
      return response.status(404).json({ error: "error register" });
    }
  }

  async UpdateUser(req, res, next) {
    var data = req.body;

    let existUser = await UserService.existUser(data.Email);
    if (existUser) {
      return res.status(404).json({ error: "error user don`t exist" });
    } else {
      const UpdateUser = await UserService.UpdateUser(data);

      if (UpdateUser) {
        return response.status(200).json({ message: "sucess update user" });
      }
      return response.status(404).json({ error: "error updating user" });
    }
  }
}

module.exports = UserController;
