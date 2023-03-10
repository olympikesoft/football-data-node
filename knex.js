var Knex = require('knex');

let knex = Knex({
  client: 'mysql2',
  debug: true,
  connection: {
    'host': process.env.DB_HOST,
    'user': process.env.DB_USER,
    'database': process.env.DB_DATABASE,
    'password': process.env.DB_PASSWORD,
  },
  pool: {
    min: 0, max: 7,
  }
})

module.exports = knex;