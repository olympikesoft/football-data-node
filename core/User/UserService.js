var knex = require("../../knex");
var functions = require("../../utils/hash");

const jwt = require("jsonwebtoken");
const moment = require("moment");

class UserService {
  async existUser(email) {
    let existUser = false;
    try {
      let user = await knex("user").where("user.email", email);
      if (user.length > 0) {
        existUser = true;
      }
    } catch (error) {
      console.log(error);
    }
    return existUser;
  }

  async register(email, name, mobile_phone, password) {
    let isRegistered = null;
    try {
      const hashedPassword = await functions.hashPassword(password);
      let form = {
        IsValid: "y",
        email,
        name,
        password: hashedPassword,
        avatar_url:
          "https://upload.wikimedia.org/wikipedia/commons/thumb/4/40/Coach_Yelling_Cartoon.svg/1024px-Coach_Yelling_Cartoon.svg.png",
      };

      if (mobile_phone) {
        form.mobile_phone = mobile_phone;
      }

      await knex("user")
        .insert(form)
        .then((result) => {
          if (result) {
            isRegistered = result[0];
          }
        })
        .catch((error) => {
          console.log(error);
        });
    } catch (error) {
      console.log(error);
    }
    return isRegistered;
  }

  async login(email, password) {
    let token = { token: null, id: 0 };
    try {
      const hashedPassword = await functions.hashPassword(password);
      let user = await knex("user")
        .select(["user.id", "user.password", "user.email"])
        .where("user.email", email);
      await functions
        .comparePassword(password, hashedPassword)
        .then((isMatch) => {
          if (isMatch) {
            token = {
              token: jwt.sign(
                { id: user[0].id, name: user[0].name, email: user[0].email },
                process.env.secret,
                {
                  expiresIn: 86400,
                }
              ),
              id: user[0].id,
            };
          }
        });
    } catch (error) {
      console.log(error);
    }
    return token;
  }

  async getUser(user_id) {
    let user = null;
    let userdata = null;
    try {
      user = await knex("user")
        .select("user.Id", "user.name", "user.email", "user.money_game")
        .where("user.Id", "=", user_id);
      if (user.length > 0) {
        userdata = { user };
      }
    } catch (error) {
      console.log(error);
    }
    return userdata;
  }

  async updateUser(user_id, object) {
    let isUpdated = false;
    await knex("user")
      .where("id", user_id)
      .update(object)
      .then((res) => {
        if (res) {
          isUpdated = true;
        }
      })
      .catch((err) => {
        console.log(err);
      });
    return isUpdated;
  }

  async GetInformation(user_id) {
    let user_content = null;

    try {
      user_content = await knex("user")
        .select(
          "user.id",
          "user.name",
          "user.avatar_url",
          "user.stars",
          "user.money_game"
        )
        .where("id", "=", user_id);
    } catch (error) {
      console.error(error);
    }
    return user_content;
  }
}
module.exports = UserService;
