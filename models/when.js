// When model
// Attributes => id:int, date:date, userId:int, areYouIn:string, createdAt:date, updatedAt:date

module.exports = function(sequelize, DataTypes) {
  return sequelize.define('When', {
    date: { 
      type: DataTypes.DATE,
      validate: {
        notNull: true
      }
    },
    areYouIn: {
      type: DataTypes.STRING,
      validate: {
        notNull: true
      }
    }
  });
}
