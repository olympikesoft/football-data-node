var knex = require("../../knex");

class ManagerService {
  async getManagerbyId(id) {
    let manager_details = null;
    try {
      let q = await knex
        .select(["user.name", "user.id", "user.avatar_url"])
        .from("manager")
        .where("manager.id", id)
        .leftJoin("user", "user.id", "manager.user_id")
      if (q != undefined) {
        manager_details = q[0];
      }
    } catch (error) {
      console.log(error);
    }
    return manager_details;
  }

  async getUserByManagerId(manager_id){
    let user = null;
    try {
      let q = await knex
        .select(["user.name", "user.email", "user.id", "user.avatar_url"])
        .from("manager")
        .where("manager.id", manager_id)
        .leftJoin("user", "user.id", "manager.user_id")
      if (q != undefined) {
        user = q[0];
      }
    } catch (error) {
      console.log(error);
    }
    return user;
  }

  async checkManagerbyUser(id) {
    let manager_details = null;
    try {
      let q = await knex
        .select(["manager.id"])
        .from("manager")
        .where("manager.user_id", id)
        .leftJoin("user", "user.id", "manager.user_id")
      if (q != undefined) {
        manager_details = q[0];
      }
    } catch (error) {
      console.log(error);
    }
    return manager_details;
  }

  async getManagerbyUserId(id) {
    let manager_details = null;
    try {
      let q = await knex
        .select(["manager.id"])
        .from("manager")
        .where("manager.user_id", id)
        .leftJoin("user", "user.id", "manager.user_id")
      if (q != undefined) {
        manager_details = q[0];
      }
    } catch (error) {
      console.log(error);
    }
    return manager_details;
  }

  async getTeamReportbyTeamId(id, season_id) {
    let manager_details = null;
    try {
      let q = await knex
        .select([
          "team.*",
          "formation.name as formation_name",
          "team_reports.*",
        ])
        .from("team_reports")
        .where("team_reports.team_id", id)
        .where("season.id", season_id)
        .leftJoin("team", "team.id", "team_reports.team_id")
        .leftJoin("season", "season.id", "team_reports.season_id")
        .leftJoin("formation", "formation.id", "team_reports.Formation_id");

      if (q != undefined) {
        manager_details = q[0];
      }
    } catch (error) {
      console.log(error);
    }
    return manager_details;
  }

  async CheckManagerExist(user_id) {
    let exist = false;
    let CurrentYear = new Date().getFullYear();

    try {
      let q = await knex
        .from("manager")
        .where("manager.user_id", user_id)
        .where("season.year", CurrentYear)
        .leftJoin("user", "user.id", "manager.user_id")
        .leftJoin("season", "season.id", "manager.season_id");

      if (q) {
        exist = true;
      }
    } catch (error) {
      console.log(error);
    }
    return exist;
  }

  async createManager(object) {
    let isCreated = false;
    try {
      await knex("manager")
        .insert(object)
        .then((result) => {
          if (result) {
            isCreated = true;
          }
        });
    } catch (error) {
      console.log(error);
    }
    return isCreated;
  }

  async updateManager(object, manager_id) {
    let hasUpdated = false;
    try {
      await knex
        .from("team_reports")
        .where({ manage_id: manager_id })
        .update(object)
        .then((res) => {
          if (res) {
            hasUpdated = true;
          }
        });
    } catch (error) {
      console.log(error);
    }
    return hasUpdated;
  }
}

module.exports = ManagerService;
