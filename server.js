var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
// var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var FeedParser = require('./components/feedparser.js');

var index = require('./routes/index');
var reader = require('./routes/reader');
var stream = require('./routes/stream');
var feed = require('./routes/feed');

var models  = require('./models');

var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

/**
 * Normalize a port into a number, string, or false.
 */
function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

server.listen(port);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
if( app.get('env') === 'development' ) app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', index);
app.use('/reader', reader);
app.use('/stream', stream);
app.use('/feed', feed);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// models.sequelize.query('PRAGMA journal_mode = WAL;');

io.on('connection', function (socket) {
  socket.on('getstream', function (data) {
    models.Entry.findAll({
        order: [['date', 'DESC']],
        limit: 500,
        include: [{ model: models.Feed }]
      })
      .then(function(entries) {
        entries.reverse().forEach(function(entry) {
          socket.emit('stream', {
            'feedId': entry.Feed.id,
            'feedFavicon': entry.Feed.favicon,
            'feedTitle': entry.Feed.title,
            'id': entry.id,
            'date': entry.formatedDate,
            'title': entry.title,
            'readed': entry.readed
          });
        });
    });    
  });
});

var feedparser = new FeedParser();

// Init backgroud worker
var worker = function() {
  models.Feed.count().then(function(count) {
    var timeout = count * 200; // 1 feed every 200 msec
    var minTimeout = (5 * 60 * 1000); // 5 min
    if( timeout < minTimeout ) timeout = minTimeout;
    else timeout += (10 * 1000); // +10 sec
    console.log('Timeout set to '+timeout/60/1000+' min');
    feedparser.fetchAll(feedparser, io.sockets);
    setTimeout(worker, timeout);
  });
};
worker();

module.exports = server;
