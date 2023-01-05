var Knex = require('Knex');

let knex = Knex({
  client: 'mysql',
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