'use strict';
var moment = require('moment');
module.exports = function(sequelize, DataTypes) {
  var Entry = sequelize.define('Entry', {
    feedId: DataTypes.INTEGER,
    date: DataTypes.DATE,
    permalink: DataTypes.STRING,
    title: DataTypes.STRING,
    content: DataTypes.TEXT,
    hash: DataTypes.STRING,
    readed: DataTypes.INTEGER
  }, {
    getterMethods: {
      formatedDate: function()  { return moment(this.date).format('DD/MM HH:mm'); }
    },
    classMethods: {
      associate: function(models) {
        Entry.belongsTo(models.Feed, { foreignKey: 'feedId'})
      }
    }
  });
  return Entry;
};