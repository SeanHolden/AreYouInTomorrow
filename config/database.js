// Database config...

var Sequelize = require("sequelize");
var parseDbUrl = require("parse-database-url");
var dbConfig = parseDbUrl(process.env.DATABASE_URL || "postgres://postgres:postgres@localhost:5432/are_you_in_tomorrow");
 
function setup(){
  var sequelize = new Sequelize( dbConfig.database, dbConfig.user, dbConfig.password, {
    dialect: 'postgres',
    host: dbConfig.host,
    port: dbConfig.port,
    pool: { maxConnections: 5, maxIdleTime: 30}
  });
  
  return sequelize;
}

module.exports = { 
  setup : setup
};
