var models  = require('../models');
var express = require('express');
var router = express.Router();
var sequelize = require('sequelize');

router.get('/', function(req, res, next) {

  models.Feed.findAll({order: [['title', 'ASC']]}).then(function(feeds) {
    res.render('reader/index', {
      title: 'Reader',
      feeds: feeds
    });
  });
});

router.get('/counter', function(req, res, next) {

  models.Entry.findAll({
    attributes: [['feedId', 'id'], [sequelize.fn('COUNT', 'id'), 'unreads']],
    where: {readed: 0},
    group: ['feedId']
  }).then(function(results) {
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify({'unreads': results}));
  });
});

router.post('/entries/:id', function(req, res, next) {

  models.Entry.findAll({
      where: {feedId: req.params.id},
      order: [['date', 'DESC']]
    })
    .then(function(entries) {
      res.render('reader/entries', {
        entries: entries
      });
  });
});

router.post('/entry/:id', function(req, res, next) {

  models.Entry.findOne({where: {id: req.params.id}}).then(function(entry) {
    entry.readed = 1;
    entry.save();
    res.render('reader/entry', {
      entry: entry
    });
  });
});

router.post('/read/:id', function(req, res, next) {

  models.Entry.update({
    readed: 1,
  }, {
    where: {
      feedId: req.params.id
    }
  })
  .then(function() {
    res.sendStatus(200);
  });
});

module.exports = router;
