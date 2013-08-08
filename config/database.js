// Database config...
var Sequelize = require("sequelize");

function DB(){
 
  function setup(){
    var sequelize = new Sequelize('are_you_in_tomorrow', 'root', null, {
      dialect: 'mysql',
      host: process.env.DB_HOST || 'localhost',
      port: process.env.DB_PORT || 3306,
      pool: { maxConnections: 5, maxIdleTime: 30}
    });

    return sequelize;
  }

  return { 
    setup : setup 
  };
}

module.exports = DB;