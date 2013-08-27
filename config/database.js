// Database config...

var Sequelize = require("sequelize");
var parseDbUrl = require("parse-database-url");
var dbConfig = parseDbUrl(process.env.HEROKU_POSTGRESQL_COBALT_URL);
console.log(process.env.HEROKU_POSTGRESQL_COBALT_URL);
console.log(dbConfig);
 
function setup(){
  var sequelize = new Sequelize( dbConfig.database, dbConfig.user, dbConfig.password, {
    dialect: 'postgres',
    host: dbConfig.host || 'localhost',
    port: dbConfig.port || 5432,
    pool: { maxConnections: 5, maxIdleTime: 30}
  });
  
  return sequelize;
}

module.exports = { 
  setup : setup
};
