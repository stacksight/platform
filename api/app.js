var express = require('express');
var expressValidator = require('express-validator');
var path = require('path');
var favicon = require('static-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var config = require(process.cwd() + '/config');

var routes = require('./routes/index'),
 adminRoutes = require('./routes/admin')
 cmdRoutes = require('./routes/cmd'),
 thirdPartyRoutes = require('./routes/3rd-party'),
 baseUrl = config.baseUrl;

if (!config.log) {
    console.log = function() {};
    console.error = function() {};
}
if (config.log) require('console-stamp')(console);



// require('look').start();

var app = express();

app.use(favicon());
app.use(logger('combined'));
app.use(bodyParser.json({ limit: '3mb' }));
app.use(bodyParser.urlencoded());
app.use(expressValidator());
app.use(cookieParser());

// app.use(function(req, res, next) {
//     if (req.body) console.log('---------- APP ID ---------', req.body.appId);
//     return next();
// });


app.use(express.static(path.join(__dirname, 'public')));

app.use(baseUrl, routes);
app.use(baseUrl, thirdPartyRoutes);
app.use(baseUrl + '/admin', adminRoutes);
app.use(baseUrl + '/cmd/:service', cmdRoutes);

/// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

/// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.send({
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.send({
        message: err.message,
        error: {}
    });
});


module.exports = app;
