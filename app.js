var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
require('dotenv').config()

//require('./schedule/players')();
//require('./schedule/transfers')();
require('./schedule/matches')();


var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var matchRouter = require('./routes/match');
var teamRouter = require('./routes/team');
var authRouter = require('./routes/auth');
var transferRouter = require('./routes/transfer');
var playerRouter = require('./routes/player');
var squadRouter = require('./routes/squad');

const port = 9000;

var app = express();
// var server = app.listen(port); socket.io

app.listen(port, () => {
    console.log(`App listening at http://localhost:${port}`)
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/api/match', matchRouter);
app.use('/api/team', teamRouter);
app.use('/api/auth', authRouter);
app.use('/api/transfer', transferRouter);
app.use('/api/player', playerRouter);
app.use('/api/squad', squadRouter);

module.exports = app;
