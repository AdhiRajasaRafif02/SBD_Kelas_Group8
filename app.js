var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
const mongoose = require('mongoose');
require('dotenv').config();

var indexRouter = require('./routes/index');
var usersRouter = require('./routes/users');
var coursesRouter = require('./routes/courses');
var progressRouter = require('./routes/progress');
var gradesRouter = require('./routes/grades');
var forumRouter = require('./routes/forum');

var app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI, {
}).then(() => {
  console.log('Connected to CoursEight');
}).catch((err) => {
  console.error('Error connecting to MongoDB:', err);
});

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use("/users", usersRouter);
app.use('/courses', coursesRouter);
app.use('/progress', progressRouter);
app.use('/grades', gradesRouter);
app.use('/forum', forumRouter);

module.exports = app;
