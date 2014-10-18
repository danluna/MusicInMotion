var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res) {
  res.render('soundcloud', { title: 'Express' });
});

/* GET development callback.html for SoundCloud */
router.get('/callback.html', function(req, res) {
  res.render('callback');
});

module.exports = router;
