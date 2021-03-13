var express = require('express');
var router = express.Router();
const ground = global.ground;

/* GET all todos. */
router.get('/', async function (req, res, next) {
  try {
    const response = await ground.Todo.get();
    res.send(response.data.data);
  } catch (error) {
    res.status(400).send(error);
  }
});

module.exports = router;
