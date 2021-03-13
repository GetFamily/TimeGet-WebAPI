var express = require('express');
var router = express.Router();

const mockUsers = [
  {
    name: 'ali',
    last: 'alizaadeh',
  },
  {
    name: 'rezaa',
    last: 'rezaazaadeh',
  },
];

/* GET users listing. */
router.get('/', function (req, res, next) {
  res.send(mockUsers);
});

module.exports = router;
