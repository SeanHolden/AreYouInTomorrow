// User model
// Attributes => id:int, firstName:string, lastName:string, msisdn:string, token:text, shortUrl:string createdAt:date, updatedAt:date

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('User', {
    firstName: { 
      type: DataTypes.STRING,
      validate: {
        notNull: true
      }
    },
    lastName: { 
      type: DataTypes.STRING,
      validate: {
        notNull: true
      }
    },
    msisdn: {
      type: DataTypes.STRING,
      validate: {
        notNull: true
      }
    },
    token: {
      type: DataTypes.TEXT
    },
    shortUrl: {
      type: DataTypes.STRING
    }
  });
}
