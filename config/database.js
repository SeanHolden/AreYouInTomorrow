// Database config...

var Sequelize = require("sequelize");
 
function setup(){                                           // DB name,              username, password
  var sequelize = new Sequelize( process.env.DATABASE_URL || 'are_you_in_tomorrow', 'postgres', 'postgres', {
    dialect: 'postgres',
    // host: process.env.DB_HOST || 'localhost',
    port: 5432,
    pool: { maxConnections: 5, maxIdleTime: 30}
  });
  
  return sequelize;
}

module.exports = { 
  setup : setup
};
