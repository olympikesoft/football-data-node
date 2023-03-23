var Knex = require('knex');

let knex = Knex({
  client: 'mysql2',
  debug: true,
  connection: {
    'host': process.env.MYSQL_HOST,
    'user': process.env.MYSQL_USER,
    'database': process.env.MYSQL_DATABASE,
    'password': process.env.MYSQL_PASSWORD,
  },
  pool: {
    min: 0, max: 7,
  }
})

module.exports = knex;