const jwt = require("jsonwebtoken");
const sgMail = require("@sendgrid/mail");

var UserService = require("../User/UserService");
var UserService = new UserService();

var ManagerService = require("../Manager/ManagerService");
var ManagerService = new ManagerService();

var TeamService = require("../Team/TeamService");
var TeamService = new TeamService();

var LeagueService = require("../League/LeagueService");
var LeagueService = new LeagueService();

sgMail.setApiKey(process.env.SENDGRID_API_KEY);

class UserController {
  async login(req, res, next) {
    const email = req.body.email;
    const password = req.body.password;

    try {
      let existUser = await UserService.existUser(email);
      if (existUser) {
        const users = await UserService.login(email, password);
        if (users.id > 0) {
          let path = "/lineup-team";
          let checkTeam = await TeamService.getTeamByUser(users.id);
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
          if (checkTeam.length > 0) {
            users.team = checkTeam[0];
          }
          return res.status(200).json({ user: users, path: path });
        } else {
          return res.status(400).json({ message: "error authentication" });
        }
      } else {
        return res.status(404).json({ message: "not found" });
      }
    } catch (error) {
      if (error) {
        //next(error)
        console.log("error", error);
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
    const name = req.body.name;
    let existUser = await UserService.existUser(email);
    if (existUser) {
      return res.status(404).json({ error: "error already exist account" });
    } else {
      const registerUser = await UserService.register(email, name, password);
      if (registerUser > 0 && registerUser) {
        let obj = { user_id: registerUser };
        const manager = await ManagerService.createManager(obj);
        let userInfo = await UserService.getUser(registerUser);
        if (manager) {
          const token = jwt.sign(
            {
              id: userInfo.user[0].id,
              name: userInfo.user[0].name,
              email: userInfo.user[0].email,
              stars: userInfo.user[0].stars,
              money: userInfo.user[0].money_game,
            },
            process.env.secret,
            {
              expiresIn: 86400,
            }
          );
          let user_content = {
            token: token,
            user: userInfo,
            path: "/create-team",
          };

          const msg = {
            to: email, 
            from: "admin@soccersquadmanager.com",
            subject: "Registration Confirmation",
            html: `
              <html>
                <head>
                  <meta name="viewport" content="width=device-width, initial-scale=1.0">
                  <style>
                    /* Add your responsive styles here */
                  </style>
                </head>
                <body>
                  <h1>Thank you for registering for the football game manager!</h1>
                  <p>Here's some information about the manager:</p>
                  <ul>
                    <li>Manage your football games and teams in one place</li>
                    <li>Create and share schedules with ease</li>
                    <li>Keep track of scores and player stats</li>
                  </ul>
                  <p>We're excited to have you join our community. If you have any questions, please don't hesitate to contact us.</p>
                </body>
              </html>
            `,
          };

          sgMail
            .send(msg)
            .then(() => console.log("Email sent successfully"))
            .catch((error) => console.error(error));

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
