// Database config...

var Sequelize = require("sequelize");
 
function setup(){
  var sequelize = new Sequelize( process.env.DB_NAME || 'are_you_in_tomorrow', 'root', null, {
    dialect: 'mysql',
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3306,
    pool: { maxConnections: 5, maxIdleTime: 30}
  });
  
  return sequelize;
}

module.exports = { 
  setup : setup
};
