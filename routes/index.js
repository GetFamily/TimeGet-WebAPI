var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { title: 'TimeGet - WebAPI, WebServer and data collector of timeget' });
});

/* GET test aliveness. */
router.get('/test', function (req, res, next) {
  res.send({
    date: new Date(),
    message: 'I am alive.',
  });
});

module.exports = router;
