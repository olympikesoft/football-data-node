var knex = require("../../knex");
var functions = require("../../utils/hash");

const jwt = require("jsonwebtoken");
const moment = require("moment");

class UserService {
  async existUser(param, source) {
    let control = false;
    let user = null;
    try {
      if (source === "fb") {
        user = await knex.from("user").where("facebook_Id", param);
      } else {
        user = await knex.from("user").where("email", param);
      }
      if (user !== null && user.length > 0) {
        control = true;
      }
    } catch (error) {
      console.log(error);
    }
    return control;
  }

  async checkPermissionstoAction(user_id, admin) {
    let havePermissions = false;
    try {
      if (admin) {
        havePermissions = true;
      }

      let user = await this.GetInformaton(user_id);
      console.log(user);
      if (user[0]["Id"] === user_id) {
        havePermissions = true;
      }
    } catch (error) {
      console.log(error);
    }
    return havePermissions;
  }

  async register(email, name, mobile_phone, password) {
    let isRegistered = null;
    try {
      const hashedPassword = functions.generateHash(password);
      let form = {
        facebook_id: "no",
        IsValid: "y",
        email: email,
        name: name,
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
    let user = null;
    let user_content = null;
    try {
      const hashedPassword = functions.generateHash(password);

      user = await knex("user")
        .select(["user.id", "user.name", "user.email"])
        .where("email", email)
        .where("password", hashedPassword);

      if (user.length > 0) {
        user_content = {};
        const token = jwt.sign({ id: user[0].id }, process.env.secret, {
          expiresIn: 86400, // expires in 24 hours
        });
        user_content = Object.assign(user_content, {
          token: token,
          user_id: user[0].id,
        });
      }
    } catch (error) {
      console.log(error);
    }
    return user_content;
  }

  async getUser(user_id) {
    let user = null;
    let userdata = null;
    try {
      user = await knex("user")
        .select("user.Id", "user.name", "user.Email")
        .where("user.Id", "=", user_id);
      if (user.length > 0) {
        userdata = { id: user[0].Id, name: user[0].name, Email: user[0].Email };
      }
    } catch (error) {
      console.log(error);
    }
    return userdata;
  }

  async getUserFacebook(facebook_id) {
    let user = null;
    let userdata = null;
    let today = moment().startOf("day");

    try {
      user = await knex("user")
        .select("user.Id", "user.Admin", "user.subscriptionDays")
        .where("user.Facebook_Id", "=", facebook_id);
      if (user.length > 0) {
        let user_content = { user: user[0].Id, Admin: user[0].Admin };
        if (user[0].hasOwnProperty("subscriptionDays")) {
          let date_final = moment(user[0].subscriptionDays, "DD/MM/YYYY");
          if (date_final.isAfter(today)) {
            user_content.hasSubscription = true;
          }
        }

        const token = jwt.sign({ id: user[0].Id }, process.env.secret, {
          expiresIn: 86400, // expires in 24 hours
        });
        userdata = Object.assign(user_content, { token: token });
      }
    } catch (error) {
      console.log(error);
    }
    return userdata;
  }

  async UpdateUser(user_id, object) {
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
