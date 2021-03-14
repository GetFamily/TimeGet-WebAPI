var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');

const models = require('./models');
const groundFactory = require('./lib/ground');
global.ground = groundFactory(models);

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var todosRouter = require('./routes/todos');
var occasionsRouter = require('./routes/occasions');

var app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// app.get("/", function (req, res) {
//     res.send("Hello Worlxxxxd!");
// });
app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/todos', todosRouter);
app.use('/occasions', occasionsRouter);

// This is REQUIRED for IISNODE to work
if (process.env.PORT) {
  app.listen(process.env.PORT, () => {
    console.log(`listening on ${process.env.PORT}`);
  });
}

module.exports = app;
