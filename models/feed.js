'use strict';
var url=require('url');
module.exports = function(sequelize, DataTypes) {
  var Feed = sequelize.define('Feed', {
    url: {type: DataTypes.STRING, unique: true, validate: {isUrl: true}},
    title: DataTypes.STRING,
    enabled: DataTypes.INTEGER
  }, {
    getterMethods: {
      hostname: function()  { return url.parse(this.url).hostname },
      favicon: function()  { return 'http://favicon.app.chemel.fr/?url='+this.hostname }
    },
    classMethods: {
      associate: function(models) {
        Feed.hasMany(models.Entry)
      }
    }
  });
  return Feed;
};