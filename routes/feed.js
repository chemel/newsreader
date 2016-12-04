var models  = require('../models');
var express = require('express');
var router = express.Router();
var sequelize = require('sequelize');
var FeedParser = require('../components/feedparser.js');

router.get('/', function(req, res, next) {

  models.Feed.findAll({order: [['url', 'ASC']]})
    .then(function(feeds) {
	  models.Entry.findAll({
	    attributes: [['feedId', 'id'], [sequelize.fn('COUNT', 'Entries.id'), 'nb']],
   		group: ['feedId'],
   		raw: true
	  })
	.then(function(results) {
	  	var counter = {};
	  	results.forEach(function(result) {
	  		counter[result.id] = result.nb;
	  	});
	    res.render('feed/index', {
	      title: 'Feeds',
	      feeds: feeds,
	      counter: counter
	    });
	  });
  });
});

router.post('/create', function(req, res, next) {

	var feed = models.Feed.build({
	  url: req.body.url.trim()
	});

	feed.save().then(function() {

		var parser = new FeedParser();
		parser.fetch(feed);

		res.redirect('./');
	});
});
router.get('/:id/purge', function(req, res, next) {

	models.Entry.destroy({
		where: {
			feedId: req.params.id
		}
	}).then(function() {
		res.redirect('/feed');
	});
});

router.get('/:id/delete', function(req, res, next) {

	models.Feed.destroy({
		where: {
			id: req.params.id
		}
	}).then(function() {
		res.redirect('/feed');
	});
});

module.exports = router;
