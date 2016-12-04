'use strict';

var models  = require('../models');
var FeedParser = require('feedparser');
var request = require('request');
var crypto = require('crypto');

function FeedParser() {
}

FeedParser.prototype.fetch = function(feed, sockets) {

  var req = request({
    url: feed.url,
    headers: {
      // 'User-Agent': 'node-rss-reader (https://github.com/chemel/node-rss-reader)',
      'User-Agent': 'Mozilla/5.0 (Windows NT 6.1; WOW64; rv:50.0) Gecko/20100101 Firefox/50.0',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
      'Accept-Language': 'fr,fr-FR;q=0.8,en-US;q=0.5,en;q=0.3',
      'Accept-Encoding': 'gzip, deflate',
      'DNT': '1',
      'Connection': 'keep-alive',
      'Upgrade-Insecure-Requests': '1',
    },
    gzip: true,
    strictSSL: false
  });

  var feedparser = new FeedParser();

  req.on('error', function (error) {

    console.log('[ERROR] error requesting this feed: '+feed.url);
  });

  req.on('response', function (res) {

    var stream = this;

    if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));

    stream.pipe(feedparser);
  });

  feedparser.on('error', function(error) {

    console.log('[ERROR] error parsing this feed; '+feed.url);
  });

  feedparser.on('readable', function() {

    var stream = this, item;

    while (item = stream.read()) {

        var hash = crypto.createHash('md5').update(item.link+item.title+item.description).digest('hex');

        var entry = models.Entry.findOrCreate({where: {
            feedId: feed.id,
            hash: hash
        }, defaults: {
            date: (item.date ? item.date : new Date()),
            permalink: item.link,
            title: item.title,
            content: item.description,
            readed: 0
        }}).catch(function(err) {
          console.log('[ERROR] Insert fail: '+err);
        });

        if(sockets) {
          entry.spread(function(item, created) {
            if(created) {
              sockets.emit('stream', {
                'feedId': feed.id,
                'feedFavicon': feed.favicon,
                'feedTitle': feed.title,
                'id': item.id,
                'date': item.formatedDate,
                'title': item.title
              });
            }
          })
        }
      }
  });

  feedparser.on('meta', function (meta) {

    feed.title = this.meta.title;
    feed.changed('updatedAt', true);
    feed.save();
  });

  feedparser.on('end', function() {
  });
};

FeedParser.prototype.fetchAll = function(parser, sockets) {

  var timeout = 0;

  models.Feed.findAll({order: [['updatedAt', 'ASC']]}).then(function(feeds) {
    feeds.forEach(function(feed) {
      setTimeout(function() {
          console.log(new Date().toISOString().replace(/T/, ' ').replace(/\..+/, '') +' ' + '[GET] ' + feed.url);
          parser.fetch(feed, sockets);
      }, timeout);

      timeout+=200;
    });
  });
};

module.exports = FeedParser;
