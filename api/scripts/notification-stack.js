var mongoose = require('mongoose');

mongoose.connect('mongodb://' + (process.env.DB_PORT_27017_TCP_ADDR || 'localhost') + '/stacksight-api-dev');

require('../models/stack');
require('../models/app');
require('../models/user');
require('../models/tag');
require('../models/company');
require('../models/notification1');

var Stack = mongoose.model('Stack');
var App = mongoose.model('App');
var Tag = mongoose.model('Tag');
var Company = mongoose.model('Company');
var User = mongoose.model('User');
var Notification = mongoose.model('Notification');

var length = 0,
    countStacks = 0,
    countCompanies = 0;



Notification.find().exec(function (err, notifications) {
    console.log(notifications.length);
    notifications.forEach(function (notification) {
        var arr;
        console.log(notification.locals.link);
        if (notification.locals.link) {
            if (notification.tpl.indexOf('updates') !== -1) {
                arr = notification.locals.link.split('/');
                notification.stack = arr[arr.length - 2];
            } else if (notification.tpl.indexOf('ssl') !== -1) {
                arr = notification.locals.link.split('/');
                notification.stack = arr[arr.length - 1];
            }
            notification.stackName = notification.locals.stack;
            console.log(notification.stackName);
            notification.save(function (err, n) {
                if (err) return console.log(err);
                console.log(notification.locals.link, n.stack);
            });
        }
    });
});