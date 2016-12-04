var express = require('express');
var router = express.Router();

router.get('/', function(req, res, next) {
  res.render('stream/index', { title: 'Stream' });
});

module.exports = router;
