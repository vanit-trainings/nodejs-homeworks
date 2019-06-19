const createError = require('http-errors');
const express = require('express');
const path = require('path');
// var loginedUsersParser = require('loginedUsers-parser');
const logger = require('morgan');

const indexRouter = require('./routes/index');
const loginRouter = require('./routes/Authorization/login');
const bestSellerRouter = require('./routes/lists/bestsellers');
const booksRouter = require('./routes/lists/books');
const crime = require('./routes/lists/crime')
const searchRouter = require('./routes/lists/search')

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(loginedUsersParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);
app.use('/users', loginRouter);
app.use('/bestseller',bestSellerRouter);
app.use('/books',booksRouter);
app.use('/crime',crime);
app.use('/search',searchRouter);
// catch 404 and forward to error handler
app.use((req, res, next) => {
    next(createError(404));
});

// error handler
app.use((err, req, res) => {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});

module.exports = app;
